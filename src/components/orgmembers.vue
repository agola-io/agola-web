<template>
  <div>
    <h4 class="title is-4">Organization Members</h4>
    <ul v-if="members.length" class="item-list">
      <li class="item" v-for="member in members" v-bind:key="member.user.id">
        <span class="name">{{member.user.username}}</span>
        <span class="role">{{member.role}}</span>
      </li>
    </ul>
    <div v-else class="item-list">No Members</div>
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
@import "@/css/_variables.scss";

.item-list {
  .item {
    border: 1px solid $grey-lighter;
    border-bottom: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
  }

  .item:last-child {
    border-bottom: 1px solid $grey-lighter;
  }

  .name {
    flex: 0 0 30%;
    font-weight: bold;
    cursor: pointer;
  }

  .role {
    flex: 0 0 40%;
  }

  .stillrunning {
    flex: 0 0 10%;
  }

  .waitingapproval {
    flex: 0 0 10%;
  }

  .source-info {
    flex: 0 0 10%;
    overflow: hidden;
    white-space: nowrap;

    a {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .commit {
    display: block;
    font-size: 0.8rem;
  }
}
</style>
