<template>
  <div class="home flex flex-col items-center">
    <img 
      class="w-64 h-64"
      src="/img/agola-logo-name.svg" alt="agola logo" 
    />
    <h1 class="text-2xl">CI/CD redefined</h1>
    <div class="m-8">
      <h1 class="text-lg">
        Hi, you are almost ready to go! Just
        <router-link class="underline text-blue-600" to="/login"> login</router-link>
        into your account
        or create a 
        <router-link
          class="underline text-blue-600"
          to="/register"
        >
          new one
        </router-link>
      </h1>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Home",
  components: {},
  computed: {
    ...mapGetters(["user"])
  },
  created: function() {
    let user = this.$store.getters.user;
    if (user) {
      this.$router.push({
        name: "user",
        params: { username: this.user.username }
      });
    }
  }
};
</script>
