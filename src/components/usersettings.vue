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
    </div>
    <div v-else class="item-list">No user tokens</div>
    <hr>
    <div v-if="token" class="notification is-success">
      <button class="delete" @click="closeNewTokenNotification()"></button>
      User token created: {{token}}
    </div>
    <h4 class="title is-4">Create new User Token</h4>
    <div class="field is-grouped">
      <div class="control">
        <input class="input is-primary" type="text" placeholder="Token name" v-model="newtokenname">
      </div>
      <button class="button is-primary" @click="createUserToken()">Create Token</button>
    </div>
  </div>
</template>

<script>
import {
  fetchCurrentUser,
  createUserToken,
  deleteUserToken
} from "@/util/data.js";

export default {
  components: {},
  name: "usersettings",
  props: {},
  data() {
    return {
      user: [],
      token: null,
      newtokenname: null
    };
  },
  methods: {
    async createUserToken() {
      let res = await createUserToken(this.user.username, this.newtokenname);
      this.token = res.token;
      this.newtokenname = null;
      this.user = await fetchCurrentUser();
    },
    async deleteUserToken(tokenname) {
      await deleteUserToken(this.user.username, tokenname);
      this.user = await fetchCurrentUser();
    },
    closeNewTokenNotification() {
      this.token = null;
    }
  },
  created: async function() {
    this.user = await fetchCurrentUser();
  }
};
</script>

<style scoped lang="scss">
@import "@/css/_variables.scss";
</style>

