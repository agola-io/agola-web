<template>
  <div>
    <nav class="mb-4 bg-grey-light rounded font-sans w-full">
      <ol class="list-reset flex text-grey-dark">
        <li>
          <a>org</a>
        </li>
        <li>
          <span class="mx-2">/</span>
        </li>
        <li>
          <router-link :to="ownerLink('org', orgname)">{{orgname}}</router-link>
        </li>
      </ol>
    </nav>

    <div class="mb-8 flex justify-between">
      <span class="text-3xl">{{orgname}}</span>
      <createprojectbutton v-on:click="goToCreate($event)"/>
    </div>

    <div class="flex justify-between">
      <ul class="flex-grow tab">
        <li
          class="tab-element"
          :class="[{ 'tab-element-selected': $route.name === 'org projects' || $route.name === 'org' }]"
        >
          <router-link :to="ownerProjectsLink('org', orgname)">
            <i class="mr-1 mdi mdi-home"/>
            <span>Projects</span>
          </router-link>
        </li>
        <li
          class="tab-element"
          :class="[{ 'tab-element-selected': $route.name === 'org members' }]"
        >
          <router-link :to="orgMembersLink(orgname)">
            <i class="mr-1 mdi mdi-account-group"/>
            <span>Members</span>
          </router-link>
        </li>
      </ul>
      <ul class="flex tab">
        <li
          class="tab-element"
          :class="[{ 'tab-element-selected': $route.name.endsWith('org project group settings') }]"
        >
          <router-link :to="projectGroupSettingsLink('org', orgname, [])">
            <i class="mr-1 mdi mdi-settings"/>
            <span>Root Project Group Settings</span>
          </router-link>
        </li>
        <li
          class="tab-element"
          :class="[{ 'tab-element-selected': $route.name.endsWith('org settings') }]"
        >
          <router-link :to="ownerSettingsLink('org', orgname)">
            <i class="mr-1 mdi mdi-settings"/>
            <span>Organization Settings</span>
          </router-link>
        </li>
      </ul>
    </div>
    <router-view class="mt-8"></router-view>
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
</style>