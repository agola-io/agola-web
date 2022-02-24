import '@/css/tailwind.scss';
import { getUser } from '@/util/auth';
import '@mdi/font/css/materialdesignicons.css';
import Vue from 'vue';
import Vue2Filters from 'vue2-filters';
import App from './App.vue';
import router from './router';
import store from './store';

Vue.use(Vue2Filters);

// TODO(sgotti) use vuex for login/logout
new Vue({
  router,
  store,
  created: function () {
    let user = getUser();
    if (user) {
      store.dispatch('setUser', user);
    }
    store.dispatch('setRegisterUser', null);
  },
  render: (h) => h(App),
}).$mount('#app');
