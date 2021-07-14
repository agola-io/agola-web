import store from "@/store";

const ID_TOKEN_KEY = "id_token";
const USER_KEY = "user";
const LOGIN_REDIRECT_KEY = "login_redirect";

let API_URL = window.CONFIG.API_URL;
let API_BASE_PATH = window.CONFIG.API_BASE_PATH;

export function setLoggedUser(token, user) {
  setIdToken(token);
  setUser(user);
  store.dispatch("setUser", user);
}

export function doLogout() {
  unsetIdToken();
  unsetUser();
  store.dispatch("setUser", null);
}

export function apiurlwithtoken(path) {
  let u = new URL(API_URL + API_BASE_PATH + path);
  let idToken = getIdToken();
  if (idToken) {
    u.searchParams.append("access_token", idToken);
  }
  return u;
}

export function apiurl(path) {
  return new URL(API_URL + API_BASE_PATH + path);
}

export function loginurl() {
  return apiurl("/auth/login");
}

export function authorizeurl() {
  return apiurl("/auth/authorize");
}

export function registerurl() {
  return new apiurl("/auth/register");
}

export function oauth2callbackurl() {
  return new apiurl("/auth/oauth2/callback");
}

export async function loginapi(init) {
  if (init === undefined) {
    init = {};
  }

  return await window.fetch(loginurl(), init);
}

export async function registerapi(init) {
  if (init === undefined) {
    init = {};
  }

  return await window.fetch(registerurl(), init);
}

export async function fetch(url, init, signal, token, tokenType = "bearer") {
  if (!init) {
    init = {};
  }
  if (init.headers === undefined) {
    init["headers"] = {};
  }
  if (signal) {
    init["signal"] = signal;
  }
  let idToken = token || getIdToken();
  if (idToken) {
    init.headers["Authorization"] = tokenType + " " + idToken;
  }

  return await window.fetch(url, init);
}

export function setIdToken(idToken) {
  localStorage.setItem(ID_TOKEN_KEY, idToken);
}

export function getIdToken() {
  return localStorage.getItem(ID_TOKEN_KEY);
}

export function unsetIdToken() {
  localStorage.removeItem(ID_TOKEN_KEY);
}

export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser() {
  let user = localStorage.getItem(USER_KEY);
  if (user) {
    return JSON.parse(user);
  }
  return null;
}

export function unsetUser() {
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn() {
  const idToken = getIdToken();
  return !!idToken;
}

export function getLoginRedirect() {
  return sessionStorage.getItem(LOGIN_REDIRECT_KEY);
}

export function setLoginRedirect(url) {
  sessionStorage.setItem(LOGIN_REDIRECT_KEY, url);
}

export function unsetLoginRedirect() {
  return sessionStorage.removeItem(LOGIN_REDIRECT_KEY);
}
