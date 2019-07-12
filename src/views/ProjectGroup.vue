
<template>
  <div>
    <projbreadcrumbs
      :ownertype="ownertype"
      :ownername="ownername"
      :projectgroupref="projectgroupref"
    />

    <div class="mb-8 flex justify-between">
      <span class="text-3xl">{{projectGroupName()}}</span>
      <createprojectbutton v-on:click="goToCreate($event)" />
    </div>

    <div class="flex justify-between">
      <ul class="flex-grow tab">
        <li
          class="tab-element"
          :class="[{ 'tab-element-selected': $route.name.match('project group project') || $route.name.endsWith('project group') }]"
        >
          <router-link :to="projectGroupProjectsLink(ownertype, ownername, projectgroupref)">
            <i class="mdi mdi-home" />
            <span>Projects</span>
          </router-link>
        </li>
        <li
          v-if="$route.name.endsWith('project group settings')"
          class="tab-element"
          :class="[{ 'tab-element-selected': $route.name.endsWith('project group settings') }]"
        >
          <router-link :to="projectGroupSettingsLink(ownertype, ownername, projectgroupref)">
            <i class="mdi mdi-settings" />
            <span>Project Group Settings</span>
          </router-link>
        </li>
      </ul>
      <ul class="flex tab">
        <li>
          <div class="relative">
            <div
              class="flex -mt-3"
              v-click-outside="() => dropdownActive = false"
              @click="dropdownActive = !dropdownActive"
            >
              <button
                class="relative flex items-center focus:outline-none bg-transparent hover:bg-gray-300 text-dark font-semibold hover:text-dark py-1 px-4 border border-gray-500 rounded"
              >
                <i class="mr-4 mdi mdi-settings" />
                <i class="mdi mdi-chevron-down"></i>
              </button>
            </div>
            <div
              v-if="dropdownActive"
              class="z-10 origin-top-right absolute right-0 mt-2 w-64 bg-white rounded-lg border shadow-md py-2"
            >
              <ul>
                <li>
                  <router-link
                    class="block px-4 py-2 hover:bg-blue-500 hover:text-white"
                    :to="projectGroupSettingsLink(ownertype, ownername, projectgroupref)"
                  >
                    <i class="mdi mdi-settings" />
                    <span>Project Group Settings</span>
                  </router-link>
                </li>
              </ul>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <router-view class="mt-8"></router-view>
  </div>
</template>


<script>
import * as vClickOutside from "v-click-outside-x";

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
  directives: {
    clickOutside: vClickOutside.directive
  },
  props: {
    ownertype: String,
    ownername: String,
    projectgroupref: Array
  },
  data() {
    return {
      dropdownActive: false
    };
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
