<template>
  <div>
    <div v-if="remoterepos.length > 0">
      <nav class="panel">
        <p class="panel-heading">
          repositories from
          <strong>{{ remotesource.name }}</strong>
        </p>
        <label
          class="panel-block"
          v-for="(repo, index) in remoterepos"
          v-bind:key="repo.id"
          @click="select(index)"
        >
          <input type="radio" :checked="selectedrepo == index && selected">
          {{repo.path}}
        </label>
      </nav>
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
    remotesource: Object,
    selected: Boolean
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
    async fetchRemoteRepos(remotesourceid) {
      let { data, error } = await userRemoteRepos(remotesourceid);
      if (error) {
        this.$store.dispatch("setError", error);
        return;
      }
      this.remoterepos = data;
    }
  },
  created: function() {
    this.fetchRemoteRepos(this.remotesource.id);
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

.panel-block input[type="radio"] {
  margin-right: 0.75em;
}
</style>
