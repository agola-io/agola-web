<template>
  <div>
    <projectvars :variables="variables" :allvariables="allvariables"/>
    <hr>
    <div>
      <h4 class="title is-4">Delete This Project Group</h4>

      <div class="message is-danger">
        <div class="message-body">
          This operation
          <strong>CANNOT</strong> be undone.
          This operation will remove
          <strong>{{projectGroupPath}}</strong>
        </div>
      </div>
      <label class="label">
        Please type the project group name for confirmation:
        <span
          class="has-text-danger"
        >{{ projectGroupName }}</span>
      </label>
      <div class="field">
        <input
          v-model="projectGroupNameToDelete"
          class="input"
          type="email"
          placeholder="Project Group name to delete"
        >
      </div>
      <button
        class="button is-danger"
        @click="deleteProjectGroup()"
        :disabled="!deleteButtonEnabled"
      >Delete Project Group</button>
    </div>
  </div>
</template>

<script>
import { fetchVariables, deleteProjectGroup } from "@/util/data.js";

import { projectGroupLink } from "@/util/link.js";

import projectvars from "@/components/projectvars";

export default {
  components: { projectvars },
  name: "projectgroupsettings",
  props: {
    ownertype: String,
    ownername: String,
    projectgroupref: Array
  },
  data() {
    return {
      variables: [],
      allvariables: [],
      projectGroupNameToDelete: ""
    };
  },
  computed: {
    projectGroupName: function() {
      return this.projectgroupref[this.projectgroupref.length - 1];
    },
    projectGroupPath: function() {
      return ["", this.ownertype, this.ownername, ...this.projectgroupref].join(
        "/"
      );
    },
    deleteButtonEnabled: function() {
      return this.projectGroupNameToDelete == this.projectGroupName;
    }
  },
  methods: {
    async deleteProjectGroup() {
      let projectgroupref = [
        this.ownertype,
        this.ownername,
        ...this.projectgroupref
      ].join("/");

      if (this.projectGroupNameToDelete == this.projectGroupName) {
        let res = await deleteProjectGroup(projectgroupref);
        this.$router.push(
          projectGroupLink(
            this.ownertype,
            this.ownername,
            this.projectgroupref.slice(0, -1)
          )
        );
      }
    }
  },
  created: async function() {
    this.variables = await fetchVariables(
      "projectgroup",
      [this.ownertype, this.ownername, ...this.projectgroupref].join("/"),
      false
    );
    this.allvariables = await fetchVariables(
      "projectgroup",
      [this.ownertype, this.ownername, ...this.projectgroupref].join("/"),
      true
    );
  }
};
</script>

<style scoped lang="scss">
@import "@/css/_variables.scss";
</style>

