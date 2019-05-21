import router from "@/router";
import store from "@/store";

const ID_TOKEN_KEY = 'id_token';
const USER_KEY = 'user';

let API_URL = window.CONFIG.API_URL;
let API_BASE_PATH = window.CONFIG.API_BASE_PATH;

export function setLoggedUser(token, user) {
    setIdToken(token);
    setUser(user);
    store.dispatch('setUser', user)
}

export function doLogout() {
    unsetIdToken();
    unsetUser()
    store.dispatch('setUser', null)
}

export function apiurlwithtoken(path) {
    let u = new URL(API_URL + API_BASE_PATH + path);
    let idToken = getIdToken();
    if (idToken) {
        u.searchParams.append("access_token", idToken);
    }
    return u
}

export function apiurl(path) {
    return new URL(API_URL + API_BASE_PATH + path);
}

export function loginurl() {
    return new URL(API_URL + "/api/login");
}

export function authorizeurl() {
    return new URL(API_URL + "/api/authorize");
}

export function registerurl() {
    return new URL(API_URL + "/api/register");
}

export function oauth2callbackurl() {
    return new URL(API_URL + "/api/oauth2/callback");
}

export async function loginapi(init) {
    if (init === undefined) {
        init = {}
    }

    try {
        let res = await window.fetch(loginurl(), init)
        return res
    } catch (e) {
        throw e
    }
}

export async function registerapi(init) {
    if (init === undefined) {
        init = {}
    }

    try {
        let res = await window.fetch(registerurl(), init)
        return res
    } catch (e) {
        throw e
    }
}

export async function fetch(url, init) {
    if (init === undefined) {
        init = {}
    }
    if (init.headers === undefined) {
        init["headers"] = {}
    }
    let idToken = getIdToken();
    if (idToken) {
        init.headers["Authorization"] = "bearer " + idToken
    }

    try {
        let res = await window.fetch(url, init)
        if (res.status === 401) {
            router.push({ name: "login" })
        } else { return res }
    } catch (e) {
        throw e
    }
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
        return JSON.parse(user)
    }
    return null
}

export function unsetUser() {
    localStorage.removeItem(USER_KEY);
}

export function isLoggedIn() {
    const idToken = getIdToken();
    return !!idToken;
}
