<template>
  <div>
    <projectvars :variables="variables" :allvariables="allvariables"/>
    <hr>
    <div>
      <h4 class="title is-4">Delete This Project</h4>

      <div class="message is-danger">
        <div class="message-body">
          This operation
          <strong>CANNOT</strong> be undone.
          This operation will remove
          <strong>{{projectPath}}</strong>
        </div>
      </div>
      <label class="label">
        Please type the project name for confirmation:
        <span
          class="has-text-danger"
        >{{ projectName }}</span>
      </label>
      <div class="field">
        <input
          v-model="projectNameToDelete"
          class="input"
          type="email"
          placeholder="Project name to delete"
        >
      </div>
      <button
        class="button is-danger"
        @click="deleteProject()"
        :disabled="!deleteButtonEnabled"
      >Delete Project</button>
    </div>
  </div>
</template>

<script>
import { fetchVariables, deleteProject } from "@/util/data.js";

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
    async deleteProject() {
      let projectref = [
        this.ownertype,
        this.ownername,
        ...this.projectref
      ].join("/");

      if (this.projectNameToDelete == this.projectName) {
        let res = await deleteProject(projectref);
        this.$router.push(
          projectGroupLink(
            this.ownertype,
            this.ownername,
            this.projectref.slice(0, -1)
          )
        );
      }
    }
  },
  created: async function() {
    this.variables = await fetchVariables(
      "project",
      [this.ownertype, this.ownername, ...this.projectref].join("/"),
      false
    );
    this.allvariables = await fetchVariables(
      "project",
      [this.ownertype, this.ownername, ...this.projectref].join("/"),
      true
    );
  }
};
</script>

<style scoped lang="scss">
@import "@/css/_variables.scss";
</style>
