<template>
  <div>
    <h4 class="title is-4">New Organization</h4>
    <div class="field">
      <div class="control">
        <input class="input" type="text" placeholder="Organization name" v-model="orgName">
      </div>
    </div>
    <div class="field">
      <div class="control">
        <label class="checkbox">
          <input type="checkbox" v-model="orgIsPrivate">
          Private
        </label>
      </div>
    </div>
    <div class="field is-grouped">
      <div class="control">
        <button class="button is-primary" @click="createOrg()">Create Organization</button>
      </div>
    </div>
    <div v-if="createOrgError" class="message is-danger">
      <div class="message-body">{{ createOrgError }}</div>
    </div>
  </div>
</template>

<script>
import { createOrganization } from "@/util/data.js";

import { ownerLink } from "@/util/link.js";

export default {
  components: {},
  name: "createorganization",
  props: {},
  data() {
    return {
      createOrgError: null,
      orgIsPrivate: false,
      orgName: null
    };
  },
  methods: {
    resetErrors() {
      this.createOrgError = null;
    },
    async createOrg() {
      this.resetErrors();

      let visibility = "public";
      if (this.orgIsPrivate) {
        visibility = "private";
      }

      let { error } = await createOrganization(this.orgName, visibility);
      if (error) {
        this.createOrgError = error;
        return;
      }

      this.$router.push(ownerLink("org", this.orgName));
    }
  },
  created: async function() {}
};
</script>

<style scoped lang="scss">
@import "@/css/_variables.scss";
</style>


