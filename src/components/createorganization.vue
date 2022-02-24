<template>
  <div>
    <h4 class="mb-4 text-xl font-bold">New Organization</h4>
    <div class="field">
      <div class="control">
        <input
          class="mb-4 appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          placeholder="Organization name"
          v-model="orgName"
        />
      </div>
    </div>
    <div class="mb-4">
      <label>
        <input type="checkbox" v-model="orgIsPrivate" />
        Private
      </label>
    </div>
    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      @click="createOrg()"
    >
      Create Organization
    </button>
    <div
      v-if="createOrgError"
      class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <span class="block sm:inline">{{ createOrgError }}</span>
    </div>
  </div>
</template>

<script>
import { createOrganization } from '@/util/data.js';

import { ownerLink } from '@/util/link.js';

export default {
  components: {},
  name: 'createorganization',
  props: {},
  data() {
    return {
      createOrgError: null,
      orgIsPrivate: false,
      orgName: null,
    };
  },
  methods: {
    resetErrors() {
      this.createOrgError = null;
    },
    async createOrg() {
      this.resetErrors();

      let visibility = 'public';
      if (this.orgIsPrivate) {
        visibility = 'private';
      }

      let { error } = await createOrganization(this.orgName, visibility);
      if (error) {
        this.createOrgError = error;
        return;
      }

      this.$router.push(ownerLink('org', this.orgName));
    },
  },
  created: async function () {},
};
</script>

<style scoped lang="scss"></style>
