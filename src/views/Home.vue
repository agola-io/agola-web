<template>
  <div class="home"></div>
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
