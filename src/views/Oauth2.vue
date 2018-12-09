<template>
  <div>
    <div>{{code}}</div>
  </div>
</template>

<script>
import { apiurl, oauth2callbackurl, fetch, setUser } from "@/util/auth";

export default {
  components: {},
  name: "Oauth2",
  props: {},
  data() {
    return {
      run: null,
      code: this.$route.query.code,
      polling: null
    };
  },
  methods: {
    doOauth2() {
      let u = oauth2callbackurl();
      u.searchParams.append("code", this.$route.query.code);
      u.searchParams.append("state", this.$route.query.state);
      fetch(u)
        .then(res => res.json())
        .then(res => {
          console.log("oauth2 result", res);
          if (res.request_type === "loginuser") {
            this.$root.login(res.response.token, res.response.user);
            this.$router.push("/");
          }
        });
    }
  },
  created: function() {
    this.doOauth2();
  }
};
</script>

