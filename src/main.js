// add twind as first entry in document head
import './util/twind';

import '@mdi/font/css/materialdesignicons.css';
import './assets/style.scss';
import './assets/ansi.scss';

import { getUser } from './util/auth';
import App from './App.vue';
import router from './router';
import { store } from './store';
import { createApp } from 'vue';

import 'anylogger-loglevel';
import loglevel from 'loglevel';

// loglevel.setDefaultLevel('debug');
loglevel.setDefaultLevel('info');

const app = createApp(App);

const user = getUser();
if (user) {
  store.dispatch('setUser', user);
}
store.dispatch('setRegisterUser', null);

app.use(router);
app.use(store);

app.mount('#app');
