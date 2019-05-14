<template>
  <div>
    <h4 class="title is-4">Create Project</h4>
    <div class="field">
      <div class="control">
        <input class="input" type="text" placeholder="Project name" v-model="projectName">
      </div>
    </div>
    <div class="field">
      <div class="control">
        <label class="checkbox">
          <input type="checkbox" v-model="projectIsPrivate">
          Private
        </label>
      </div>
    </div>

    <h4 class="title is-4">Available remote repositories</h4>
    <div v-for="remoteSource in remoteSources" v-bind:key="remoteSource.id">
      <remoterepos
        class="remoterepos"
        :remotesource="remoteSource"
        :selected="selectedRemoteSource && selectedRemoteSource.id == remoteSource.id"
        v-on:reposelected="repoSelected(remoteSource, $event)"
      />
    </div>
    <div class="field is-grouped">
      <div class="control">
        <button
          class="button is-primary"
          v-bind:class="{ 'is-loading': createProjectLoading }"
          :disabled="!createProjectButtonEnabled"
          @click="createProject()"
        >Create Project</button>
      </div>
    </div>
    <div v-if="createProjectError" class="message is-danger">
      <div class="message-body">{{ createProjectError }}</div>
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
      createProjectError: null,
      createProjectLoading: false,
      createProjectLoadingTimeout: null,
      user: null,
      remoteSources: null,
      remoteRepos: [],
      projectName: "",
      projectIsPrivate: false,
      remoteRepoPath: null,
      selectedRemoteSource: null
    };
  },
  computed: {
    createProjectButtonEnabled: function() {
      return this.projectName.length && this.selectedRemoteSource;
    }
  },
  methods: {
    resetErrors() {
      this.createProjectError = null;
    },
    startProjectLoading() {
      this.createProjectLoadingTimeout = setTimeout(() => {
        this.createProjectLoading = true;
      }, 300);
    },
    stopProjectLoading() {
      clearTimeout(this.createProjectLoadingTimeout);
      this.createProjectLoading = false;
    },
    repoSelected(remoteSource, repoPath) {
      this.selectedRemoteSource = remoteSource;
      this.remoteRepoPath = repoPath;
    },
    async createProject() {
      this.resetErrors();

      let refArray = [this.ownertype, this.ownername];
      if (this.projectgroupref) {
        refArray = [...refArray, ...this.projectgroupref];
      }
      let parentref = refArray.join("/");

      let visibility = "public";
      if (this.projectIsPrivate) {
        visibility = "private";
      }

      this.startProjectLoading();
      let { error } = await createProject(
        parentref,
        this.projectName,
        visibility,
        this.selectedRemoteSource.name,
        this.remoteRepoPath
      );
      this.stopProjectLoading();
      if (error) {
        this.createProjectError = error;
        return;
      }

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
    let { data, error } = await fetchCurrentUser();
    if (error) {
      this.$store.dispatch("setError", error);
      return;
    }
    this.user = data;

    // TODO(sgotti) filter only remote source where the user has a linked account
    ({ data, error } = await fetchRemoteSources());
    if (error) {
      this.$store.dispatch("setError", error);
      return;
    }
    this.remoteSources = data;
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
.remoterepos {
  margin-top: 1rem;
  margin-bottom: 1rem;
}
</style>

