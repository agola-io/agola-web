<template>
  <div>
    <nav class="panel">
      <p class="panel-heading">Project Settings</p>
      <div class="panel-block is-block">
        <div class="field">
          <label class="label">Project Name</label>
          <div class="control">
            <input class="input" type="text" placeholder="Text input" v-model="project.name">
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

        <div class="field is-grouped">
          <div class="control">
            <button class="button is-primary" @click="updateProject()">Update</button>
          </div>
        </div>
      </div>
    </nav>
    <nav class="panel">
      <p class="panel-heading">Variables</p>
      <div class="panel-block is-block">
        <projectvars :variables="variables" :allvariables="allvariables"/>
      </div>
    </nav>
    <nav class="panel is-danger">
      <p class="panel-heading is-danger">Danger Zone</p>
      <div class="panel-block is-block">
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
    </nav>
  </div>
</template>

<script>
import {
  fetchProject,
  fetchVariables,
  updateProject,
  deleteProject
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
    async updateProject() {
      let projectref = [
        this.ownertype,
        this.ownername,
        ...this.projectref
      ].join("/");

      let visibility = "public";
      if (this.projectIsPrivate) {
        visibility = "private";
      }
      let res = await updateProject(projectref, this.project.name, visibility);
    },
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
    let projectref = [this.ownertype, this.ownername, ...this.projectref].join(
      "/"
    );

    this.project = await fetchProject(projectref);
    this.projectIsPrivate = this.project.visibility == "private";

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

.panel-heading {
  font-weight: 700;
}
</style>
