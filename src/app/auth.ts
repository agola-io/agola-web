import {
  useAsyncState,
  useLocalStorage,
  useSessionStorage,
} from '@vueuse/core';
import log from 'loglevel';
import { TypedJSON } from 'typedjson';
import { computed, inject, InjectionKey, nextTick, ref, Ref, watch } from 'vue';
import { LocationQuery, Router } from 'vue-router';
import { execIfNotRunning } from '../util/function';
import {
  API,
  ApiError,
  AuthorizeResponse,
  AuthType,
  LoginUserResponse,
  PrivateUserResponse,
  RegisterUserResponse,
  UserInfo,
} from './api';

const LOGIN_RETURN_PATH = 'login_return_path';
const JWT_TOKEN = 'jwt_token';

interface LogoutOptions {
  goToLogin?: boolean;
}

interface RegisterUser {
  remoteUserInfo: UserInfo;
  remoteSourceName: string;
  remoteSourceLoginName?: string;
  remoteSourceLoginPassword?: string;
}

export interface Auth {
  isReady: Ref<boolean>;
  error: Ref<Error | undefined>;
  authenticated: Ref<boolean>;
  registerUser: Ref<RegisterUser | undefined>;
  user: Ref<PrivateUserResponse | undefined>;
  token: Ref<string | undefined>;

  refresh(): Promise<void>;
  setLoginReturnPath(path?: string): void;
  logout(options?: LogoutOptions): Promise<void>;
  login(
    remoteSourceName: string,
    remoteLoginName?: string,
    remoteLoginPassword?: string
  ): Promise<void>;

  authorize(
    remoteSourceName: string,
    remoteLoginName?: string,
    remoteLoginPassword?: string
  ): Promise<void>;

  register(
    remoteSourceName: string,
    username: string,
    remoteLoginName?: string,
    remoteLoginPassword?: string
  ): Promise<void>;

  oauth2(query: LocationQuery): Promise<void>;
}

export function newAuth(inRouter: Router, inAPI: API): Auth {
  const router = inRouter;
  const api = inAPI;

  const isReady = ref(false);
  const error = ref<Error>();

  const registerUser: Ref<RegisterUser | undefined> = ref(undefined);

  const user = ref<PrivateUserResponse>();

  const updateUser = async () => {
    try {
      const userRes = await api.getAuthUser();
      user.value = userRes;
    } catch (e) {
      user.value = undefined;
      if (e instanceof ApiError) {
        if (e.code === 'unauthorized') {
          await logout();
        }
      }
    }
  };

  const refresh = execIfNotRunning(async () => {
    error.value = undefined;
    try {
      await updateUser();
    } catch (e) {
      log.error(e);
      if (e instanceof Error) {
        error.value = e;
      }
    }
  });

  const { isReady: fetched } = useAsyncState(
    nextTick(() => refresh()),
    undefined
  );

  watch(
    fetched,
    (newFetched: boolean) => {
      isReady.value = newFetched;
    },
    { immediate: true }
  );

  const token = useLocalStorage<string | null>(JWT_TOKEN, null);

  const setToken = (t?: string) => {
    token.value = t;
  };

  const loginReturnPath = useSessionStorage<string | null>(
    LOGIN_RETURN_PATH,
    null
  );

  const setLoginReturnPath = (path?: string) => {
    loginReturnPath.value = path;
  };

  const authenticated = computed(() => {
    return !!user.value;
  });

  const logout = async (options: LogoutOptions = {}) => {
    const { goToLogin = false } = options;

    if (!isReady.value) {
      return;
    }

    user.value = undefined;
    token.value = undefined;

    if (goToLogin) {
      setLoginReturnPath(router.currentRoute.value.fullPath);
      await router.replace('/login');
    } else {
      await router.replace('/');
    }
  };

  const oauth2 = async (query: LocationQuery) => {
    const qcode = query.code;
    const qstate = query.state;

    const code = qcode && typeof qcode === 'string' ? qcode : undefined;
    const state = qstate && typeof qstate === 'string' ? qstate : undefined;

    if (!code || !state) {
      throw new Error('oauth2 missing code or state');
    }

    try {
      const res = await api.oauth2(code, state);

      if (res.requestType === AuthType.LoginUser) {
        if (!res.response) {
          throw new Error('no response');
        }
        const response = TypedJSON.parse(res.response, LoginUserResponse);

        await handleLoginResponse(response);
      } else if (res.requestType === AuthType.Authorize) {
        if (!res.response) {
          throw new Error('no response');
        }
        const response = TypedJSON.parse(res.response, AuthorizeResponse);

        await handleAuthorizeResponse(response);

        router.replace('/register');
      } else if (res.requestType === AuthType.RegisterUser) {
        if (!res.response) {
          throw new Error('no response');
        }
        const response = TypedJSON.parse(res.response, RegisterUserResponse);

        await handleRegisterResponse(response);

        router.replace('/register');
      } else if (res.requestType === AuthType.CreateUserLA) {
        router.replace({
          name: 'user settings',
          params: { username: user.value?.username },
        });
      }
    } catch (e) {
      log.error(e);

      throw e;
    }
  };

  const login = async (
    remoteSourceName: string,
    remoteLoginName?: string,
    remoteLoginPassword?: string
  ): Promise<void> => {
    try {
      const res = await api.login(
        remoteSourceName,
        remoteLoginName,
        remoteLoginPassword
      );
      return handleLoginResponse(res);
    } catch (e) {
      log.error(e);
      throw e;
    }
  };

  const handleLoginResponse = async (
    res: LoginUserResponse | undefined
  ): Promise<void> => {
    if (!res) return;

    if (res.token) {
      setToken(res.token);
    }

    await refresh();

    if (loginReturnPath.value != undefined) {
      await router.replace(loginReturnPath.value);
      loginReturnPath.value = undefined;
    } else {
      await router.replace('/');
    }
  };

  const authorize = async (
    remoteSourceName: string,
    remoteLoginName?: string,
    remoteLoginPassword?: string
  ): Promise<void> => {
    try {
      const res = await api.authorize(
        remoteSourceName,
        remoteLoginName,
        remoteLoginPassword
      );

      return handleRegisterResponse(res);
    } catch (e) {
      log.error(e);
      throw e;
    }
  };

  const handleAuthorizeResponse = async (
    res: AuthorizeResponse | undefined,
    remoteLoginName?: string,
    remoteLoginPassword?: string
  ): Promise<void> => {
    if (!res) return;

    registerUser.value = {
      remoteUserInfo: res.remoteUserInfo,
      remoteSourceName: res.remoteSourceName,
      remoteSourceLoginName: remoteLoginName,
      remoteSourceLoginPassword: remoteLoginPassword,
    };
  };

  const register = async (
    remoteSourceName: string,
    username: string,
    remoteLoginName?: string,
    remoteLoginPassword?: string
  ): Promise<void> => {
    try {
      const res = await api.register(
        remoteSourceName,
        username,
        remoteLoginName,
        remoteLoginPassword
      );
      return handleRegisterResponse(res);
    } catch (e) {
      log.error(e);
      throw e;
    }
  };

  const handleRegisterResponse = async (
    res: RegisterUserResponse | undefined
  ): Promise<void> => {
    if (!res) return;
  };

  return {
    isReady,
    error,
    authenticated,
    registerUser,
    user,
    token: computed(() => token.value ?? undefined),

    refresh,
    setLoginReturnPath,
    logout,
    login,
    authorize,
    register,
    oauth2,
  };
}

export const AuthInjectionKey: InjectionKey<Auth> = Symbol();

export function useAuth(): Auth {
  const auth = inject(AuthInjectionKey);
  if (!auth) {
    throw new Error('could not get auth');
  }

  return auth;
}
