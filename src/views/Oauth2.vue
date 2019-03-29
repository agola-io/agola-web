<template>
  <div>
    <div>{{code}}</div>
    <div>{{username}}</div>
  </div>
</template>

<script>
import { apiurl, oauth2callbackurl, login, fetch } from "@/util/auth";

export default {
  components: {},
  name: "Oauth2",
  props: {},
  data() {
    return {
      run: null,
      code: this.$route.query.code,
      polling: null,
      username: null
    };
  },
  methods: {
    async doOauth2() {
      let u = oauth2callbackurl();
      u.searchParams.append("code", this.$route.query.code);
      u.searchParams.append("state", this.$route.query.state);
      let res = await (await fetch(u)).json();
      console.log("oauth2 result", res);
      if (res.request_type === "loginuser") {
        login(res.response.token, res.response.user);
        this.$router.push("/");
      } else if (res.request_type === "authorize") {
        this.$store.dispatch("setRegisterUser", res.response);
        this.$router.push("/register");
      }
    }
  },
  created: function() {
    this.doOauth2();
  }
};
</script>

