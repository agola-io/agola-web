<template>
  <div>
    <nav class="panel">
      <p class="panel-heading">Linked Accounts</p>
      <div class="panel-block is-block">
        <div class="message is-danger">
          <div
            class="message-body"
          >Removing a Linked Account will also block all the projects that uses this Linked Account to access their remote repository</div>
        </div>
        <ul v-if="user.linked_accounts">
          <li class="item-list" v-for="(la, index) in user.linked_accounts" v-bind:key="index">
            <div class="level item">
              <div class="level-left">
                <div class="level-item">
                  <div>
                    <span class="name">{{la.remote_user_name}}</span>
                    <span class="remotesource-name">(on remote source {{laRemoteSourceName(la)}})</span>
                  </div>
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <button class="button is-primary" @click="deleteLinkedAccount(la)">Delete</button>
                </div>
              </div>
            </div>
          </li>
          <div v-if="deleteLinkedAccountError" class="message is-danger">
            <div class="message-body">{{ deleteLinkedAccountError }}</div>
          </div>
        </ul>
        <div v-else>No linked accounts</div>
      </div>
      <div v-if="remotesources.length" class="panel-block is-block">
        <h5 class="title is-5">Add new linked account</h5>
        <div class="field is-grouped">
          <div class="control">
            <div class="select">
              <select v-model="selectedRemoteSourceName">
                <option v-for="rs in remotesources" v-bind:key="rs.id">{{ rs.name }}</option>
              </select>
            </div>
          </div>
          <button class="button is-primary" @click="addLinkedAccount()">Add Linked Account</button>
        </div>
      </div>
    </nav>

    <nav class="panel">
      <p class="panel-heading">User Tokens</p>
      <div class="panel-block is-block">
        <div v-if="user.tokens">
          <div class="item-list" v-for="token in user.tokens" v-bind:key="token">
            <nav class="level item">
              <div class="level-left">
                <div class="level-item">
                  <div class="control">
                    <input
                      class="input"
                      disabled
                      type="text"
                      placeholder="Token name"
                      :value="token"
                    >
                  </div>
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <button class="button is-primary" @click="deleteUserToken(token)">Delete</button>
                </div>
              </div>
            </nav>
          </div>
          <div v-if="deleteUserTokenError" class="message is-danger">
            <div class="message-body">{{ deleteUserTokenError }}</div>
          </div>
        </div>
        <div v-else>No user tokens</div>
      </div>

      <div class="panel-block is-block">
        <div v-if="token" class="notification is-success">
          <button class="delete" @click="closeNewTokenNotification()"></button>
          User token created: {{token}}
        </div>
        <h5 class="title is-5">Create new User Token</h5>
        <div class="field is-grouped">
          <div class="control">
            <input
              class="input is-primary"
              type="text"
              placeholder="Token name"
              v-model="newtokenname"
            >
          </div>
          <button class="button is-primary" @click="createUserToken()">Create Token</button>
        </div>
        <div v-if="createUserTokenError" class="message is-danger">
          <div class="message-body">{{ createUserTokenError }}</div>
        </div>
      </div>
    </nav>
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

import { userAddLinkedAccountLink } from "@/util/link.js";

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
      newtokenname: null,
      selectedRemoteSourceName: null
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
      if (this.remotesources.length) {
        this.selectedRemoteSourceName = this.remotesources[0].name;
      }
    },
    laRemoteSourceName(la) {
      for (var i = 0; i < this.remotesources.length; i++) {
        let rs = this.remotesources[i];
        if (rs.id == la.remote_source_id) {
          return rs.name;
        }
      }
    },
    addLinkedAccount() {
      let path = userAddLinkedAccountLink(
        this.user.username,
        this.selectedRemoteSourceName
      );
      this.$router.push(path);
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
    padding: 10px;
  }
  .name {
    font-weight: bold;
  }
  .remotesource-name {
    margin-left: 0.5rem;
  }
}
</style>

