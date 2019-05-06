<template>
  <div>
    <h4 class="title is-4">Create Project Group</h4>
    <div class="field">
      <div class="control">
        <input
          class="input"
          type="text"
          placeholder="Project Group Name"
          v-model="projectGroupName"
        >
      </div>
    </div>
    <div class="field is-grouped">
      <div class="control">
        <button class="button is-primary" @click="createProjectGroup()">Create Project Group</button>
      </div>
      <div class="control">
        <button class="button is-text">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
import { createProjectGroup } from "@/util/data.js";

import { projectGroupLink } from "@/util/link.js";

import remoterepos from "@/components/remoterepos.vue";

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
      projectGroupName: null
    };
  },
  methods: {
    async createProjectGroup() {
      let refArray = [this.ownertype, this.ownername];
      if (this.projectgroupref) {
        refArray = [...refArray, ...this.projectgroupref];
      }
      let parentref = refArray.join("/");

      await createProjectGroup(parentref, this.projectGroupName);

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


