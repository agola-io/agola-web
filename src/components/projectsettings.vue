<template>
  <div v-if="project">
    <div class="panel">
      <p class="panel-title">Project Settings</p>
      <div class="p-4">
        <div class="mb-4">
          <label class="block font-bold mb-2">Project Name</label>
          <input
            class="appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            placeholder="Project Name"
            v-model="project.name"
          >
        </div>
        <div class="mb-4">
          <label class="checkbox">
            <input type="checkbox" v-model="projectIsPrivate">
            Private
          </label>
        </div>
        <button class="btn btn-blue" @click="updateProject()">Update</button>
        <div
          v-if="updateProjectError"
          class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span class="block sm:inline">{{ updateProjectError }}</span>
        </div>
      </div>
    </div>

    <div class="panel">
      <p class="panel-title">Variables</p>
      <div class="p-4">
        <projectvars :variables="variables" :allvariables="allvariables"/>
      </div>
    </div>

    <div class="panel">
      <p class="panel-title">Danger Zone</p>
      <div class="p-4">
        <h4 class="mb-4 title text-xl">Delete This Project</h4>
        <div
          class="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded"
          role="alert"
        >
          <p>
            This operation
            <strong>CANNOT</strong> be undone.
            This operation will remove
            <strong>{{projectPath}}</strong>
          </p>
        </div>
        <label class="block mb-2">
          Please type the project name for confirmation:
          <span
            class="text-red-500 font-bold"
          >{{ projectName }}</span>
        </label>
        <div class="mb-4">
          <input
            class="appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
            v-model="projectNameToDelete"
            type="email"
            placeholder="Project name to delete"
          >
        </div>
        <button
          class="btn btn-red"
          @click="deleteProject()"
          :disabled="!deleteButtonEnabled"
        >Delete Project</button>

        <div
          v-if="deleteProjectError"
          class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span class="block sm:inline">{{ deleteProjectError }}</span>
        </div>
      </div>
      <div class="p-4 border-t">
        <h4 class="mb-4 title text-xl">Change remote repository linked account</h4>
        <div
          class="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded"
          role="alert"
        >
          <p>This operation will change the linked account associated with the project remote repository to the current user linked account</p>
        </div>
        <button class="btn btn-red" @click="updateRepoLinkedAccount()">Change</button>

        <div
          v-if="updateRepoLinkedAccountError"
          class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span class="block sm:inline">{{ updateRepoLinkedAccountError }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  fetchProject,
  fetchVariables,
  updateProject,
  deleteProject,
  projectUpdateRepoLinkedAccount
} from "@/util/data.js";

import { projectGroupLink } from "@/util/link.js";

import projectvars from "@/components/projectvars";

export default {
  components: { projectvars },
  name: "projectsettings",
  props: {
    ownertype: String,
    ownername: String,
    projectref: Array
  },
  data() {
    return {
      updateProjectError: null,
      deleteProjectError: null,
      updateRepoLinkedAccountError: null,
      project: null,
      projectIsPrivate: false,
      variables: [],
      allvariables: [],
      projectNameToDelete: ""
    };
  },
  computed: {
    projectName: function() {
      return this.projectref[this.projectref.length - 1];
    },
    projectPath: function() {
      return ["", this.ownertype, this.ownername, ...this.projectref].join("/");
    },
    deleteButtonEnabled: function() {
      return this.projectNameToDelete == this.projectName;
    }
  },
  methods: {
    resetErrors() {
      this.updateProjectError = null;
      this.deleteProjectError = null;
      this.updateRepoLinkedAccountError = null;
    },
    async updateProject() {
      this.resetErrors();

      let projectref = [
        this.ownertype,
        this.ownername,
        ...this.projectref
      ].join("/");

      let visibility = "public";
      if (this.projectIsPrivate) {
        visibility = "private";
      }
      let { error } = await updateProject(
        projectref,
        this.project.name,
        visibility
      );
      if (error) {
        this.updateProjectError = error;
        return;
      }
    },
    async deleteProject() {
      this.resetErrors();

      let projectref = [
        this.ownertype,
        this.ownername,
        ...this.projectref
      ].join("/");

      if (this.projectNameToDelete == this.projectName) {
        let { error } = await deleteProject(projectref);
        if (error) {
          this.deleteProjectError = error;
          return;
        }
        this.$router.push(
          projectGroupLink(
            this.ownertype,
            this.ownername,
            this.projectref.slice(0, -1)
          )
        );
      }
    },
    async updateRepoLinkedAccount() {
      this.resetErrors();

      let projectref = [
        this.ownertype,
        this.ownername,
        ...this.projectref
      ].join("/");

      let { error } = await projectUpdateRepoLinkedAccount(projectref);
      if (error) {
        this.updateRepoLinkedAccountError = error;
        return;
      }
    }
  },
  created: async function() {
    let projectref = [this.ownertype, this.ownername, ...this.projectref].join(
      "/"
    );

    let { data, error } = await fetchProject(projectref);
    if (error) {
      this.$store.dispatch("setError", error);
      return;
    }
    this.project = data;
    this.projectIsPrivate = this.project.visibility == "private";

    ({ data, error } = await fetchVariables("project", projectref, false));
    if (error) {
      this.$store.dispatch("setError", error);
      return;
    }
    this.variables = data;

    ({ data, error } = await fetchVariables("project", projectref, true));
    if (error) {
      this.$store.dispatch("setError", error);
      return;
    }
    this.allvariables = data;
  }
};
</script>

<style scoped lang="scss">
</style>
