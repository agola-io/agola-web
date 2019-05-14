<template>
  <div>
    <nav class="panel">
      <p class="panel-heading">Variables</p>
      <div class="panel-block is-block">
        <projectvars :variables="variables" :allvariables="allvariables"/>
      </div>
    </nav>
    <nav v-if="!isRootProjectGroup" class="panel is-danger">
      <p class="panel-heading is-danger">Danger Zone</p>
      <div class="panel-block is-block">
        <div>
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
        <div v-if="deleteProjectGroupError" class="message is-danger">
          <div class="message-body">{{ deleteProjectGroupError }}</div>
        </div>
      </div>
    </nav>
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
      deleteProjectGroupError: null,
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
    },
    isRootProjectGroup() {
      return this.projectgroupref.length == 0;
    }
  },
  methods: {
    resetErrors() {
      this.deleteProjectGroupError = null;
    },
    async deleteProjectGroup() {
      let projectgroupref = [
        this.ownertype,
        this.ownername,
        ...this.projectgroupref
      ].join("/");

      if (this.projectGroupNameToDelete == this.projectGroupName) {
        let { error } = await deleteProjectGroup(projectgroupref);
        if (error) {
          this.deleteProjectGroupError = error;
          return;
        }
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
    let projectgroupref = [
      this.ownertype,
      this.ownername,
      ...this.projectgroupref
    ].join("/");

    let { data, error } = await fetchVariables(
      "projectgroup",
      projectgroupref,
      false
    );
    if (error) {
      this.$store.dispatch("setError", error);
      return;
    }
    this.variables = data;

    ({ data, error } = await fetchVariables(
      "projectgroup",
      projectgroupref,
      true
    ));
    if (error) {
      this.$store.dispatch("setError", error);
      return;
    }
    this.allvariables = data;
  }
};
</script>

<style scoped lang="scss">
@import "@/css/_variables.scss";

.panel-heading {
  font-weight: 700;
}
</style>

