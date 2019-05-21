<template>
  <div class="mb-2 border-solid border-gray-300 rounded border shadow-sm">
    <p class="bg-gray-200 px-4 py-3 border-solid border-gray-300 border-b">
      repositories from
      <strong>{{ remotesource.name }}</strong>
    </p>
    <div v-if="remoterepos.length > 0">
      <label
        class="block px-4 py-2 border-b"
        v-for="(repo, index) in remoterepos"
        v-bind:key="repo.id"
        @click="select(index)"
      >
        <input type="radio" :checked="selectedrepo == index && selected">
        {{repo.path}}
      </label>
    </div>
    <div v-else class="block px-4 py-2 border-b">No remote repositories</div>
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
</style>
