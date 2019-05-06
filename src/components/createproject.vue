<template>
  <div>
    <h4 class="title is-4">Create Project</h4>
    <div class="field">
      <div class="control">
        <input class="input" type="text" placeholder="Project name" v-model="projectName">
      </div>
    </div>
    <h4 class="title is-4">Available remote repositories</h4>
    <div v-for="remoteSource in remoteSources" v-bind:key="remoteSource.id">
      <h5 class="title is-5">Remote source: {{remoteSource.name}}</h5>
      <remoterepos
        :remotesource="remoteSource.id"
        v-on:reposelected="repoSelected(remoteSource, $event)"
      />
    </div>
    <div class="field is-grouped">
      <div class="control">
        <button class="button is-primary" @click="createProject()">Create Project</button>
      </div>
      <div class="control">
        <button class="button is-text">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  fetchCurrentUser,
  fetchRemoteSources,
  createProject
} from "@/util/data.js";

import { projectLink } from "@/util/link.js";

import remoterepos from "@/components/remoterepos.vue";

export default {
  components: { remoterepos },
  name: "createproject",
  props: {
    ownertype: String,
    ownername: String,
    projectgroupref: Array
  },
  data() {
    return {
      user: null,
      remoteSources: null,
      remoteRepos: [],
      projectName: null,
      remoteRepoPath: null,
      selectedRemoteSource: null
    };
  },
  methods: {
    repoSelected(remoteSource, repoPath) {
      this.selectedRemoteSource = remoteSource;
      this.remoteRepoPath = repoPath;
    },
    async createProject() {
      let refArray = [this.ownertype, this.ownername];
      if (this.projectgroupref) {
        refArray = [...refArray, ...this.projectgroupref];
      }
      let parentref = refArray.join("/");

      await createProject(
        parentref,
        this.projectName,
        this.selectedRemoteSource.name,
        this.remoteRepoPath
      );

      let projectref = [this.projectName];
      if (this.projectgroupref) {
        projectref = this.projectgroupref.concat(this.projectName);
      }
      this.$router.push(
        projectLink(this.ownertype, this.ownername, projectref)
      );
    }
  },
  created: async function() {
    this.user = await fetchCurrentUser();
    // TODO(sgotti) filter only remote source where the user has a linked account
    this.remoteSources = await fetchRemoteSources();
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

