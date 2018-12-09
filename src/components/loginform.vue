
<template>
  <div>
    <div class="field">
      <p class="control has-icons-left has-icons-right">
        <input v-model="username" class="input" type="email" placeholder="Email">
        <span class="icon is-small is-left">
          <i class="fas fa-envelope"></i>
        </span>
        <span class="icon is-small is-right">
          <i class="fas fa-check"></i>
        </span>
      </p>
    </div>
    <div class="field">
      <p class="control has-icons-left">
        <input v-model="password" class="input" type="password" placeholder="Password">
        <span class="icon is-small is-left">
          <i class="fas fa-lock"></i>
        </span>
      </p>
    </div>
    <div class="field">
      <p class="control">
        <button
          @click="$emit('login', { username, password })"
          class="button is-info is-fullwidth"
        >Login with {{name}}</button>
      </p>
    </div>
  </div>
</template>


<script>
import { apiurl, loginurl, fetch } from "@/util/auth";

export default {
  name: "Loginform",
  props: {
    name: String
  },
  data: function() {
    return {
      username: null,
      password: null
    };
  }
};
</script>


