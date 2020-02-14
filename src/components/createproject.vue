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
    <div class="mb-4">
      <label class="checkbox">
        <input type="checkbox" v-model="pass_vars_to_forked_pr" />
        Pass variables to run even if triggered by PR from forked repo (DANGEROUS)
      </label>
    </div>
    <div class="mb-3 flex items-center">
      <div class="flex relative w-64">
        <select
          class="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
          v-model="selectedRemoteSourceIndex"
        >
          <option :value="null" disabled>Select the remote source</option>
          <option
            v-for="(rs, index) in remoteSources"
            v-bind:key="rs.id"
            :value="index"
          >{{ rs.name }}</option>
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
          <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"></path>
          </svg>
        </div>
      </div>
      <button
        class="ml-3 btn btn-blue"
        v-bind:class="{ 'spinner': fetchRemoteReposLoading }"
        :disabled="selectedRemoteSourceIndex == null"
        @click="fetchRemoteRepos()"
      >Fetch remote repositories</button>
    </div>

    <div v-if="remoteRepos.length">
      <h4 class="text-xl">Available remote repositories</h4>
      <remoterepos :remoterepos="remoteRepos" v-on:reposelected="repoSelected($event)"/>
      <button
        class="btn btn-blue"
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
  </div>
</template>

<script>
import {
  fetchCurrentUser,
  fetchRemoteSources,
  createProject,
  userRemoteRepos
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
      fetchRemoteReposLoading: false,
      fetchRemoteReposLoadingTimeout: false,
      createProjectLoading: false,
      createProjectLoadingTimeout: null,
      user: null,
      remoteSources: null,
      remoteRepos: [],
      selectedRemoteSourceIndex: null,
      projectName: "",
      projectIsPrivate: false,
      remoteRepoPath: null
    };
  },
  computed: {
    createProjectButtonEnabled: function() {
      return this.projectName.length && this.remoteRepoPath;
    }
  },
  watch: {},
  methods: {
    resetErrors() {
      this.createProjectError = null;
    },
    startFetchRemoteReposLoading() {
      this.fetchRemoteReposLoadingTimeout = setTimeout(() => {
        this.fetchRemoteReposLoading = true;
      }, 300);
    },
    stopFetchRemoteReposLoading() {
      clearTimeout(this.fetchRemoteReposLoadingTimeout);
      this.fetchRemoteReposLoading = false;
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
    repoSelected(repoPath) {
      this.remoteRepoPath = repoPath;
    },
    async fetchRemoteRepos() {
      this.remoteRepos = [];
      this.remoteRepoPath = null;

      this.startFetchRemoteReposLoading();
      let remoteSource = this.remoteSources[this.selectedRemoteSourceIndex];
      let { data, error } = await userRemoteRepos(remoteSource.id);
      this.stopFetchRemoteReposLoading();
      if (error) {
        this.$store.dispatch("setError", error);
        return;
      }
      this.remoteRepos = data;
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

      let remoteSource = this.remoteSources[this.selectedRemoteSourceIndex];

      this.startProjectLoading();
      let { error } = await createProject(
        parentref,
        this.projectName,
        visibility,
        remoteSource.name,
        this.remoteRepoPath,
        this.pass_vars_to_forked_pr
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

