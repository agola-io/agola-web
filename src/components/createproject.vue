<template>
  <div>
    <h4 class="mb-4 text-xl font-bold">Create Project</h4>

    <input
      class="mb-4 appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
      type="text"
      placeholder="Project Name"
      v-model="projectName"
    >
    <div class="mb-4">
      <label>
        <input type="checkbox" v-model="projectIsPrivate">
        Private
      </label>
    </div>

    <h4 class="text-xl">Available remote repositories</h4>
    <div v-for="remoteSource in remoteSources" v-bind:key="remoteSource.id">
      <remoterepos
        class="remoterepos"
        :remotesource="remoteSource"
        :selected="selectedRemoteSource && selectedRemoteSource.id == remoteSource.id"
        v-on:reposelected="repoSelected(remoteSource, $event)"
      />
    </div>
    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      v-bind:class="{ 'spinner': createProjectLoading }"
      :disabled="!createProjectButtonEnabled"
      @click="createProject()"
    >Create Project</button>
    <div
      v-if="createProjectError"
      class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <span class="block sm:inline">{{ createProjectError }}</span>
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

    let allRemoteSources = data;
    let remoteSources = [];
    for (var i = 0; i < allRemoteSources.length; i++) {
      for (var j = 0; j < this.user.linked_accounts.length; j++) {
        let remotesource = allRemoteSources[i];
        let la = this.user.linked_accounts[j];
        if (la.remote_source_id == remotesource.id) {
          remoteSources.push(remotesource);
        }
      }
      this.remoteSources = remoteSources;
    }
  }
};
</script>

<style scoped lang="scss">
</style>

