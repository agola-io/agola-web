<template>
  <div>
    <div v-if="error" class="message is-danger">
      <div class="message-header">
        <p>Login error</p>
      </div>
      <div class="message-body">{{ error }}</div>
    </div>
    <div class="column is-4 is-offset-4">
      <div class="box" v-for="rs in remotesources" v-bind:key="rs.id">
        <LoginForm
          action="Login"
          :name="rs.name"
          v-if="rs.auth_type == 'password'"
          v-on:login="doLogin($event.username, $event.password, rs.name)"
        />
        <button
          v-else
          class="button is-info is-fullwidth"
          @click="doLogin(null, null, rs.name)"
        >Login with {{rs.name}}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchRemoteSources, login } from "@/util/data";
import { setLoggedUser, doLogout } from "@/util/auth";

import LoginForm from "@/components/loginform";

export default {
  name: "Login",
  components: {
    LoginForm
  },
  data: function() {
    return {
      error: null,
      remotesources: null
    };
  },
  methods: {
    async fetchRemoteSources() {
      let { data, error } = await fetchRemoteSources();
      if (error) {
        this.$store.dispatch("setError", error);
        return;
      }
      this.remotesources = data;
    },
    async doLogin(username, password, remotesourcename) {
      this.error = null;

      let { data, error } = await login(username, password, remotesourcename);
      if (error) {
        // set local login error on failed login.
        this.error = error;
        return;
      }
      if (data.oauth2_redirect) {
        window.location = data.oauth2_redirect;
        return;
      }
      setLoggedUser(data.token, data.user);
      this.$router.push({ name: "home" });
    }
  },
  created: function() {
    doLogout();
    this.fetchRemoteSources();
  }
};
</script>


