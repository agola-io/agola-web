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

import { apiurl, authorizeurl, registerurl, fetch, logout } from "@/util/auth";

export default {
  name: "Register",
  components: {
    LoginForm,
    RegisterForm
  },
  data: function() {
    return {
      remotesources: null
    };
  },
  computed: {
    ...mapGetters(["registeruser"])
  },
  methods: {
    async getRemoteSources() {
      let res = await (await fetch(apiurl("/remotesources"))).json();
      this.remotesources = res;
    },
    async doAuthorize(rsName, username, password) {
      let u = authorizeurl();
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
      this.$store.dispatch("setRegisterUser", {
        remote_user_info: res.remote_user_info,
        remote_source_name: res.remote_source_name,
        remote_source_login_name: username,
        remote_source_login_password: password
      });
    },
    async doRegister(
      rsName,
      username,
      remote_login_name,
      remote_login_password
    ) {
      let u = registerurl();
      let res = await (await fetch(u, {
        method: "POST",
        body: JSON.stringify({
          username: username,
          remote_source_name: rsName,
          remote_source_login_name: remote_login_name,
          remote_source_login_password: remote_login_password
        })
      })).json();

      if (res.oauth2_redirect) {
        window.location = res.oauth2_redirect;
        return;
      }
      this.$router.push({ name: "home" });
    }
  },
  created: function() {
    logout();
    this.getRemoteSources();
  }
};
</script>



