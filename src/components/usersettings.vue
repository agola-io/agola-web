<template>
  <div>
    <h4 class="title is-4">User Tokens</h4>
    <div v-if="user.tokens">
      <div class="item-list" v-for="token in user.tokens" v-bind:key="token">
        <div class="field is-grouped">
          <div class="control">
            <input class="input" disabled type="text" placeholder="Token name" :value="token">
          </div>
          <button class="button is-primary" @click="deleteUserToken(token)">Delete</button>
        </div>
      </div>
      <div v-if="deleteUserTokenError" class="message is-danger">
        <div class="message-body">{{ deleteUserTokenError }}</div>
      </div>
    </div>
    <div v-else>No user tokens</div>
    <hr>
    <div v-if="token" class="notification is-success">
      <button class="delete" @click="closeNewTokenNotification()"></button>
      User token created: {{token}}
    </div>
    <h5 class="title is-5">Create new User Token</h5>
    <div class="field is-grouped">
      <div class="control">
        <input class="input is-primary" type="text" placeholder="Token name" v-model="newtokenname">
      </div>
      <button class="button is-primary" @click="createUserToken()">Create Token</button>
    </div>
    <div v-if="createUserTokenError" class="message is-danger">
      <div class="message-body">{{ createUserTokenError }}</div>
    </div>
  </div>
</template>

<script>
import {
  fetchCurrentUser,
  fetchRemoteSources,
  createUserToken,
  deleteUserToken
} from "@/util/data.js";

export default {
  components: {},
  name: "usersettings",
  props: {},
  data() {
    return {
      createUserTokenError: null,
      deleteUserTokenError: null,
      user: [],
      remotesources: [],
      token: null,
      newtokenname: null
    };
  },
  methods: {
    resetErrors() {
      this.createUserTokenError = null;
      this.deleteUserTokenError = null;
    },
    async fetchCurrentUser() {
      let { data, error } = await fetchCurrentUser();
      if (error) {
        this.$store.dispatch("setError", error);
        return;
      }
      this.user = data;
    },
    async fetchRemoteSources() {
      let { data, error } = await fetchRemoteSources();
      if (error) {
        this.$store.dispatch("setError", error);
        return;
      }
      this.remotesources = data;
    },
    async createUserToken() {
      this.resetErrors();

      let { data, error } = await createUserToken(
        this.user.username,
        this.newtokenname
      );
      if (error) {
        this.createUserTokenError = error;
        return;
      }
      this.token = data.token;
      this.newtokenname = null;
      this.fetchCurrentUser();
    },
    async deleteUserToken(tokenname) {
      this.resetErrors();

      let { error } = await deleteUserToken(this.user.username, tokenname);
      if (error) {
        this.deleteUserTokenError = error;
        return;
      }
      this.fetchCurrentUser();
    },
    closeNewTokenNotification() {
      this.token = null;
    }
  },
  created: function() {
    this.fetchCurrentUser();
    this.fetchRemoteSources();
  }
};
</script>

<style scoped lang="scss">
@import "@/css/_variables.scss";

.item-list {
  .item {
    margin-bottom: 5px;
    border: 1px solid $grey-lighter;
    cursor: pointer;
    display: flex;
    padding: 10px;
  }
  .name {
    font-weight: bold;
  }
}
</style>

