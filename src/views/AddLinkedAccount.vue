<template>
  <div>
    <div class="column is-4 is-offset-4">
      <div v-if="remotesource">
        <LoginForm
          v-if="remotesource.auth_type == 'password'"
          action="Add Linked Account"
          :name="remotesource.name"
          v-on:login="doAddLinkedAccount(remotesource.name, $event.username, $event.password)"
        />
        <button
          v-else
          class="button is-info is-fullwidth"
          @click="doAddLinkedAccount(remotesource.name)"
        >Add Linked Account with {{remotesource.name}}</button>
      </div>
      <div v-if="addLinkedAccountError" class="message is-danger">
        <div class="message-body">{{ addLinkedAccountError }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import LoginForm from "@/components/loginform";

import { fetchRemoteSources, createUserLinkedAccount } from "@/util/data";

export default {
  name: "AddLinkedAccount",
  props: {
    username: String,
    remoteSourceName: String
  },
  components: {
    LoginForm
  },
  data: function() {
    return {
      addLinkedAccountError: null,
      remotesource: null
    };
  },
  methods: {
    resetErrors() {
      this.addLinkedAccountError = null;
    },
    async fetchRemoteSources() {
      let { data, error } = await fetchRemoteSources();
      if (error) {
        this.$store.dispatch("setError", error);
        return;
      }
      for (var i = 0; i < data.length; i++) {
        let remotesource = data[i];
        if (remotesource.name == this.remoteSourceName) {
          this.remotesource = remotesource;
          break;
        }
      }
    },
    async doAddLinkedAccount(rsName, loginname, password) {
      let { data, error } = await createUserLinkedAccount(
        this.username,
        rsName,
        loginname,
        password
      );
      if (error) {
        this.addLinkedAccountError = error;
        return;
      }
      if (data.oauth2_redirect) {
        window.location = data.oauth2_redirect;
        return;
      }
      this.$router.push({
        name: "user settings",
        params: { username: this.username }
      });
    }
  },
  created: function() {
    this.fetchRemoteSources();
  }
};
</script>




