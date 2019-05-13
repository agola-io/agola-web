<template>
  <div>
    <h4 class="title is-4">Linked Accounts</h4>
    <div class="message is-danger">
      <div
        class="message-body"
      >Removing a Linked Account will also block all the projects that uses this Linked Account to access their remote repository</div>
    </div>
    <div v-if="user.linked_accounts">
      <div class="item-list" v-for="(la, index) in user.linked_accounts" v-bind:key="index">
        <nav class="level item">
          <div class="level-left">
            <div class="level-item">
              <div>
                <span class="name">{{la.remote_user_name}}</span>
                <span class="remotesource-name">( {{laRemoteSourceName(la)}} )</span>
              </div>
            </div>
          </div>
          <div class="level-right">
            <div class="level-item">
              <button class="button is-primary" @click="deleteLinkedAccount(la)">Delete</button>
            </div>
          </div>
        </nav>
      </div>
      <div v-if="deleteLinkedAccountError" class="message is-danger">
        <div class="message-body">{{ deleteLinkedAccountError }}</div>
      </div>
    </div>
    <div v-else>No linked accounts</div>
    <hr>
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
  deleteUserToken,
  deleteLinkedAccount
} from "@/util/data.js";

export default {
  components: {},
  name: "usersettings",
  props: {},
  data() {
    return {
      createUserTokenError: null,
      deleteUserTokenError: null,
      deleteLinkedAccountError: null,
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
      this.deleteLinkedAccountError = null;
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
    laRemoteSourceName(la) {
      for (var i = 0; i < this.remotesources.length; i++) {
        let rs = this.remotesources[i];
        if (rs.id == la.remote_source_id) {
          return rs.name;
        }
      }
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
    closeNewTokenNotification() {
      this.token = null;
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
    async deleteLinkedAccount(la) {
      this.resetErrors();

      let { error } = await deleteLinkedAccount(this.user.username, la.id);
      if (error) {
        this.deleteLinkedAccountError = error;
        return;
      }
      this.fetchCurrentUser();
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
    border-bottom: 1px solid $grey-lighter;
    padding: 10px;
  }
  .name {
    font-weight: bold;
  }
  .remotesource-name {
    margin-left: 1rem;
  }
}
</style>

