<template>
  <div>
    <h4 class="mb-4 text-xl font-bold">Create Project Group</h4>

    <input
      class="mb-4 appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
      type="text"
      placeholder="Project Group Name"
      v-model="projectGroupName"
    >
    <div class="mb-4">
      <label>
        <input type="checkbox" v-model="projectGroupIsPrivate">
        Private
      </label>
    </div>

    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      v-bind:class="{ 'spinner': createProjectGroupLoading }"
      :disabled="!createProjectGroupButtonEnabled"
      @click="createProjectGroup()"
    >Create ProjectGroup</button>
    <div
      v-if="createProjectGroupError"
      class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <span class="block sm:inline">{{ createProjectGroupError }}</span>
    </div>
  </div>
</template>

<script>
import { createProjectGroup } from "@/util/data.js";

import { projectGroupLink } from "@/util/link.js";

export default {
  components: {},
  name: "createprojectgroup",
  props: {
    ownertype: String,
    ownername: String,
    projectgroupref: Array
  },
  data() {
    return {
      createProjectGroupError: null,
      createProjectGroupLoading: false,
      createProjectGroupLoadingTimeout: null,
      projectGroupName: "",
      projectGroupIsPrivate: false
    };
  },
  computed: {
    createProjectGroupButtonEnabled: function() {
      return this.projectGroupName.length;
    }
  },
  methods: {
    resetErrors() {
      this.createProjectGroupError = null;
    },
    startProjectGroupLoading() {
      this.createProjectGroupLoadingTimeout = setTimeout(() => {
        this.createProjectGroupLoading = true;
      }, 300);
    },
    stopProjectGroupLoading() {
      clearTimeout(this.createProjectGroupLoadingTimeout);
      this.createProjectGroupLoading = false;
    },
    async createProjectGroup() {
      this.resetErrors();

      let refArray = [this.ownertype, this.ownername];
      if (this.projectgroupref) {
        refArray = [...refArray, ...this.projectgroupref];
      }
      let parentref = refArray.join("/");

      let visibility = "public";
      if (this.projectGroupIsPrivate) {
        visibility = "private";
      }

      this.startProjectGroupLoading();
      let { error } = await createProjectGroup(
        parentref,
        this.projectGroupName,
        visibility
      );
      this.stopProjectGroupLoading();
      if (error) {
        this.createProjectGroupError = error;
        return;
      }

      let projectgroupref = [this.projectGroupName];
      if (this.projectgroupref) {
        projectgroupref = this.projectgroupref.concat(this.projectGroupName);
      }
      this.$router.push(
        projectGroupLink(this.ownertype, this.ownername, projectgroupref)
      );
    }
  }
};
</script>

<style scoped lang="scss">
</style>


