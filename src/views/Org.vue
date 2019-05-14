<template>
  <div>
    <nav class="breadcrumb" aria-label="breadcrumbs">
      <ul>
        <li>
          <a>org</a>
        </li>
        <li>
          <router-link :to="ownerLink('org', orgname)">{{orgname}}</router-link>
        </li>
      </ul>
    </nav>

    <div class="name">
      <span class="is-size-3">{{orgname}}</span>
      <div class="is-pulled-right">
        <createprojectbutton v-on:click="goToCreate($event)"/>
      </div>
    </div>

    <div class="tabs">
      <ul>
        <li :class="[{ 'is-active': $route.name === 'org projects' || $route.name === 'org' }]">
          <router-link :to="ownerProjectsLink('org', orgname)">
            <span class="icon is-small">
              <i class="mdi mdi-home"/>
            </span>
            <span>Projects</span>
          </router-link>
        </li>
        <li :class="[{ 'is-active': $route.name === 'org members' }]">
          <router-link :to="orgMembersLink(orgname)">
            <span class="icon is-small">
              <i class="mdi mdi-account-group"/>
            </span>
            <span>Members</span>
          </router-link>
        </li>
      </ul>
      <ul class="is-right">
        <li :class="[{ 'is-active': $route.name.endsWith('org project group settings') }]">
          <router-link :to="projectGroupSettingsLink('org', orgname, [])">
            <span class="icon is-small">
              <i class="mdi mdi-settings"/>
            </span>
            <span>Root Project Group Settings</span>
          </router-link>
        </li>
        <li :class="[{ 'is-active': $route.name.endsWith('org settings') }]">
          <router-link :to="ownerSettingsLink('org', orgname)">
            <span class="icon is-small">
              <i class="mdi mdi-settings"/>
            </span>
            <span>Organization Settings</span>
          </router-link>
        </li>
      </ul>
    </div>
    <router-view></router-view>
  </div>
</template>


<script>
import {
  ownerLink,
  ownerProjectsLink,
  ownerSettingsLink,
  orgMembersLink,
  projectGroupCreateProjectGroupLink,
  projectGroupCreateProjectLink,
  projectGroupSettingsLink
} from "@/util/link.js";

import createprojectbutton from "@/components/createprojectbutton.vue";

export default {
  name: "Org",
  components: { createprojectbutton },
  props: {
    orgname: String
  },
  methods: {
    ownerLink: ownerLink,
    ownerProjectsLink: ownerProjectsLink,
    ownerSettingsLink: ownerSettingsLink,
    orgMembersLink: orgMembersLink,
    projectGroupCreateProjectGroupLink: projectGroupCreateProjectGroupLink,
    projectGroupCreateProjectLink: projectGroupCreateProjectLink,
    projectGroupSettingsLink: projectGroupSettingsLink,
    goToCreate(type) {
      if (type == "project") {
        this.$router.push(
          projectGroupCreateProjectLink("org", this.orgname, [])
        );
        return;
      }
      this.$router.push(
        projectGroupCreateProjectGroupLink("org", this.orgname, [])
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