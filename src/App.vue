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
            <div v-if="user" class="navbar-item has-dropdown is-hoverable">
              <a class="navbar-link">{{user.username}}</a>
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
    <div class="main-container container">
      <router-view></router-view>
    </div>
  </div>
</template>


<script>
import { mapGetters } from "vuex";

export default {
  name: "App",
  components: {},
  computed: {
    ...mapGetters(["user"])
  },
  watch: {
    user: function(user) {
      if (user) {
        this.$router.push({
          name: "user",
          params: { username: this.user.username }
        });
      }
    }
  }
};
</script>

<style lang="scss">
@import "@/css/main.scss";

.main-container {
  margin-top: 2rem;
}
</style>