<template>
  <div>
    <div class="column is-4 is-offset-4">
      <div class="box" v-for="rs in remotesources" v-bind:key="rs.id">
        <LoginForm
          action="Login"
          :name="rs.name"
          v-if="rs.auth_type == 'password'"
          v-on:login="doLogin(rs.name, $event.username, $event.password)"
        />
        <button
          v-else
          class="button is-info is-fullwidth"
          @click="doLogin(rs.name)"
        >Login with {{rs.name}}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchRemoteSources } from "@/util/data";
import { loginurl, fetch, login, logout } from "@/util/auth";

import LoginForm from "@/components/loginform";

export default {
  name: "Login",
  components: {
    LoginForm
  },
  data: function() {
    return {
      remotesources: null
    };
  },
  methods: {
    async getRemoteSources() {
      this.remotesources = await fetchRemoteSources();
    },
    async doLogin(rsName, username, password) {
      let u = loginurl();
      let res = await (await fetch(u, {
        method: "POST",
        body: JSON.stringify({
          remote_source_name: rsName,
          login_name: username,
          password: password
        })
      })).json();
      if (res.oauth2_redirect) {
        window.location = res.oauth2_redirect;
        return;
      }
      login(res.token, res.user);
      this.$router.push({ name: "home" });
    }
  },
  created: function() {
    logout();
    this.getRemoteSources();
  }
};
</script>


