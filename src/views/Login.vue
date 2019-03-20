<template>
  <div>
    <div class="column is-4 is-offset-4">
      <div class="box" v-for="rs in remotesources" v-bind:key="rs.id">
        <Loginform
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
import Loginform from "@/components/loginform";
import { apiurl, loginurl, fetch, login, logout } from "@/util/auth";

export default {
  name: "Login",
  components: {
    Loginform
  },
  data: function() {
    return {
      remotesources: null
    };
  },
  methods: {
    getRemoteSources() {
      fetch(apiurl("/remotesources"))
        .then(res => res.json())
        .then(res => {
          console.log("remote sources result", res);
          this.remotesources = res;
        });
    },
    doLogin(rsName, username, password) {
      let u = loginurl();
      console.log("u:", u);
      fetch(u, {
        method: "POST",
        body: JSON.stringify({
          remote_source_name: rsName,
          login_name: username,
          password: password
        })
      })
        .then(res => res.json())
        .then(res => {
          console.log("login result", res);
          if (res.oauth2_redirect) {
            window.location = res.oauth2_redirect;
            return;
          }
          login(res.token, res.user);
          this.$router.push({ name: "home" });
        });
    }
  },
  created: function() {
    logout();
    this.getRemoteSources();
  }
};
</script>


