import { useAsyncState, useIntervalFn, useSessionStorage } from '@vueuse/core';
import { useCookies } from '@vueuse/integrations/useCookies';
import log from 'loglevel';
import { TypedJSON } from 'typedjson';
import { InjectionKey, Ref, computed, inject, ref, watch } from 'vue';
import { LocationQuery, Router } from 'vue-router';
import { execIfNotRunning } from '../util/function';
import {
  API,
  AuthType,
  AuthorizeResponse,
  LoginUserResponse,
  PrivateUserResponse,
  RegisterUserResponse,
  UserInfo,
} from './api';

const LOGIN_RETURN_PATH = 'login_return_path';
const SECONDARYSESSION_COOKIE_NAME = 'secondarysession';

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

  const cookies = useCookies([], {
    autoUpdateDependencies: true,
  });

  const updateUser = async () => {
    try {
      const userRes = await api.getAuthUser();
      user.value = userRes;
    } catch (e) {
      user.value = undefined;
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

  const { isReady: fetched } = useAsyncState(refresh(), undefined);

  watch(
    fetched,
    (newFetched: boolean) => {
      isReady.value = newFetched;
    },
    { immediate: true }
  );

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

    // remove secondary session cookie
    cookies.set(SECONDARYSESSION_COOKIE_NAME, undefined, {
      path: '/',
      expires: new Date(0),
    });

    user.value = undefined;

    if (goToLogin) {
      setLoginReturnPath(router.currentRoute.value.fullPath);
    }

    if (!isReady.value) {
      return;
    }

    if (goToLogin) {
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

  useIntervalFn(() => {
    if (!user.value) return;

    const sc = cookies.get(SECONDARYSESSION_COOKIE_NAME);
    if (!sc) {
      logout();
    }
  }, 10000);

  watch(
    () => cookies.get(SECONDARYSESSION_COOKIE_NAME),
    (sc) => {
      if (!user.value) return;

      if (!sc) {
        logout();
      }
    },
    { immediate: true }
  );

  return {
    isReady,
    error,
    authenticated,
    registerUser,
    user,

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
