<template>
  <div>
    <div
      v-if="error"
      class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <span class="block sm:inline">{{ error }}</span>
    </div>
    <div>
      <div
        class="my-6 flex justify-center items-center"
        v-for="rs in remotesources"
        v-bind:key="rs.id"
      >
        <div v-if="rs.login_enabled">
          <LoginForm
            action="Login"
            :name="rs.name"
            v-if="rs.auth_type == 'password'"
            v-on:login="doLogin($event.username, $event.password, rs.name)"
          />
          <div v-else class="w-full max-w-xs">
            <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
              <div class="flex justify-center">
                <button
                  class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  @click="doLogin(null, null, rs.name)"
                >Login with {{rs.name}}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchRemoteSources, login } from "@/util/data";
import {
  setLoggedUser,
  unsetLoginRedirect,
  setLoginRedirect,
  doLogout
} from "@/util/auth";

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
      unsetLoginRedirect();
      let redirect = this.$route.query["redirect"];

      this.error = null;

      let { data, error } = await login(username, password, remotesourcename);
      if (error) {
        // set local login error on failed login.
        this.error = error;
        return;
      }
      if (data.oauth2_redirect) {
        if (redirect) {
          setLoginRedirect(redirect);
        }
        window.location = data.oauth2_redirect;
        return;
      }
      setLoggedUser(data.token, data.user);
      if (redirect) {
        unsetLoginRedirect();
        this.$router.push(redirect);
      } else {
        this.$router.push({ name: "home" });
      }
    }
  },
  mounted: function() {
    this.$store.dispatch("setError", null);
  },
  created: function() {
    doLogout();
    this.fetchRemoteSources();
  }
};
</script>


