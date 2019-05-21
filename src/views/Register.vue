<template>
  <div>
    <div v-if="registeruser" class="column is-4 is-offset-4">
      <div>{{registeruser.remote_user_info.LoginName}}</div>
      <RegisterForm
        :username="registeruser.remote_user_info.LoginName"
        v-on:login="doRegister(registeruser.remote_source_name, $event.username, registeruser.remote_source_login_name, registeruser.remote_source_login_password)"
      />
    </div>
    <div v-else class="column is-4 is-offset-4">
      <div class="box" v-for="rs in remotesources" v-bind:key="rs.id">
        <LoginForm
          action="Register"
          :name="rs.name"
          v-if="rs.auth_type == 'password'"
          v-on:login="doAuthorize(rs.name, $event.username, $event.password)"
        />
        <button
          v-else
          class="button is-info is-fullwidth"
          @click="doAuthorize(rs.name)"
        >Register with {{rs.name}}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import LoginForm from "@/components/loginform";
import RegisterForm from "@/components/registerform";

import { fetchRemoteSources, register } from "@/util/data";

import { authorizeurl, registerurl, fetch, doLogout } from "@/util/auth";

export default {
  name: "Register",
  components: {
    LoginForm,
    RegisterForm
  },
  data: function() {
    return {
      error: null,
      remotesources: null
    };
  },
  computed: {
    ...mapGetters(["registeruser"])
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
    async doAuthorize(remotesourcename, username, password) {
      let u = authorizeurl();
      let res = await (await fetch(u, {
        method: "POST",
        body: JSON.stringify({
          remote_source_name: remotesourcename,
          login_name: username,
          password: password
        })
      })).json();

      if (res.oauth2_redirect) {
        window.location = res.oauth2_redirect;
        return;
      }
      this.$store.dispatch("setRegisterUser", {
        remote_user_info: res.remote_user_info,
        remote_source_name: res.remote_source_name,
        remote_source_login_name: username,
        remote_source_login_password: password
      });
    },
    async doRegister(
      remotesourcename,
      username,
      remote_login_name,
      remote_login_password
    ) {
      this.error = null;

      let { data, error } = await register(
        username,
        remotesourcename,
        remote_login_name,
        remote_login_password
      );
      if (error) {
        // set local login error on failed login.
        this.error = error;
        return;
      }
      if (data.oauth2_redirect) {
        window.location = data.oauth2_redirect;
        return;
      }
      this.$router.push({ name: "home" });
    }
  },
  created: function() {
    doLogout();
    this.fetchRemoteSources();
  }
};
</script>



