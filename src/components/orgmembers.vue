<template>
  <div>
    <h4 class="mb-3 text-xl">Organization Members</h4>
    <ul v-if="members.length">
      <li class="flex" v-for="member in members" v-bind:key="member.user.id">
        <span class="w-1/2 font-bold">{{member.user.username}}</span>
        <span class="w-1/2">{{member.role}}</span>
      </li>
    </ul>
    <div v-else>No Members</div>
  </div>
</template>

<script>
import { fetchOrgMembers } from "@/util/data.js";

export default {
  components: {},
  name: "orgmembers",
  props: {
    orgname: String
  },
  data() {
    return {
      members: []
    };
  },
  watch: {
    $route: async function() {
      this.fetchOrgMembers(this.orgname);
    }
  },
  methods: {
    async fetchOrgMembers(orgname) {
      let { data, error } = await fetchOrgMembers(orgname);
      if (error) {
        this.$store.dispatch("setError", error);
        return;
      }
      this.members = data.members;
    }
  },
  created: function() {
    this.fetchOrgMembers(this.orgname);
  }
};
</script>

<style scoped lang="scss">
</style>
