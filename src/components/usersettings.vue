<template>
  <div>
    <div class="panel">
      <p class="panel-title">Linked Accounts</p>
      <div class="p-4">
        <div
          class="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded"
          role="alert"
        >
          <p>
            Removing a Linked Account will also block all the projects that uses
            this Linked Account to access their remote repository
          </p>
        </div>
        <ul v-if="user.linked_accounts">
          <li
            class="flex justify-between items-center mb-2"
            v-for="(la, index) in user.linked_accounts"
            v-bind:key="index"
          >
            <div>
              <span class="font-bold">{{ la.remote_user_name }}</span>
              <span class="ml-1"
                >(on remote source {{ laRemoteSourceName(la) }})</span
              >
            </div>
            <button class="btn btn-red" @click="deleteLinkedAccount(la)">
              Delete
            </button>
          </li>
          <div
            v-if="deleteLinkedAccountError"
            class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span class="block sm:inline">{{ deleteLinkedAccountError }}</span>
          </div>
        </ul>
        <div v-else>No linked accounts</div>
      </div>
      <div v-if="remotesources.length" class="p-4 border-t">
        <h5 class="mb-3 text-xl">Add new linked account</h5>

        <div class="inline-block">
          <div class="flex mb-3 relative w-64">
            <select
              class="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
              v-model="selectedRemoteSourceName"
            >
              <option v-for="rs in remotesources" v-bind:key="rs.id">
                {{ rs.name }}
              </option>
            </select>
          </div>
        </div>

        <button class="ml-3 btn btn-blue" @click="addLinkedAccount()">
          Add Linked Account
        </button>
      </div>
    </div>

    <div class="panel">
      <p class="panel-title">User Tokens</p>
      <div class="p-4">
        <ul v-if="user.tokens">
          <li
            class="flex justify-between items-center mb-2"
            v-for="token in user.tokens"
            v-bind:key="token"
          >
            <span class="font-bold">{{ token }}</span>
            <button class="btn btn-red" @click="deleteUserToken(token)">
              Delete
            </button>
          </li>
          <div
            v-if="deleteUserTokenError"
            class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span class="block sm:inline">{{ deleteUserTokenError }}</span>
          </div>
        </ul>
        <div v-else>No user tokens</div>
      </div>

      <div class="p-4 border-t">
        <div
          v-if="token"
          class="my-3 relative bg-teal-100 border-t-4 border-teal-500 rounded-b text-teal-900 px-4 py-3 shadow-md"
          role="alert"
        >
          <div class="flex">
            <div class="py-1">
              <svg
                class="fill-current h-6 w-6 text-teal-500 mr-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path
                  d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"
                ></path>
              </svg>
            </div>
            <div>
              <p class="font-bold">
                User token created. Copy it now since it won't be showed again
              </p>
              <p class="text-sm">{{ token }}</p>
            </div>
          </div>
          <span
            class="absolute top-0 bottom-0 right-0 px-4 py-3"
            @click="closeNewTokenNotification()"
          >
            <svg
              class="fill-current h-6 w-6 text-teal-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>Close</title>
              <path
                d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"
              ></path>
            </svg>
          </span>
        </div>
        <h5 class="mb-3 text-xl">Create new User Token</h5>
        <div class="control">
          <input
            class="shadow appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            placeholder="Token name"
            v-model="newtokenname"
          />
          <button class="ml-3 btn btn-blue" @click="createUserToken()">
            Create Token
          </button>
        </div>
        <div
          v-if="createUserTokenError"
          class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span class="block sm:inline">{{ createUserTokenError }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  fetchCurrentUser,
  fetchRemoteSources,
  createUserToken,
  deleteUserToken,
  deleteLinkedAccount,
} from '../util/data';

import { userAddLinkedAccountLink } from '../util/link';

export default {
  components: {},
  name: 'usersettings',
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
      selectedRemoteSourceName: null,
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
        this.$store.dispatch('setError', error);
        return;
      }
      this.user = data;
    },
    async fetchRemoteSources() {
      let { data, error } = await fetchRemoteSources();
      if (error) {
        this.$store.dispatch('setError', error);
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
    },
  },
  created: function () {
    this.fetchCurrentUser();
    this.fetchRemoteSources();
  },
};
</script>

<style scoped lang="scss"></style>
