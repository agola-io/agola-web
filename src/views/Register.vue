<template>
  <div>
    <div
      v-if="error"
      class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <span class="block sm:inline">{{ error }}</span>
    </div>
    <div v-if="registeruser" class="my-6 flex justify-center items-center">
      <div>
        <RegisterForm
          :remote-username="registeruser.remote_user_info.LoginName"
          :username="registeruser.remote_user_info.LoginName"
          v-on:login="
            doRegister(
              registeruser.remote_source_name,
              $event.username,
              registeruser.remote_source_login_name,
              registeruser.remote_source_login_password
            )
          "
        />
      </div>
    </div>
    <div
      v-else-if="!hasRemoteSources"
      class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
    >
      No remote sources defined
      <router-link
        class="underline text-blue-600 block"
        to="/newsource"
      >
        <button class="btn btn-blue">
          Create one
        </button>
      </router-link>
    </div>
    <div
      v-else-if="!hasRegisterRemoteSources"
      class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
    >
      No remote sources enabled for registration
    </div>
    <div v-else>
      <div
        class="my-6 flex justify-center items-center"
        v-for="rs in remotesources"
        v-bind:key="rs.id"
      >
        <div v-if="rs.registration_enabled">
          <LoginForm
            action="Register"
            :name="rs.name"
            v-if="rs.auth_type == 'password'"
            v-on:login="doAuthorize(rs.name, $event.username, $event.password)"
          />
          <div v-else class="w-full max-w-xs">
            <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
              <div class="flex justify-center">
                <button
                  class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  @click="doAuthorize(rs.name)"
                >
                  Register with {{ rs.name }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import LoginForm from "@/components/loginform";
import RegisterForm from "@/components/registerform";

import { fetchRemoteSources, register } from "@/util/data";

import { authorizeurl, fetch, doLogout } from "@/util/auth";

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
    ...mapGetters(["registeruser"]),

    hasRemoteSources() {
      if (this.remotesources) {
        return this.remotesources.length > 0;
      }
      return false;
    },
    hasRegisterRemoteSources() {
      for (let rs of this.remotesources) {
        if (rs.registration_enabled) {
          return true;
        }
      }
      return false;
    }
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
      let res = await (
        await fetch(u, {
          method: "POST",
          body: JSON.stringify({
            remote_source_name: remotesourcename,
            login_name: username,
            password: password
          })
        })
      ).json();

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
  mounted: function() {
    this.$store.dispatch("setError", null);
  },
  created: function() {
    doLogout();
    this.fetchRemoteSources();
  }
};
</script>



