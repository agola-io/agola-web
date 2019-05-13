
<template>
  <div>
    <projbreadcrumbs
      :ownertype="ownertype"
      :ownername="ownername"
      :projectgroupref="projectgroupref"
    />

    <div class="name">
      <span class="is-size-3">{{projectGroupName()}}</span>
      <div class="is-pulled-right">
        <createprojectbutton v-on:click="goToCreate($event)"/>
      </div>
    </div>

    <div class="tabs">
      <ul>
        <li
          :class="[{ 'is-active': $route.name.match('project group project') || $route.name.endsWith('project group') }]"
        >
          <router-link :to="projectGroupProjectsLink(ownertype, ownername, projectgroupref)">
            <span class="icon is-small">
              <i class="mdi mdi-home"/>
            </span>
            <span>Projects</span>
          </router-link>
        </li>
      </ul>
      <ul class="is-right">
        <li :class="[{ 'is-active': $route.name.endsWith('project group settings') }]">
          <router-link :to="projectGroupSettingsLink(ownertype, ownername, projectgroupref)">
            <span class="icon is-small">
              <i class="mdi mdi-settings"/>
            </span>
            <span>Project Group Settings</span>
          </router-link>
        </li>
      </ul>
    </div>
    <router-view></router-view>
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
@import "@/css/_variables.scss";

.name {
  padding-left: 5px;
  margin-bottom: 25px;
}
</style>
