<template>
  <div>
    <div v-if="remoterepos.length > 0">
      <div
        class="item-list"
        v-for="(repo, index) in remoterepos"
        v-bind:key="repo.id"
        @click="select(index)"
      >
        <span class="icon has-text-success">
          <i v-if="selectedrepo == index" class="mdi mdi-radiobox-marked"></i>
          <i v-else class="mdi mdi-radiobox-blank"></i>
        </span>
        <span class="name">{{repo.path}}</span>
      </div>
    </div>
    <div v-else class="item-list">No remote repositories</div>
  </div>
</template>

<script>
import { userRemoteRepos } from "@/util/data.js";

export default {
  components: {},
  name: "remoterepos",
  props: {
    remotesource: String
  },
  data() {
    return {
      selectedrepo: null,
      remoterepos: []
    };
  },
  methods: {
    select(index) {
      this.selectedrepo = index;
      this.$emit("reposelected", this.remoterepos[index].path);
    },
    async fetchRemoteRepos(remotesource) {
      this.remoterepos = await userRemoteRepos(remotesource);
    }
  },
  created: function() {
    this.fetchRemoteRepos(this.remotesource);
  }
};
</script>

<style scoped lang="scss">
@import "@/css/_variables.scss";

.item-list {
  .item {
    margin-bottom: 5px;
    border: 1px solid $grey-lighter;
    cursor: pointer;
    display: flex;
    padding: 10px;
  }
  .name {
    font-weight: bold;
  }
}
</style>
