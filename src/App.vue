<template>
  <div id="app">
    <nav class="navbar is-light has-shadow" role="navigation" aria-label="main navigation">
      <div class="container">
        <div class="navbar-brand">
          <a class="navbar-item" href="/">
            <h1>Agola</h1>
          </a>

          <a
            role="button"
            class="navbar-burger burger"
            aria-label="menu"
            aria-expanded="false"
            data-target="navbarBasicExample"
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>
        <div class="navbar-menu">
          <div class="navbar-start"></div>
          <div class="navbar-end">
            <div
              v-if="user"
              class="navbar-item has-dropdown"
              v-click-outside="() => createDropdownActive = false"
              v-bind:class="{ 'is-active': createDropdownActive }"
            >
              <a class="navbar-link" @click="toggleCreateDropdown()">
                <i class="mdi mdi-plus-box mdi-24px"/>
              </a>
              <div class="navbar-dropdown">
                <router-link class="navbar-item" to="/neworganization">New Organization</router-link>
              </div>
            </div>
            <div
              v-if="user"
              class="navbar-item has-dropdown"
              v-click-outside="() => userDropdownActive = false"
              v-bind:class="{ 'is-active': userDropdownActive }"
            >
              <a class="navbar-link" @click="toggleUserDropdown()">{{user.username}}</a>
              <div class="navbar-dropdown">
                <div class="navbar-item">
                  Logged as&nbsp;
                  <b>{{user.username}}</b>
                </div>
                <hr class="navbar-divider">
                <router-link class="navbar-item" to="/logout">
                  <i class="mdi mdi-logout"></i>Logout
                </router-link>
              </div>
            </div>
            <div v-else class="navbar-item">
              <router-link class="button" to="/register">Sign up</router-link>
              <router-link class="button" to="/login">Login</router-link>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <div v-if="error" class="container">
      <div class="message is-danger global-error-message">
        <div class="message-body">
          <nav class="level">
            <div class="level-left">
              <div class="level-item">
                <p>Failed to fetch data: {{ error }}</p>
              </div>
            </div>
            <div class="level-right">
              <div class="level-item">
                <button class="button is-danger" @click="reload()">Retry</button>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </div>
    <div v-else class="main-container container">
      <router-view v-if="routerActive"></router-view>
    </div>
  </div>
</template>


<script>
import vClickOutside from "v-click-outside";

import { mapGetters } from "vuex";

export default {
  name: "App",
  directives: {
    clickOutside: vClickOutside.directive
  },
  components: {},
  computed: {
    ...mapGetters(["error", "user"])
  },
  data() {
    return {
      routerActive: true,
      userDropdownActive: false,
      createDropdownActive: false
    };
  },
  watch: {
    user: function(user) {
      if (user) {
        this.$router.push({
          name: "user",
          params: { username: this.user.username }
        });
      }
    },
    $route: function() {
      this.userDropdownActive = false;
      this.createDropdownActive = false;
    }
  },
  // method to reload current view from https://github.com/vuejs/vue-router/issues/296#issuecomment-356530037
  methods: {
    reload() {
      this.$store.dispatch("setError", null);
      this.routerActive = false;
      this.$nextTick(() => (this.routerActive = true));
    },
    toggleUserDropdown() {
      this.userDropdownActive = !this.userDropdownActive;
    },
    toggleCreateDropdown() {
      this.createDropdownActive = !this.createDropdownActive;
    }
  }
};
</script>

<style lang="scss">
@import "@/css/main.scss";

.main-container {
  margin-top: 2rem;
}

.global-error-message {
  margin-top: 10rem;
}
</style>