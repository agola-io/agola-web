import _ from 'lodash';
import 'reflect-metadata';
import {
  IJsonMemberOptions,
  jsonArrayMember,
  jsonMember,
  jsonObject,
  Serializable,
  TypedJSON,
} from 'typedjson';
import { inject, InjectionKey } from 'vue';
import { Auth } from './auth';

export const GITHUB_API_URL = 'https://api.github.com';
export const GITHUB_SSH_KEY =
  'github.com ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCj7ndNxQowgcQnjshcLrqPEiiphnt+VTTvDP6mHBL9j1aNUkY4Ue1gvwnGLVlOhGeYrnZaMgRK6+PKCUXaDbC7qtbW8gIkhL7aGCsOr/C56SJMy/BCZfxd1nWzAOxSDPgVsmerOBYfNqltV9/hWCqBywINIR+5dIg6JTJ72pcEpEjcYgXkE2YEFXV1JHnsKgbLWNlhScqb2UmyRkQyytRLtL+38TGxkxCflmO+5Z8CSSNY7GidjMIZ7Q4zMjA2n1nGrlTDkzwDCsw+wqFPGQA179cnfGWOWRVruj16z6XyvxvjJwbz0wQZ75XK5tKSb7FNyeIEs4TT4jk+S4dhPeAUC5y+bDYirYgM4GC7uEnztnZyaVWQ7B381AK4Qdrwt51ZqExKbQpTUNn+EjqoTwvqNj4kqx5QUCI0ThS/YkOxJCXmPUWZbhjpCg56i+2aB6CmK2JGhn57K5mj0MNdBXA4/WnwH6XoPWJzK5Nyu2zB3nAZp+S5hpQs+p1vN1/wsjk=';

export interface APIDetailedError {
  code: string;
  details: unknown;
}

export class APIError extends Error {
  httpStatus?: number;
  detailedErrors: APIDetailedError[];

  constructor(httpStatus?: number, detailedErrors?: APIDetailedError[]) {
    super('api error');
    this.name = 'APIError';
    this.httpStatus = httpStatus;
    this.detailedErrors = detailedErrors || [];
  }
}

export class APIAbortedError extends Error {
  constructor() {
    super('api aborted error');
    this.name = 'APIAbortedError';
  }
}

export function errorToString(e?: unknown): string | undefined {
  if (!e) return;

  if (e instanceof APIError) return apiDetailedErrorsToString(e);

  if (e instanceof Error) return e.message;

  return 'An error occurred';
}

function apiDetailedErrorsToString(e: APIError): string {
  const errorStrings: string[] = [];

  if (e.httpStatus && e.httpStatus / 100 == 5) {
    return 'An internal server error occurred';
  }

  if (e.detailedErrors.length == 0) {
    return 'An error occurred';
  }

  for (const detailedError of e.detailedErrors) {
    errorStrings.push(apiDetailedErrorToString(detailedError));
  }

  return errorStrings.join(', ');
}

function apiDetailedErrorToString(detailedError: APIDetailedError): string {
  switch (detailedError.code) {
    case 'invalidStartSequence':
      return 'Invalid start sequence';
    case 'invalidLimit':
      return 'Invalid limit';
    case 'invalidSortDirection':
      return 'Invalid sort direction';
    case 'invalidVisibility':
      return 'Invalid visibility';
    case 'invalidRole':
      return 'Invalid role';
    case 'userDoesNotExist':
      return 'User does not exist';
    case 'userAlreadyExists':
      return 'User already exists';
    case 'invalidUserName':
      return 'Invalid username';

    case 'userTokenDoesNotExist':
      return 'User token does not exist';
    case 'userTokenAlreadyExists':
      return 'User token already exists';

    case 'parentProjectGroupDoesNotExist':
      return 'Parent project does not exist';

    case 'projectGroupDoesNotExist':
      return 'Project group does not exist';
    case 'projectGroupAlreadyExists':
      return 'Project group already exists';
    case 'invalidProjectGroupName':
      return 'Invalid project group name';

    case 'projectDoesNotExist':
      return 'Project does not exist';
    case 'projectAlreadyExists':
      return 'Project already exists';
    case 'invalidProjectName':
      return 'Invalid project name';
    case 'cannotSetMembersCanPerformRunActionsOnUserProject':
      return 'Cannot set "members can perform run actions" on a user project';

    case 'remoteSourceDoesNotExist':
      return 'Remote source does not exist';
    case 'remoteSourceAlreadyExists':
      return 'Remote source already exists';
    case 'invalidRemoteSourceName':
      return 'Invalid remote source name';
    case 'invalidRemoteSourceType':
      return 'Invalid remote source type';
    case 'invalidRemoteSourceAuthType':
      return 'Invalid remote source auth type';
    case 'invalidRemoteSourceAPIURL':
      return 'Invalid remote source API URL';
    case 'invalidOauth2ClientID':
      return 'Invalid oauth2 client id';
    case 'invalidOauth2ClientSecret':
      return 'Invalid oauth2 client secret';

    case 'linkedAccountDoesNotExist':
      return 'Linked account does not exist';
    case 'linkedAccountAlreadyExists':
      return 'Linked account already exists';

    case 'invalidRepoPath':
      return 'Invalid repository path';

    case 'secretDoesNotExist':
      return 'Secret does not exist';
    case 'secretAlreadyExists':
      return 'Secret already exists';
    case 'invalidSecretName':
      return 'Invalid secret name';
    case 'invalidSecretType':
      return 'Invalid secret type';
    case 'invalidSecretData':
      return 'Invalid secret data';

    case 'variableDoesNotExist':
      return 'Variable does not exist';
    case 'variableAlreadyExists':
      return 'Variable already exists';
    case 'invalidVariableName':
      return 'Invalid variable name';
    case 'invalidVariableValues':
      return 'Invalid variable values';

    case 'creatorUserDoesNotExist':
      return 'Creator user does not exist';

    case 'organizationDoesNotExist':
      return 'Organization does not exist';
    case 'organizationAlreadyExists':
      return 'Organization already exists';
    case 'invalidOrganizationName':
      return 'Invalid organization name';

    case 'orgMemberDoesNotExist':
      return 'Organization member does not exist';

    case 'invitationDoesNotExist':
      return 'Invitation does not exist';
    case 'invitationAlreadyExists':
      return 'Invitation already exists';

    case 'cannotAddUserToOrganization':
      return 'Cannot add use to organization';
    case 'cannotCreateInvitation':
      return 'Cannot create invitation';

    case 'invalidRunGroup':
      return 'Invalid run group';
    case 'invalidRunNumber':
      return 'Invalid run number';
    case 'invalidRunTaskStepNumber':
      return 'Invalid run task step number';
    case 'runDoesNotExist':
      return 'Run does not exist';
    case 'runTaskDoesNotExist':
      return 'Run task does not exist';
    case 'runTaskStepDoesNotExist':
      return 'Run task step does not exist';
    case 'runCannotBeRestarted':
      return 'Run cannot be restarted';
    case 'runTaskNotWaitingApproval':
      return 'Run task not waiting for approval';
    case 'runTaskAlreadyApproved':
      return 'Run task already approved';

    case 'invalidDeliveryStatus':
      return 'invalid delivery status';

    case 'commitStatusDoesNotExist':
      return 'Commit status does not exist';
    case 'commitStatusDeliveryDoesNotExist':
      return 'Commit status delivery does not exist';
    case 'commitStatusDeliveryAlreadyInProgress':
      return 'Delivery of commit status already in progress';

    case 'runWebhookDoesNotExist':
      return 'Run webhook does not exist';
    case 'runWebhookDeliveryDoesNotExist':
      return 'Run webhook delivery does not exist';
    case 'runWebhookDeliveryAlreadyInProgress':
      return 'Delivery of run webhook already in progress';

    default:
      if (detailedError.code) return detailedError.code;
      return 'An error occurred';
  }
}

function getCursor(res: Response): string | undefined {
  return res.headers.get('X-Agola-Cursor') || undefined;
}

export interface API {
  baseURL(): URL;

  setAuth(auth: Auth): void;

  fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;

  login(
    remoteSourceName: string,
    remoteLoginName?: string,
    remoteLoginPassword?: string,
    signal?: AbortSignal
  ): Promise<LoginUserResponse | undefined>;

  authorize(
    remoteSourceName: string,
    remoteLoginName?: string,
    remoteLoginPassword?: string,
    signal?: AbortSignal
  ): Promise<AuthorizeResponse | undefined>;

  register(
    remoteSourceName: string,
    username: string,
    remoteLoginName?: string,
    remoteLoginPassword?: string,
    signal?: AbortSignal
  ): Promise<RegisterUserResponse | undefined>;

  oauth2(
    code: string,
    state: string,
    signal?: AbortSignal
  ): Promise<RemoteSourceAuthResponse>;

  getRemoteSources(
    cursor?: string,
    signal?: AbortSignal
  ): Promise<{ res: RemoteSourceResponse[]; cursor?: string }>;

  createRemoteSource(
    token: string,
    type: string,
    name: string,
    clientID: string,
    clientSecret: string,
    rsApiURL: string,
    authType: string,
    skipVerify: boolean,
    sshHostKey: string,
    skipSshHostKeyCheck: boolean,
    registrationEnabled: boolean,
    loginEnabled: boolean,
    signal?: AbortSignal
  ): Promise<void>;

  getAuthUser(signal?: AbortSignal): Promise<PrivateUserResponse>;

  getUser(userRef: string, signal?: AbortSignal): Promise<User>;

  getUserRemoteRepos(
    remoteSourceID: string,
    signal?: AbortSignal
  ): Promise<RemoteRepoResponse[]>;

  createUserToken(
    username: string,
    tokenname: string,
    signal?: AbortSignal
  ): Promise<CreateUserTokenResponse>;

  deleteUserToken(
    username: string,
    tokenname: string,
    signal?: AbortSignal
  ): Promise<void>;

  createUserLinkedAccount(
    username: string,
    remotesourcename: string,
    loginname?: string,
    password?: string,
    signal?: AbortSignal
  ): Promise<CreateUserLAResponse | undefined>;

  deleteUserLinkedAccount(
    username: string,
    laid: string,
    signal?: AbortSignal
  ): Promise<void>;

  getUserOrgs(
    cursor?: string,
    signal?: AbortSignal
  ): Promise<{ res: UserOrgResponse[]; cursor?: string }>;

  createOrganization(
    orgname: string,
    visibility: string,
    signal?: AbortSignal
  ): Promise<OrgResponse>;

  getOrgMembers(
    orgref: string,
    cursor?: string,
    signal?: AbortSignal
  ): Promise<{ res: OrgMembersResponse; cursor?: string }>;

  getProjectGroupSubgroups(
    projectgroupref: string,
    signal?: AbortSignal
  ): Promise<ProjectGroupResponse[]>;

  getProjectGroupProjects(
    projectgroupref: string,
    signal?: AbortSignal
  ): Promise<ProjectResponse[]>;

  getProjectGroup(
    ref: string,
    signal?: AbortSignal
  ): Promise<ProjectGroupResponse>;

  createProjectGroup(
    parentref: string,
    name: string,
    visibility: string,
    signal?: AbortSignal
  ): Promise<ProjectGroupResponse>;

  updateProjectGroup(
    projectgroupref: string,
    name: string,
    visibility: string,
    signal?: AbortSignal
  ): Promise<ProjectGroupResponse>;

  deleteProjectGroup(
    projectgroupref: string,
    signal?: AbortSignal
  ): Promise<void>;

  getProject(ref: string, signal?: AbortSignal): Promise<ProjectResponse>;

  createProject(
    parentref: string,
    name: string,
    visibility: string,
    remotesourcename: string,
    remoterepopath: string,
    passvarstoforkedpr: boolean,
    membersCanPerformRunActions: boolean,
    signal?: AbortSignal
  ): Promise<ProjectResponse>;

  updateProject(
    projectref: string,
    name: string,
    visibility: string,
    passvarstoforkedpr: boolean,
    membersCanPerformRunActions: boolean,
    signal?: AbortSignal
  ): Promise<ProjectResponse>;

  deleteProject(projectref: string, signal?: AbortSignal): Promise<void>;

  getSecrets(
    ownertype: string,
    ref: string,
    all: boolean,
    signal?: AbortSignal
  ): Promise<SecretResponse[]>;

  createProjectGroupSecret(
    projectgroupref: string,
    secretname: string,
    secretvalues: Record<string, string>,
    signal?: AbortSignal
  ): Promise<SecretResponse>;

  createProjectSecret(
    projectref: string,
    secretname: string,
    secretvalues: Record<string, string>,
    signal?: AbortSignal
  ): Promise<SecretResponse>;

  updateProjectGroupSecret(
    projectgroupref: string,
    secretname: string,
    secretvalues: Record<string, string>,
    newSecretName: string,
    signal?: AbortSignal
  ): Promise<SecretResponse>;

  updateProjectSecret(
    projectref: string,
    secretname: string,
    secretvalues: Record<string, string>,
    newSecretName: string,
    signal?: AbortSignal
  ): Promise<SecretResponse>;

  deleteProjectGroupSecret(
    secretName: string,
    username: string,
    signal?: AbortSignal
  ): Promise<void>;

  deleteProjectSecret(
    secretName: string,
    projectref: string,
    signal?: AbortSignal
  ): Promise<void>;

  getVariables(
    ownertype: string,
    ref: string,
    all: boolean,
    signal?: AbortSignal
  ): Promise<VariableResponse[]>;

  createProjectGroupVariable(
    projectgroupref: string,
    variablename: string,
    variablevalues: VariableValueRequest[],
    signal?: AbortSignal
  ): Promise<VariableResponse>;

  createProjectVariable(
    projectref: string,
    variablename: string,
    variablevalues: VariableValueRequest[],
    signal?: AbortSignal
  ): Promise<VariableResponse>;

  updateProjectGroupVariable(
    projectgroupref: string,
    variablename: string,
    variablevalues: VariableValueRequest[],
    newVariableName: string,
    signal?: AbortSignal
  ): Promise<VariableResponse>;

  updateProjectVariable(
    projectref: string,
    variablename: string,
    variablevalues: VariableValueRequest[],
    newVariableName: string,
    signal?: AbortSignal
  ): Promise<VariableResponse>;

  deleteProjectGroupVariable(
    variablename: string,
    projecgrouptref: string,
    signal?: AbortSignal
  ): Promise<void>;

  deleteProjectVariable(
    variablename: string,
    projectref: string,
    signal?: AbortSignal
  ): Promise<void>;

  projectUpdateRepoLinkedAccount(
    projectref: string,
    signal?: AbortSignal
  ): Promise<void>;

  getRun(
    rungrouptype: string,
    rungroupref: string,
    runnumber: number,
    signal?: AbortSignal
  ): Promise<RunResponse>;

  getRuns(
    rungrouptype: string,
    rungroupref: string,
    cursor?: string,
    subgroup?: string,
    startRunCounter?: number,
    signal?: AbortSignal
  ): Promise<{ res: RunResponse[]; cursor?: string }>;

  restartRun(
    rungrouptype: string,
    rungroupref: string,
    runnumber: number,
    fromStart: boolean,
    signal?: AbortSignal
  ): Promise<RunResponse>;

  cancelRun(
    rungrouptype: string,
    rungroupref: string,
    runnumber: number,
    signal?: AbortSignal
  ): Promise<void>;

  stopRun(
    rungrouptype: string,
    rungroupref: string,
    runnumber: number,
    signal?: AbortSignal
  ): Promise<void>;

  getTask(
    rungrouptype: string,
    rungroupref: string,
    runnumber: number,
    taskid: string,
    signal?: AbortSignal
  ): Promise<RunTaskResponse>;

  approveTask(
    rungrouptype: string,
    rungroupref: string,
    runnumber: number,
    taskid: string,
    signal?: AbortSignal
  ): Promise<void>;
}

export function newAPI(): API {
  const _baseURL = genBaseURL();
  let auth: Auth;
  let csrfToken = '';

  function setAuth(newAuth: Auth) {
    auth = newAuth;
  }

  async function handleFetchError(res: Response): Promise<void> {
    if (!res.ok) {
      if (res.status == 401) {
        if (auth) {
          auth.logout({ goToLogin: true });
        }
        throw new APIError(res.status);
      }

      let detailedErrors;
      try {
        detailedErrors = JSON.parse(await res.text());
      } catch (e) {
        // not a json response
        throw new APIError(res.status, detailedErrors);
      }

      if (detailedErrors) {
        throw new APIError(res.status, detailedErrors);
      }
      throw new APIError(res.status);
    }
  }

  function genBaseURL(): URL {
    // default base url with port set to 8000
    const API_BASE_PATH = '/api/v1alpha';
    let API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

    if (!API_BASE_URL) {
      API_BASE_URL =
        window.location.protocol +
        '//' +
        window.location.hostname +
        ':' +
        window.location.port;
    }

    const apiURL = new URL(API_BASE_URL);
    apiURL.pathname = API_BASE_PATH;

    return apiURL;
  }

  function baseURL(): URL {
    return new URL(_baseURL.toString());
  }

  async function fetchWrapper(
    input: RequestInfo,
    init?: RequestInit,
    admintoken?: string
  ): Promise<Response> {
    const headers: HeadersInit = {};

    if (admintoken) {
      headers['Authorization'] = 'token ' + admintoken;
    }

    if (csrfToken) {
      headers['X-Csrf-Token'] = csrfToken;
    }

    return window.fetch(
      input,
      _.merge(init, {
        headers,
        mode: 'cors',
        // required for sending cookies to api if deployed on different url
        credentials: 'include',
      })
    );
  }

  async function fetch(
    input: RequestInfo,
    init?: RequestInit,
    admintoken?: string
  ): Promise<Response> {
    try {
      const res = await fetchWrapper(input, init, admintoken);

      const curCSRFToken = res.headers.get('X-Csrf-Token');
      if (curCSRFToken) {
        csrfToken = curCSRFToken;
      }

      if (!res.ok) {
        await handleFetchError(res);
      }
      return res;
    } catch (e) {
      if (e instanceof DOMException) {
        if (e.name == 'AbortError') throw new APIAbortedError();
      }

      if (e instanceof APIError) throw e;

      throw new APIError();
    }
  }

  async function login(
    remoteSourceName: string,
    remoteLoginName?: string,
    remoteLoginPassword?: string,
    signal?: AbortSignal
  ): Promise<LoginUserResponse | undefined> {
    const apiURL = baseURL();
    apiURL.pathname += '/auth/login';

    const req = new LoginUserRequest();
    req.remoteSourceName = remoteSourceName;
    req.username = remoteLoginName;
    req.password = remoteLoginPassword;

    const init: RequestInit = {
      method: 'POST',
      body: TypedJSON.stringify(req, LoginUserRequest),
      redirect: 'manual',

      signal,
    };

    const res = await fetch(apiURL.toString(), init);

    if (res.type == 'opaqueredirect' || res.redirected) {
      window.location.reload();
      return;
    }

    const authResponse = TypedJSON.parse(await res.text(), LoginUserResponse);
    if (!authResponse) {
      throw new APIError();
    }

    if (authResponse.oauth2Redirect) {
      window.location.replace(authResponse.oauth2Redirect);
      return;
    }

    return authResponse;
  }

  async function authorize(
    remoteSourceName: string,
    remoteLoginName?: string,
    remoteLoginPassword?: string,
    signal?: AbortSignal
  ): Promise<AuthorizeResponse | undefined> {
    const apiURL = baseURL();
    apiURL.pathname += '/auth/authorize';

    const req = new LoginUserRequest();
    req.remoteSourceName = remoteSourceName;
    req.username = remoteLoginName;
    req.password = remoteLoginPassword;

    const init: RequestInit = {
      method: 'POST',
      body: TypedJSON.stringify(req, LoginUserRequest),
      redirect: 'manual',

      signal,
    };

    const res = await fetch(apiURL.toString(), init);

    if (res.type == 'opaqueredirect' || res.redirected) {
      window.location.reload();
      return;
    }

    const authResponse = TypedJSON.parse(await res.text(), AuthorizeResponse);
    if (!authResponse) {
      throw new APIError();
    }

    if (authResponse.oauth2Redirect) {
      window.location.replace(authResponse.oauth2Redirect);
      return;
    }

    return authResponse;
  }

  async function register(
    remoteSourceName: string,
    username: string,
    remoteLoginName?: string,
    remoteLoginPassword?: string,
    signal?: AbortSignal
  ): Promise<RegisterUserResponse | undefined> {
    const apiURL = baseURL();
    apiURL.pathname += '/auth/register';

    const req = new RegisterUserRequest();
    req.remoteSourceName = remoteSourceName;
    req.username = username;
    req.remoteSourceLoginName = remoteLoginName;
    req.remoteSourceLoginPassword = remoteLoginPassword;

    const init: RequestInit = {
      method: 'POST',
      body: TypedJSON.stringify(req, RegisterUserRequest),
      redirect: 'manual',

      signal,
    };

    const res = await fetch(apiURL.toString(), init);

    if (res.type == 'opaqueredirect' || res.redirected) {
      window.location.reload();
      return;
    }

    const authResponse = TypedJSON.parse(await res.text(), AuthorizeResponse);
    if (!authResponse) {
      throw new APIError();
    }

    if (authResponse.oauth2Redirect) {
      window.location.replace(authResponse.oauth2Redirect);
      return;
    }

    return authResponse;
  }

  async function oauth2(
    code: string,
    state: string,
    signal?: AbortSignal
  ): Promise<RemoteSourceAuthResponse> {
    const apiURL = baseURL();
    apiURL.pathname += '/auth/oauth2/callback';

    apiURL.searchParams.append('code', code || '');
    apiURL.searchParams.append('state', state || '');

    const res = await fetch(apiURL.toString(), {
      method: 'GET',
      signal,
    });

    const authResponse = TypedJSON.parse(
      await res.text(),
      RemoteSourceAuthResponse
    );
    if (!authResponse) {
      throw new APIError();
    }

    return authResponse;
  }

  async function getRemoteSources(
    cursor?: string,
    signal?: AbortSignal
  ): Promise<{ res: RemoteSourceResponse[]; cursor?: string }> {
    const apiURL = baseURL();
    apiURL.pathname += `/remotesources`;

    if (cursor) apiURL.searchParams.append('cursor', cursor);

    const res = await fetch(apiURL.toString(), { signal });

    const remoteSources = TypedJSON.parseAsArray(
      await res.text(),
      RemoteSourceResponse
    );
    if (!remoteSources) throw new APIError();

    return { res: remoteSources, cursor: getCursor(res) };
  }

  async function createRemoteSource(
    admintoken: string,
    type: string,
    name: string,
    clientID: string,
    clientSecret: string,
    rsApiURL: string,
    authType: string,
    skipVerify: boolean,
    sshHostKey: string,
    skipSshHostKeyCheck: boolean,
    registrationEnabled: boolean,
    loginEnabled: boolean,
    signal?: AbortSignal
  ): Promise<void> {
    const apiURL = baseURL();
    apiURL.pathname += '/remotesources';

    const req = new CreateRemoteSourceRequest();
    req.name = name;
    req.apiURL = rsApiURL;
    req.type = type;
    req.authType = authType;
    req.skipVerify = skipVerify;
    req.sshHostKey = sshHostKey;
    req.skipSSHHostKeyCheck = skipSshHostKeyCheck;
    req.oauth2ClientID = clientID;
    req.oauth2ClientSecret = clientSecret;
    req.registrationEnabled = registrationEnabled;
    req.loginEnabled = loginEnabled;

    const init = {
      method: 'POST',
      body: TypedJSON.stringify(req, CreateRemoteSourceRequest),

      signal,
    };

    await fetch(apiURL.toString(), init, admintoken);
  }

  async function getAuthUser(
    signal?: AbortSignal
  ): Promise<PrivateUserResponse> {
    const apiURL = baseURL();
    apiURL.pathname += `/user`;

    const res = await fetch(apiURL.toString(), { signal });

    const user = TypedJSON.parse(await res.text(), PrivateUserResponse);
    if (!user) throw new APIError();

    return user;
  }

  async function getUser(userRef: string, signal?: AbortSignal): Promise<User> {
    const apiURL = baseURL();
    apiURL.pathname += `/users/${userRef}`;

    const res = await fetch(apiURL.toString(), { signal });

    const user = TypedJSON.parse(await res.text(), User);
    if (!user) throw new APIError();

    return user;
  }

  async function getUserRemoteRepos(
    remoteSourceID: string,
    signal?: AbortSignal
  ): Promise<RemoteRepoResponse[]> {
    const apiURL = baseURL();
    apiURL.pathname += '/user/remoterepos/' + remoteSourceID;

    const res = await fetch(apiURL.toString(), { signal });

    const remoteRepos = TypedJSON.parseAsArray(
      await res.text(),
      RemoteRepoResponse
    );

    return remoteRepos;
  }

  async function createUserToken(
    username: string,
    tokenname: string,
    signal?: AbortSignal
  ): Promise<CreateUserTokenResponse> {
    const apiURL = baseURL();
    apiURL.pathname += '/users/' + username + '/tokens';

    const init = {
      method: 'POST',
      body: JSON.stringify({
        token_name: tokenname,
      }),
      signal,
    };

    const res = await fetch(apiURL.toString(), init);

    const userToken = TypedJSON.parse(
      await res.text(),
      CreateUserTokenResponse
    );
    if (!userToken) throw new APIError();

    return userToken;
  }

  async function deleteUserToken(
    username: string,
    tokenname: string,
    signal?: AbortSignal
  ): Promise<void> {
    const apiURL = baseURL();
    apiURL.pathname += '/users/' + username + '/tokens/' + tokenname;

    const init = {
      method: 'DELETE',
      signal,
    };

    await fetch(apiURL.toString(), init);
  }

  async function createUserLinkedAccount(
    username: string,
    remotesourcename: string,
    loginname?: string,
    password?: string,
    signal?: AbortSignal
  ): Promise<CreateUserLAResponse | undefined> {
    const apiURL = baseURL();
    apiURL.pathname += '/users/' + username + '/linkedaccounts';

    const init = {
      method: 'POST',
      body: JSON.stringify({
        remote_source_name: remotesourcename,
        remote_source_login_name: loginname,
        remote_source_login_password: password,
      }),
      signal,
    };

    const res = await fetch(apiURL.toString(), init);

    if (res.type == 'opaqueredirect' || res.redirected) {
      window.location.reload();
      return;
    }

    const authResponse = TypedJSON.parse(
      await res.text(),
      CreateUserLAResponse
    );
    if (!authResponse) {
      throw new APIError();
    }

    if (authResponse.oauth2Redirect) {
      window.location.replace(authResponse.oauth2Redirect);
      return;
    }

    return authResponse;
  }

  async function deleteUserLinkedAccount(
    username: string,
    laid: string,
    signal?: AbortSignal
  ): Promise<void> {
    const apiURL = baseURL();
    apiURL.pathname += '/users/' + username + '/linkedaccounts/' + laid;

    const init = {
      method: 'DELETE',
      signal,
    };

    await fetch(apiURL.toString(), init);
  }

  async function getUserOrgs(
    cursor?: string,
    signal?: AbortSignal
  ): Promise<{ res: UserOrgResponse[]; cursor?: string }> {
    const apiURL = baseURL();
    apiURL.pathname += '/user/orgs';

    if (cursor) apiURL.searchParams.append('cursor', cursor);

    const res = await fetch(apiURL.toString(), { signal });

    const organizations = TypedJSON.parseAsArray(
      await res.text(),
      UserOrgResponse
    );
    if (!organizations) throw new APIError();

    return { res: organizations, cursor: getCursor(res) };
  }

  async function createOrganization(
    orgname: string,
    visibility: string,
    signal?: AbortSignal
  ): Promise<OrgResponse> {
    const apiURL = baseURL();
    apiURL.pathname += '/orgs';
    const init = {
      method: 'POST',
      body: JSON.stringify({
        name: orgname,
        visibility: visibility,
      }),
      signal,
    };

    const res = await fetch(apiURL.toString(), init);

    const org = TypedJSON.parse(await res.text(), OrgResponse);
    if (!org) throw new APIError();

    return org;
  }

  async function getOrgMembers(
    orgref: string,
    cursor?: string,
    signal?: AbortSignal
  ): Promise<{ res: OrgMembersResponse; cursor?: string }> {
    const apiURL = baseURL();
    apiURL.pathname += '/orgs/' + orgref + '/members';

    if (cursor) apiURL.searchParams.append('cursor', cursor);

    const res = await fetch(apiURL.toString(), { signal });

    const orgMembers = TypedJSON.parse(await res.text(), OrgMembersResponse);
    if (!orgMembers) throw new APIError();

    return { res: orgMembers, cursor: getCursor(res) };
  }

  async function getProjectGroupSubgroups(
    projectgroupref: string,
    signal?: AbortSignal
  ): Promise<ProjectGroupResponse[]> {
    const apiURL = baseURL();
    apiURL.pathname +=
      '/projectgroups/' + encodeURIComponent(projectgroupref) + '/subgroups';

    const res = await fetch(apiURL.toString(), { signal });

    const projectGroups = TypedJSON.parseAsArray(
      await res.text(),
      ProjectGroupResponse
    );

    return projectGroups;
  }

  async function getProjectGroupProjects(
    projectgroupref: string,
    signal?: AbortSignal
  ): Promise<ProjectResponse[]> {
    const apiURL = baseURL();
    apiURL.pathname +=
      '/projectgroups/' + encodeURIComponent(projectgroupref) + '/projects';

    const res = await fetch(apiURL.toString(), { signal });

    const projects = TypedJSON.parseAsArray(await res.text(), ProjectResponse);

    return projects;
  }

  async function getProjectGroup(
    ref: string,
    signal?: AbortSignal
  ): Promise<ProjectGroupResponse> {
    const apiURL = baseURL();
    apiURL.pathname += '/projectgroups/' + encodeURIComponent(ref);

    const res = await fetch(apiURL.toString(), { signal });

    const projectGroup = TypedJSON.parse(
      await res.text(),
      ProjectGroupResponse
    );
    if (!projectGroup) throw new APIError();

    return projectGroup;
  }

  async function createProjectGroup(
    parentref: string,
    name: string,
    visibility: string,
    signal?: AbortSignal
  ): Promise<ProjectGroupResponse> {
    const apiURL = baseURL();
    apiURL.pathname += '/projectgroups';

    const init = {
      method: 'POST',
      body: JSON.stringify({
        name: name,
        parent_ref: parentref,
        visibility: visibility,
      }),
      signal,
    };

    const res = await fetch(apiURL.toString(), init);

    const projectGroup = TypedJSON.parse(
      await res.text(),
      ProjectGroupResponse
    );
    if (!projectGroup) throw new APIError();

    return projectGroup;
  }

  async function updateProjectGroup(
    projectgroupref: string,
    name: string,
    visibility: string,
    signal?: AbortSignal
  ): Promise<ProjectGroupResponse> {
    const apiURL = baseURL();
    apiURL.pathname += '/projectgroups/' + encodeURIComponent(projectgroupref);
    const init = {
      method: 'PUT',
      body: JSON.stringify({
        name: name,
        visibility: visibility,
      }),
      signal,
    };

    const res = await fetch(apiURL.toString(), init);

    const projectGroup = TypedJSON.parse(
      await res.text(),
      ProjectGroupResponse
    );
    if (!projectGroup) throw new APIError();

    return projectGroup;
  }

  async function deleteProjectGroup(
    projectgroupref: string,
    signal?: AbortSignal
  ): Promise<void> {
    const apiURL = baseURL();
    apiURL.pathname += '/projectgroups/' + encodeURIComponent(projectgroupref);
    const init = {
      method: 'DELETE',
      signal,
    };

    await fetch(apiURL.toString(), init);
  }

  async function getProject(
    ref: string,
    signal?: AbortSignal
  ): Promise<ProjectResponse> {
    const apiURL = baseURL();
    apiURL.pathname += '/projects/' + encodeURIComponent(ref);

    const res = await fetch(apiURL.toString(), { signal });

    const project = TypedJSON.parse(await res.text(), ProjectResponse);
    if (!project) throw new APIError();

    return project;
  }

  async function createProject(
    parentref: string,
    name: string,
    visibility: string,
    remotesourcename: string,
    remoterepopath: string,
    passvarstoforkedpr: boolean,
    membersCanPerformRunActions: boolean,
    signal?: AbortSignal
  ): Promise<ProjectResponse> {
    const apiURL = baseURL();
    apiURL.pathname += '/projects';

    const init = {
      method: 'POST',
      body: JSON.stringify({
        name: name,
        parent_ref: parentref,
        visibility: visibility,
        remote_source_name: remotesourcename,
        repo_path: remoterepopath,
        pass_vars_to_forked_pr: passvarstoforkedpr,
        members_can_perform_run_actions: membersCanPerformRunActions,
      }),
      signal,
    };

    const res = await fetch(apiURL.toString(), init);

    const project = TypedJSON.parse(await res.text(), ProjectResponse);
    if (!project) throw new APIError();

    return project;
  }

  async function updateProject(
    projectref: string,
    name: string,
    visibility: string,
    passvarstoforkedpr: boolean,
    membersCanPerformRunActions: boolean,
    signal?: AbortSignal
  ): Promise<ProjectResponse> {
    const apiURL = baseURL();
    apiURL.pathname += '/projects/' + encodeURIComponent(projectref);

    const init = {
      method: 'PUT',
      body: JSON.stringify({
        name: name,
        visibility: visibility,
        pass_vars_to_forked_pr: passvarstoforkedpr,
        members_can_perform_run_actions: membersCanPerformRunActions,
      }),
      signal,
    };

    const res = await fetch(apiURL.toString(), init);

    const project = TypedJSON.parse(await res.text(), ProjectResponse);
    if (!project) throw new APIError();

    return project;
  }

  async function deleteProject(
    projectref: string,
    signal?: AbortSignal
  ): Promise<void> {
    const apiURL = baseURL();
    apiURL.pathname += '/projects/' + encodeURIComponent(projectref);
    const init = {
      method: 'DELETE',
      signal,
    };

    await fetch(apiURL.toString(), init);
  }

  async function projectUpdateRepoLinkedAccount(
    projectref: string,
    signal?: AbortSignal
  ): Promise<void> {
    const apiURL = baseURL();
    apiURL.pathname +=
      '/projects/' +
      encodeURIComponent(projectref) +
      '/updaterepolinkedaccount';

    const init = {
      method: 'PUT',
      signal,
    };

    await fetch(apiURL.toString(), init);
  }

  async function getSecrets(
    ownertype: string,
    ref: string,
    all: boolean,
    signal?: AbortSignal
  ): Promise<SecretResponse[]> {
    const apiURL = baseURL();

    if (ownertype == 'project') {
      apiURL.pathname += '/projects/';
    } else if (ownertype == 'projectgroup') {
      apiURL.pathname += '/projectgroups/';
    }
    apiURL.pathname += encodeURIComponent(ref);
    apiURL.pathname += '/secrets';
    if (all) {
      apiURL.searchParams.append('tree', '');
      apiURL.searchParams.append('removeoverridden', '');
    }
    const res = await fetch(apiURL.toString(), { signal });

    const secrets = TypedJSON.parseAsArray(await res.text(), SecretResponse);

    return secrets;
  }

  async function createProjectSecret(
    projectref: string,
    secretname: string,
    secretValue: Record<string, string>,
    signal?: AbortSignal
  ): Promise<SecretResponse> {
    const apiURL = baseURL();
    apiURL.pathname +=
      '/projects/' + encodeURIComponent(projectref) + '/secrets';
    const init = {
      method: 'POST',
      body: JSON.stringify({
        name: secretname,
        type: SecretType.Internal,
        data: secretValue,
      }),
      signal,
    };

    const res = await fetch(apiURL.toString(), init);

    const secret = TypedJSON.parse(await res.text(), SecretResponse);
    if (!secret) throw new APIError();

    return secret;
  }

  async function createProjectGroupSecret(
    projectgroupref: string,
    secretname: string,
    secretValue: Record<string, string>,
    signal?: AbortSignal
  ): Promise<SecretResponse> {
    const apiURL = baseURL();
    apiURL.pathname +=
      '/projectgroups/' + encodeURIComponent(projectgroupref) + '/secrets';
    const init = {
      method: 'POST',
      body: JSON.stringify({
        name: secretname,
        type: SecretType.Internal,
        data: secretValue,
      }),
      signal,
    };

    const res = await fetch(apiURL.toString(), init);

    const secret = TypedJSON.parse(await res.text(), SecretResponse);
    if (!secret) throw new APIError();

    return secret;
  }

  async function updateProjectSecret(
    projectref: string,
    secretname: string,
    secretValue: Record<string, string>,
    newSecretName: string,
    signal?: AbortSignal
  ): Promise<SecretResponse> {
    const apiURL = baseURL();
    apiURL.pathname +=
      '/projects/' + encodeURIComponent(projectref) + '/secrets/' + secretname;
    const init = {
      method: 'PUT',
      body: JSON.stringify({
        name: newSecretName,
        type: SecretType.Internal,
        data: secretValue,
      }),
      signal,
    };

    const res = await fetch(apiURL.toString(), init);

    const secret = TypedJSON.parse(await res.text(), SecretResponse);
    if (!secret) throw new APIError();

    return secret;
  }

  async function updateProjectGroupSecret(
    projectgroupref: string,
    secretname: string,
    secretValue: Record<string, string>,
    newSecretName: string,
    signal?: AbortSignal
  ): Promise<SecretResponse> {
    const apiURL = baseURL();
    apiURL.pathname +=
      '/projectgroups/' +
      encodeURIComponent(projectgroupref) +
      '/secrets/' +
      secretname;
    const init = {
      method: 'PUT',
      body: JSON.stringify({
        name: newSecretName,
        type: SecretType.Internal,
        data: secretValue,
      }),
      signal,
    };

    const res = await fetch(apiURL.toString(), init);

    const secret = TypedJSON.parse(await res.text(), SecretResponse);
    if (!secret) throw new APIError();

    return secret;
  }

  async function deleteProjectGroupSecret(
    secretname: string,
    projectgroupref: string,
    signal?: AbortSignal
  ): Promise<void> {
    const apiURL = baseURL();
    apiURL.pathname +=
      '/projectgroups/' +
      encodeURIComponent(projectgroupref) +
      '/secrets/' +
      secretname;
    const init = {
      method: 'DELETE',
      signal,
    };

    await fetch(apiURL.toString(), init);
  }

  async function deleteProjectSecret(
    secretname: string,
    projectref: string,
    signal?: AbortSignal
  ): Promise<void> {
    const apiURL = baseURL();
    apiURL.pathname +=
      '/projects/' + encodeURIComponent(projectref) + '/secrets/' + secretname;
    const init = {
      method: 'DELETE',
      signal,
    };

    await fetch(apiURL.toString(), init);
  }

  async function getVariables(
    ownertype: string,
    ref: string,
    all: boolean,
    signal?: AbortSignal
  ): Promise<VariableResponse[]> {
    const apiURL = baseURL();

    if (ownertype == 'project') {
      apiURL.pathname += '/projects/';
    } else if (ownertype == 'projectgroup') {
      apiURL.pathname += '/projectgroups/';
    }
    apiURL.pathname += encodeURIComponent(ref);
    apiURL.pathname += '/variables';
    if (all) {
      apiURL.searchParams.append('tree', '');
      apiURL.searchParams.append('removeoverridden', '');
    }

    const res = await fetch(apiURL.toString(), { signal });

    const variables = TypedJSON.parseAsArray(
      await res.text(),
      VariableResponse
    );

    return variables;
  }

  async function createProjectVariable(
    projectref: string,
    variablename: string,
    variableValues: VariableValueRequest[],
    signal?: AbortSignal
  ): Promise<VariableResponse> {
    const apiURL = baseURL();
    apiURL.pathname +=
      '/projects/' + encodeURIComponent(projectref) + '/variables';

    const req = new CreateVariableRequest();
    req.name = variablename;
    req.values = variableValues;

    const init = {
      method: 'POST',
      body: TypedJSON.stringify(req, CreateVariableRequest),
      signal,
    };

    const res = await fetch(apiURL.toString(), init);

    const variable = TypedJSON.parse(await res.text(), VariableResponse);
    if (!variable) throw new APIError();

    return variable;
  }

  async function createProjectGroupVariable(
    projectgroupref: string,
    variablename: string,
    variableValues: VariableValueRequest[],
    signal?: AbortSignal
  ): Promise<VariableResponse> {
    const apiURL = baseURL();
    apiURL.pathname +=
      '/projectgroups/' + encodeURIComponent(projectgroupref) + '/variables';

    const req = new CreateVariableRequest();
    req.name = variablename;
    req.values = variableValues;

    const init = {
      method: 'POST',
      body: TypedJSON.stringify(req, CreateVariableRequest),
      signal,
    };

    const res = await fetch(apiURL.toString(), init);

    const variable = TypedJSON.parse(await res.text(), VariableResponse);
    if (!variable) throw new APIError();

    return variable;
  }

  async function updateProjectVariable(
    projectref: string,
    variablename: string,
    variableValues: VariableValueRequest[],
    newVariableName: string,
    signal?: AbortSignal
  ): Promise<VariableResponse> {
    const apiURL = baseURL();
    apiURL.pathname +=
      '/projects/' +
      encodeURIComponent(projectref) +
      '/variables/' +
      variablename;

    const req = new UpdateVariableRequest();
    req.name = newVariableName;
    req.values = variableValues;

    const init = {
      method: 'PUT',
      body: TypedJSON.stringify(req, UpdateVariableRequest),
      signal,
    };

    const res = await fetch(apiURL.toString(), init);

    const variable = TypedJSON.parse(await res.text(), VariableResponse);
    if (!variable) throw new APIError();

    return variable;
  }

  async function updateProjectGroupVariable(
    projectgroupref: string,
    variablename: string,
    variableValues: VariableValueRequest[],
    newVariableName: string,
    signal?: AbortSignal
  ): Promise<VariableResponse> {
    const apiURL = baseURL();
    apiURL.pathname +=
      '/projectgroups/' +
      encodeURIComponent(projectgroupref) +
      '/variables/' +
      variablename;

    const req = new UpdateVariableRequest();
    req.name = newVariableName;
    req.values = variableValues;

    const init = {
      method: 'PUT',
      body: TypedJSON.stringify(req, UpdateVariableRequest),
      signal,
    };

    const res = await fetch(apiURL.toString(), init);

    const variable = TypedJSON.parse(await res.text(), VariableResponse);
    if (!variable) throw new APIError();

    return variable;
  }

  async function deleteProjectGroupVariable(
    variablename: string,
    projectgroupref: string,
    signal?: AbortSignal
  ): Promise<void> {
    const apiURL = baseURL();
    apiURL.pathname +=
      '/projectgroups/' +
      encodeURIComponent(projectgroupref) +
      '/variables/' +
      variablename;
    const init = {
      method: 'DELETE',
      signal,
    };

    await fetch(apiURL.toString(), init);
  }

  async function deleteProjectVariable(
    variablename: string,
    projectref: string,
    signal?: AbortSignal
  ): Promise<void> {
    const apiURL = baseURL();
    apiURL.pathname +=
      '/projects/' +
      encodeURIComponent(projectref) +
      '/variables/' +
      variablename;
    const init = {
      method: 'DELETE',
      signal,
    };

    await fetch(apiURL.toString(), init);
  }

  async function getRun(
    rungrouptype: string,
    rungroupref: string,
    runnumber: number,
    signal?: AbortSignal
  ): Promise<RunResponse> {
    const apiURL = baseURL();
    apiURL.pathname +=
      '/' +
      rungrouptype +
      '/' +
      encodeURIComponent(rungroupref) +
      '/runs/' +
      runnumber;

    const res = await fetch(apiURL.toString(), { signal });

    const run = TypedJSON.parse(await res.text(), RunResponse);
    if (!run) throw new APIError();

    return run;
  }

  async function getRuns(
    rungrouptype: string,
    rungroupref: string,
    cursor?: string,
    subgroup?: string,
    startRunCounter?: number,
    signal?: AbortSignal
  ): Promise<{ res: RunResponse[]; cursor?: string }> {
    const apiURL = baseURL();
    apiURL.pathname +=
      '/' + rungrouptype + '/' + encodeURIComponent(rungroupref) + '/runs';

    if (cursor) apiURL.searchParams.append('cursor', cursor);

    if (subgroup) {
      apiURL.searchParams.append('subgroup', subgroup);
    }
    if (startRunCounter) {
      apiURL.searchParams.append('start', startRunCounter.toString());
    }

    const res = await fetch(apiURL.toString(), { signal });

    const runs = TypedJSON.parseAsArray(await res.text(), RunResponse);

    return { res: runs, cursor: getCursor(res) };
  }

  async function restartRun(
    rungrouptype: string,
    rungroupref: string,
    runnumber: number,
    fromStart: boolean,
    signal?: AbortSignal
  ): Promise<RunResponse> {
    const apiURL = baseURL();
    apiURL.pathname +=
      '/' +
      rungrouptype +
      '/' +
      encodeURIComponent(rungroupref) +
      '/runs/' +
      runnumber +
      '/actions';

    const init = {
      method: 'PUT',
      body: JSON.stringify({
        action_type: 'restart',
        from_start: fromStart,
      }),
      signal,
    };

    const res = await fetch(apiURL.toString(), init);

    const run = TypedJSON.parse(await res.text(), RunResponse);
    if (!run) throw new APIError();

    return run;
  }

  async function cancelRun(
    rungrouptype: string,
    rungroupref: string,
    runnumber: number,
    signal?: AbortSignal
  ): Promise<void> {
    const apiURL = baseURL();
    apiURL.pathname +=
      '/' +
      rungrouptype +
      '/' +
      encodeURIComponent(rungroupref) +
      '/runs/' +
      runnumber +
      '/actions';

    const init = {
      method: 'PUT',
      body: JSON.stringify({
        action_type: 'cancel',
      }),
      signal,
    };

    await fetch(apiURL.toString(), init);
  }

  async function stopRun(
    rungrouptype: string,
    rungroupref: string,
    runnumber: number,
    signal?: AbortSignal
  ): Promise<void> {
    const apiURL = baseURL();
    apiURL.pathname +=
      '/' +
      rungrouptype +
      '/' +
      encodeURIComponent(rungroupref) +
      '/runs/' +
      runnumber +
      '/actions';

    const init = {
      method: 'PUT',
      body: JSON.stringify({
        action_type: 'stop',
      }),
      signal,
    };

    await fetch(apiURL.toString(), init);
  }

  async function getTask(
    rungrouptype: string,
    rungroupref: string,
    runnumber: number,
    taskid: string,
    signal?: AbortSignal
  ): Promise<RunTaskResponse> {
    const apiURL = baseURL();
    apiURL.pathname +=
      '/' +
      rungrouptype +
      '/' +
      encodeURIComponent(rungroupref) +
      '/runs/' +
      runnumber +
      '/tasks/' +
      taskid;

    const res = await fetch(apiURL.toString(), { signal });

    const task = TypedJSON.parse(await res.text(), RunTaskResponse);
    if (!task) throw new APIError();

    return task;
  }

  async function approveTask(
    rungrouptype: string,
    rungroupref: string,
    runnumber: number,
    taskid: string,
    signal?: AbortSignal
  ): Promise<void> {
    const apiURL = baseURL();
    apiURL.pathname +=
      '/' +
      rungrouptype +
      '/' +
      encodeURIComponent(rungroupref) +
      '/runs/' +
      runnumber +
      '/tasks/' +
      taskid +
      '/actions';

    const init = {
      method: 'PUT',
      body: JSON.stringify({
        action_type: 'approve',
      }),
      signal,
    };

    await fetch(apiURL.toString(), init);
  }

  return {
    baseURL,
    setAuth,
    fetch,
    login,
    authorize,
    register,
    oauth2,
    getRemoteSources,
    createRemoteSource,
    getAuthUser,
    getUser,
    getUserRemoteRepos,
    createUserToken,
    deleteUserToken,
    createUserLinkedAccount,
    deleteUserLinkedAccount,
    getUserOrgs,
    createOrganization,
    getOrgMembers,
    getProjectGroupSubgroups,
    getProjectGroupProjects,
    getProjectGroup,
    createProjectGroup,
    updateProjectGroup,
    deleteProjectGroup,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    projectUpdateRepoLinkedAccount,
    getSecrets,
    createProjectGroupSecret,
    createProjectSecret,
    updateProjectGroupSecret,
    updateProjectSecret,
    deleteProjectGroupSecret,
    deleteProjectSecret,
    getVariables,
    createProjectGroupVariable,
    createProjectVariable,
    updateProjectGroupVariable,
    updateProjectVariable,
    deleteProjectGroupVariable,
    deleteProjectVariable,
    getRun,
    getRuns,
    restartRun,
    cancelRun,
    stopRun,
    getTask,
    approveTask,
  };
}

export enum Visibility {
  Public = 'public',
  Private = 'private',
}

@jsonObject
export class User {
  id!: string;

  creationTime?: Date;

  name!: string;

  email?: string;
}

export enum AuthType {
  LoginUser = 'loginuser',
  Authorize = 'authorize',
  RegisterUser = 'registeruser',
  CreateUserLA = 'createuserla',
}

@jsonObject
export class LoginUserRequest {
  @jsonMember(String, { name: 'remote_source_name' })
  remoteSourceName!: string;

  @jsonMember(String)
  username?: string;

  @jsonMember(String)
  password?: string;
}

@jsonObject
export class UserResponse {
  @jsonMember(String)
  id!: string;

  @jsonMember(String)
  username!: string;
}

@jsonObject
export class OrgResponse {
  @jsonMember(String)
  id!: string;

  @jsonMember(String)
  name!: string;

  @jsonMember(String)
  visibility!: Visibility;
}

@jsonObject
export class UserOrgResponse {
  @jsonMember(OrgResponse)
  Organization!: OrgResponse;

  @jsonMember(String)
  Role!: string;
}

export enum MemberRole {
  Owner = 'owner',
  Member = 'member',
}

@jsonObject
export class OrgMemberResponse {
  @jsonMember(UserResponse)
  user!: UserResponse;

  @jsonMember(String)
  role!: MemberRole;
}

@jsonObject
export class OrgMembersResponse {
  @jsonMember(OrgResponse)
  organization!: OrgResponse;

  @jsonArrayMember(OrgMemberResponse)
  members: OrgMemberResponse[] = [];
}

@jsonObject
export class RemoteRepoResponse {
  @jsonMember(String)
  id!: string;

  @jsonMember(String)
  path!: string;
}

@jsonObject
export class LinkedAccountResponse {
  @jsonMember(String)
  id!: string;

  @jsonMember(String, { name: 'remote_source_id' })
  remoteSourceID!: string;

  @jsonMember(String, { name: 'remote_user_name' })
  remoteUserName!: string;

  @jsonMember(String, { name: 'remote_user_avatar_url' })
  remoteUserAvatarURL?: string;
}

@jsonObject
export class PrivateUserResponse {
  @jsonMember(String)
  id!: string;

  @jsonMember(String)
  username!: string;

  @jsonArrayMember(String)
  tokens: string[] = [];

  @jsonArrayMember(LinkedAccountResponse, { name: 'linked_accounts' })
  linkedAccounts: LinkedAccountResponse[] = [];
}

@jsonObject
export class LoginUserResponse {
  @jsonMember(String, { name: 'oauth2_redirect' })
  oauth2Redirect?: string;

  @jsonMember(UserResponse)
  user?: UserResponse;
}

@jsonObject
export class UserInfo {
  // TODO(sgotti) the json tags must be fixed on the backend
  @jsonMember(String, { name: 'ID' })
  id!: string;

  @jsonMember(String, { name: 'LoginName' })
  loginName!: string;

  @jsonMember(String, { name: 'Email' })
  email!: string;
}

@jsonObject
export class AuthorizeResponse {
  @jsonMember(String, { name: 'oauth2_redirect' })
  oauth2Redirect?: string;

  @jsonMember(UserInfo, { name: 'remote_user_info' })
  remoteUserInfo!: UserInfo;

  @jsonMember(String, { name: 'remote_source_name' })
  remoteSourceName!: string;
}

@jsonObject
export class RegisterUserRequest {
  @jsonMember(String, { name: 'username' })
  username!: string;

  @jsonMember(String, { name: 'remote_source_name' })
  remoteSourceName!: string;

  @jsonMember(String, { name: 'remote_source_login_name' })
  remoteSourceLoginName?: string;

  @jsonMember(String, { name: 'remote_source_login_password' })
  remoteSourceLoginPassword?: string;
}

@jsonObject
export class RegisterUserResponse {
  @jsonMember(String, { name: 'oauth2_redirect' })
  oauth2Redirect?: string;
}

@jsonObject
export class CreateUserTokenResponse {
  @jsonMember(String)
  token!: string;
}

@jsonObject
export class CreateUserLARequest {
  @jsonMember(String, { name: 'remote_source_name' })
  remoteSourceName!: string;

  @jsonMember(String, { name: 'remote_source_login_name' })
  remoteSourceLoginName?: string;

  @jsonMember(String, { name: 'remote_source_login_password' })
  remoteSourceLoginPassword?: string;
}

@jsonObject
export class CreateUserLAResponse {
  @jsonMember(LinkedAccountResponse, { name: 'linked_account' })
  linkedAccount?: LinkedAccountResponse;

  @jsonMember(String, { name: 'oauth2_redirect' })
  oauth2Redirect?: string;
}

@jsonObject
export class RemoteSourceAuthResponse {
  @jsonMember(String, { name: 'request_type' })
  requestType?: AuthType;

  @jsonMember(Object)
  response?: unknown;
}

@jsonObject
export class CreateRemoteSourceRequest {
  @jsonMember(String)
  name!: string;

  @jsonMember(String)
  apiURL!: string;

  @jsonMember(String)
  type!: string;

  @jsonMember(String, { name: 'auth_type' })
  authType!: string;

  @jsonMember(Boolean, { name: 'skip_verify' })
  skipVerify!: boolean;

  @jsonMember(String, { name: 'oauth_2_client_id' })
  oauth2ClientID?: string;

  @jsonMember(String, { name: 'oauth_2_client_secret' })
  oauth2ClientSecret?: string;

  @jsonMember(String, { name: 'ssh_host_key' })
  sshHostKey?: string;

  @jsonMember(Boolean, { name: 'skip_ssh_host_key_check' })
  skipSSHHostKeyCheck?: boolean;

  @jsonMember(Boolean, { name: 'registration_enabled' })
  registrationEnabled?: boolean;

  @jsonMember(Boolean, { name: 'login_enabled' })
  loginEnabled?: boolean;
}

@jsonObject
export class RemoteSourceResponse {
  @jsonMember(String)
  id = '';

  @jsonMember(String)
  name = '';

  @jsonMember(String, { name: 'auth_type' })
  authType = '';

  @jsonMember(Boolean, { name: 'registration_enabled' })
  registrationEnabled = false;

  @jsonMember(Boolean, { name: 'login_enabled' })
  loginEnabled = false;
}

@jsonObject
export class ProjectGroupResponse {
  @jsonMember(String)
  id = '';

  @jsonMember(String)
  name = '';

  @jsonMember(String)
  path = '';

  @jsonMember(String, { name: 'parent_path' })
  parentPath = '';

  @jsonMember(String)
  visibility!: Visibility;

  @jsonMember(String, { name: 'global_visibility' })
  globalVisibility!: Visibility;
}

@jsonObject
export class ProjectResponse {
  @jsonMember(String)
  id = '';

  @jsonMember(String)
  name = '';

  @jsonMember(String)
  path = '';

  @jsonMember(String, { name: 'parent_path' })
  parentPath = '';

  @jsonMember(String)
  visibility!: Visibility;

  @jsonMember(String, { name: 'global_visibility' })
  globalVisibility!: Visibility;

  @jsonMember(Boolean, { name: 'pass_vars_to_forked_pr' })
  passVarsToForkedPR = false;

  @jsonMember(Boolean, { name: 'members_can_perform_run_actions' })
  membersCanPerformRunActions = false;
}

export enum SecretType {
  Internal = 'internal',
  External = 'external',
}

@jsonObject
export class SecretResponse {
  @jsonMember(String)
  id!: string;

  @jsonMember(String)
  name!: string;

  @jsonMember(String, { name: 'parent_path' })
  parentPath!: string;
}

export enum WhenConditionType {
  Simple = 'simple',
  RegExp = 'regexp',
}

@jsonObject
export class WhenCondition {
  @jsonMember(String)
  type!: WhenConditionType;

  @jsonMember(String)
  match!: string;
}

@jsonObject
export class WhenConditions {
  @jsonArrayMember(WhenCondition)
  include: WhenCondition[] = [];

  @jsonArrayMember(WhenCondition)
  exclude: WhenCondition[] = [];
}

@jsonObject
export class When {
  @jsonMember(WhenConditions)
  branch?: WhenConditions;

  @jsonMember(WhenConditions)
  tag?: WhenConditions;

  @jsonMember(WhenConditions)
  ref?: WhenConditions;
}

@jsonObject
export class VariableValue {
  @jsonMember(String, { name: 'secret_name' })
  secretName!: string;

  @jsonMember(String, { name: 'secret_var' })
  secretVar!: string;

  @jsonMember(String, { name: 'matching_secret_parent_path' })
  matchingSecretParentPath!: string;

  @jsonMember(When)
  when?: When;
}

@jsonObject
export class VariableValueRequest {
  @jsonMember(String, { name: 'secret_name' })
  secretName!: string;

  @jsonMember(String, { name: 'secret_var' })
  secretVar!: string;

  @jsonMember(When)
  when?: When;
}

@jsonObject
export class CreateVariableRequest {
  @jsonMember(String)
  name!: string;

  @jsonArrayMember(VariableValue)
  values: VariableValueRequest[] = [];
}

@jsonObject
export class UpdateVariableRequest {
  @jsonMember(String)
  name!: string;

  @jsonArrayMember(VariableValue)
  values: VariableValueRequest[] = [];
}

@jsonObject
export class VariableResponse {
  @jsonMember(String)
  id!: string;

  @jsonMember(String)
  name!: string;

  @jsonArrayMember(VariableValue)
  values: VariableValue[] = [];

  @jsonMember(String, { name: 'parent_path' })
  parentPath!: string;
}

export enum RunPhase {
  SetupError = 'setuperror',
  Queued = 'queued',
  Cancelled = 'cancelled',
  Running = 'running',
  Finished = 'finished',
}

export enum RunResult {
  Unknown = 'unknown',
  Stopped = 'stopped',
  Success = 'success',
  Failed = 'failed',
}

export enum DependCondition {
  OnSuccess = 'on_success',
  OnFailure = 'on_failure',
  OnSkipped = 'on_skipped',
}

@jsonObject
export class RunConfigTaskDepend {
  @jsonMember(String, { name: 'task_id' })
  taskID = '';

  @jsonArrayMember(String)
  conditions: DependCondition[] = [];
}

export enum RunTaskStatus {
  NotStarted = 'notstarted',
  Skipped = 'skipped',
  Cancelled = 'cancelled',
  Running = 'running',
  Stopped = 'stopped',
  Success = 'success',
  Failed = 'failed',
}

function jsonRecordMember(
  type: Serializable<unknown>,
  options?: IJsonMemberOptions
): PropertyDecorator {
  options = options ?? {};
  options.deserializer = (json) => {
    const out: Record<string, unknown> = {};
    if (!json) return out;

    Object.keys(json).forEach((key) => {
      const v = TypedJSON.parse(json[key], type);
      if (!v) return;

      out[key] = v;
    });
    return out;
  };
  options.serializer = (value) => {
    return value ? value : TypedJSON.stringify(value, type);
  };

  return jsonMember(type, options);
}

@jsonObject
export class RunResponseTask {
  @jsonMember(String)
  id!: string;

  @jsonMember(String)
  name!: string;

  @jsonMember(String)
  status!: RunTaskStatus;

  @jsonMember(Number)
  level = 0;

  @jsonRecordMember(RunConfigTaskDepend)
  depends: Record<string, RunConfigTaskDepend> = {};

  @jsonMember(Boolean, { name: 'waiting_approval' })
  waitingApproval = false;

  @jsonMember(Boolean)
  approved = false;

  @jsonRecordMember(String, { name: 'approval_annotations' })
  approvalAnnotations: Record<string, string> = {};

  @jsonMember(Date, { name: 'start_time' })
  startTime?: Date;

  @jsonMember(Date, { name: 'end_time' })
  endTime?: Date;
}

@jsonObject
export class RunResponse {
  @jsonMember(Number)
  number = 0;

  @jsonMember(String)
  name = '';

  @jsonRecordMember(String)
  annotations: Record<string, string> = {};

  @jsonMember(String)
  phase!: RunPhase;

  @jsonMember(String)
  result!: RunResult;

  @jsonArrayMember(String, { name: 'setup_errors' })
  setupErrors: string[] = [];

  @jsonMember(Boolean, { name: 'pass_vars_to_forked_pr' })
  stopping = false;

  @jsonRecordMember(RunResponseTask)
  tasks: Record<string, RunResponseTask> = {};

  @jsonArrayMember(String, { name: 'tasks_waiting_approval' })
  tasksWaitingApproval: string[] = [];

  @jsonMember(Date, { name: 'enqueue_time' })
  enqueueTime?: Date;

  @jsonMember(Date, { name: 'start_time' })
  startTime?: Date;

  @jsonMember(Date, { name: 'end_time' })
  endTime?: Date;

  @jsonMember(Boolean, { name: 'can_restart_from_scratch' })
  canRestartFromScratch = false;

  @jsonMember(Boolean, { name: 'can_restart_from_failed_tasks' })
  canRestartFromFailedTasks = false;
}

enum TaskPhase {
  NotStarted = 'notstarted',
  Cancelled = 'cancelled',
  Running = 'running',
  Stopped = 'stopped',
  Success = 'success',
  Failed = 'failed',
}

@jsonObject
export class RunTaskResponseSetupStep {
  @jsonMember(String)
  phase!: TaskPhase;

  @jsonMember(String)
  name!: string;

  @jsonMember(String)
  status!: RunTaskStatus;

  @jsonMember(Date, { name: 'start_time' })
  startTime?: Date;

  @jsonMember(Date, { name: 'end_time' })
  endTime?: Date;
}

@jsonObject
export class RunTaskResponseStep {
  @jsonMember(String)
  phase!: TaskPhase;

  @jsonMember(String)
  type!: string;

  @jsonMember(String)
  name!: string;

  @jsonMember(String)
  command!: string;

  @jsonMember(String)
  shell!: string;

  @jsonMember(Number, { name: 'exit_status' })
  exitStatus!: number;

  @jsonMember(Date, { name: 'start_time' })
  startTime?: Date;

  @jsonMember(Date, { name: 'end_time' })
  endTime?: Date;

  @jsonMember(Boolean, { name: 'log_archived' })
  logArchived!: boolean;
}

@jsonObject
export class RunTaskResponse {
  @jsonMember(String)
  id!: string;

  @jsonMember(String)
  name!: string;

  @jsonMember(String)
  status!: RunTaskStatus;

  @jsonMember(Boolean, { name: 'waiting_approval' })
  waitingApproval = false;

  @jsonMember(Boolean)
  approved = false;

  @jsonRecordMember(String)
  approvalAnnotations: Record<string, string> = {};

  @jsonMember(RunTaskResponseSetupStep, { name: 'setup_step' })
  setupStep?: RunTaskResponseSetupStep;

  @jsonArrayMember(RunTaskResponseStep)
  steps: RunTaskResponseStep[] = [];

  @jsonMember(Date, { name: 'start_time' })
  startTime?: Date;

  @jsonMember(Date, { name: 'end_time' })
  endTime?: Date;
}

export const APIInjectionKey: InjectionKey<API> = Symbol();

export function useAPI(): API {
  const api = inject(APIInjectionKey);
  if (!api) {
    throw new Error('could not get api');
  }

  return api;
}
