// add twind as first entry in document head
import './util/twind';

import 'anylogger-loglevel';
import loglevel from 'loglevel';

import '@mdi/font/css/materialdesignicons.css';
import './assets/style.scss';
import './assets/ansi.scss';

import { createApp } from 'vue';

import App from './App.vue';
import router, { setupNavigationGuards } from './router';
import delay from './components/delay.vue';
import { AppStateInjectionKey, newAppState } from './app/appstate';
import { newAPI, APIInjectionKey } from './app/api';
import { newAuth, AuthInjectionKey } from './app/auth';

// loglevel.setDefaultLevel('debug');
loglevel.setDefaultLevel('info');

const app = createApp(App);

app.component('delay', delay);

const appState = newAppState();
app.provide(AppStateInjectionKey, appState);

const api = newAPI();
app.provide(APIInjectionKey, api);

const auth = newAuth(router, api);
app.provide(AuthInjectionKey, auth);

api.setAuth(auth);

setupNavigationGuards(auth, api, appState);

app.use(router);

app.mount('#app');
