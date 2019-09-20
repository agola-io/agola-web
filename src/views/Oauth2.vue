<template>
  <div>
    <div
      v-if="error"
      class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <span class="block sm:inline">{{ error }}</span>
    </div>
  </div>
</template>

<script>
import { fetch } from "@/util/data";

import { oauth2callbackurl, setLoggedUser } from "@/util/auth";

export default {
  components: {},
  name: "Oauth2",
  props: {},
  data() {
    return {
      error: null,
      run: null,
      code: this.$route.query.code,
      username: null
    };
  },
  methods: {
    async doOauth2() {
      let u = oauth2callbackurl();
      u.searchParams.append("code", this.$route.query.code);
      u.searchParams.append("state", this.$route.query.state);
      let { data, error } = await fetch(u);
      if (error) {
        // set local login error on failed oauth2.
        this.error = error;
        return;
      }

      if (data.request_type === "loginuser") {
        setLoggedUser(data.response.token, data.response.user);
        this.$router.push("/");
      } else if (data.request_type === "authorize") {
        this.$store.dispatch("setRegisterUser", data.response);
        this.$router.push("/register");
      } else if (data.request_type === "createuserla") {
        this.$router.push({
          name: "user settings",
          params: { username: this.username }
        });
      }
    }
  },
  created: function() {
    this.doOauth2();
  }
};
</script>

