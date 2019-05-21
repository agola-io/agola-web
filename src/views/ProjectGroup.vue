
<template>
  <div>
    <projbreadcrumbs
      :ownertype="ownertype"
      :ownername="ownername"
      :projectgroupref="projectgroupref"
    />

    <div class="mb-8 flex justify-between">
      <span class="text-3xl">{{projectGroupName()}}</span>
      <createprojectbutton v-on:click="goToCreate($event)"/>
    </div>

    <div class="flex justify-between">
      <ul class="flex-grow tab">
        <li
          class="tab-element"
          :class="[{ 'tab-element-selected': $route.name.match('project group project') || $route.name.endsWith('project group') }]"
        >
          <router-link :to="projectGroupProjectsLink(ownertype, ownername, projectgroupref)">
            <i class="mdi mdi-home"/>
            <span>Projects</span>
          </router-link>
        </li>
      </ul>
      <ul class="flex tab">
        <li
          class="tab-element"
          :class="[{ 'tab-element-selected': $route.name.endsWith('project group settings') }]"
        >
          <router-link :to="projectGroupSettingsLink(ownertype, ownername, projectgroupref)">
            <i class="mdi mdi-settings"/>
            <span>Project Group Settings</span>
          </router-link>
        </li>
      </ul>
    </div>
    <router-view class="mt-8"></router-view>
  </div>
</template>


<script>
import {
  projectGroupProjectsLink,
  projectGroupSettingsLink,
  projectGroupCreateProjectGroupLink,
  projectGroupCreateProjectLink
} from "@/util/link.js";

import projbreadcrumbs from "@/components/projbreadcrumbs.vue";
import createprojectbutton from "@/components/createprojectbutton.vue";

export default {
  name: "ProjectGroup",
  components: { projbreadcrumbs, createprojectbutton },
  props: {
    ownertype: String,
    ownername: String,
    projectgroupref: Array
  },
  methods: {
    projectGroupProjectsLink: projectGroupProjectsLink,
    projectGroupSettingsLink: projectGroupSettingsLink,
    projectGroupCreateProjectGroupLink: projectGroupCreateProjectGroupLink,
    projectGroupCreateProjectLink: projectGroupCreateProjectLink,
    projectGroupName() {
      if (!this.projectgroupref.length) {
        return "Root Project Group";
      }
      return this.projectgroupref[this.projectgroupref.length - 1];
    },
    goToCreate(type) {
      if (type == "project") {
        this.$router.push(
          projectGroupCreateProjectLink(
            this.ownertype,
            this.ownername,
            this.projectgroupref
          )
        );
        return;
      }
      this.$router.push(
        projectGroupCreateProjectGroupLink(
          this.ownertype,
          this.ownername,
          this.projectgroupref
        )
      );
    }
  }
};
</script>

<style scoped lang="scss">
</style>
