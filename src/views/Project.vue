<template>
  <div>
    <projbreadcrumbs :ownertype="ownertype" :ownername="ownername" :projectref="projectref" />

    <div class="mb-8">
      <span class="text-3xl">{{projectName()}}</span>
    </div>

    <div class="flex justify-between">
      <ul class="flex-grow tab">
        <li class="tab-element-disabled">
          <i class="mr-1 mdi mdi-run-fast" />
          <span>Runs</span>
        </li>
        <li>
          <tabarrow />
        </li>
        <li
          class="tab-element"
          :class="[{ 'tab-element-selected': $route.name.match('project runs') || $route.name.endsWith('project') }]"
        >
          <router-link :to="projectRunsLink(ownertype, ownername, projectref)">
            <i class="mr-1 mdi mdi-asterisk" />
            <span>All</span>
          </router-link>
        </li>
        <li
          class="tab-element"
          :class="[{ 'tab-element-selected': $route.name.match('project branches runs') }]"
        >
          <router-link :to="projectBranchesRunsLink(ownertype, ownername, projectref)">
            <i class="mr-1 mdi mdi-source-branch" />
            <span>Branches</span>
          </router-link>
        </li>
        <li
          class="tab-element"
          :class="[{ 'tab-element-selected': $route.name.match('project tags runs') }]"
        >
          <router-link :to="projectTagsRunsLink(ownertype, ownername, projectref)">
            <i class="mr-1 mdi mdi-tag" />
            <span>Tags</span>
          </router-link>
        </li>
        <li
          class="tab-element"
          :class="[{ 'tab-element-selected': $route.name.match('project pull requests runs') }]"
        >
          <router-link :to="projectPRsRunsLink(ownertype, ownername, projectref)">
            <i class="mr-1 mdi mdi-source-pull" />
            <span>Pull Requests</span>
          </router-link>
        </li>
        <li
          v-if="run && ($route.name.endsWith('project run') || $route.name.endsWith('project run task'))"
        >
          <tabarrow />
        </li>
        <li
          class="tab-element"
          v-if="run && ($route.name.endsWith('project run') || $route.name.endsWith('project run task'))"
          :class="[{ 'tab-element-selected': $route.name.endsWith('project run') }]"
        >
          <router-link :to="projectRunLink(ownertype, ownername, projectref, $route.params.runid)">
            <p>
              Run
              <strong>#{{run.counter}}</strong>
            </p>
          </router-link>
        </li>
        <li v-if="run && $route.name.endsWith('project run task')">
          <tabarrow />
        </li>
        <li
          class="tab-element"
          v-if="run && $route.name.endsWith('project run task')"
          :class="[{ 'tab-element-selected': $route.name.endsWith('project run task') }]"
        >
          <router-link
            :to="projectRunTaskLink(ownertype, ownername, projectref, $route.params.runid, $route.params.taskid)"
          >
            <p>
              Task
              <strong>{{run.tasks[$route.params.taskid].name}}</strong>
            </p>
          </router-link>
        </li>
        <li
          v-if="$route.name.endsWith('project settings')"
          class="tab-element"
          :class="[{ 'tab-element-selected': $route.name.endsWith('project settings') }]"
        >
          <router-link :to="projectSettingsLink(ownertype, ownername, projectref)">
            <i class="mr-1 mdi mdi-settings" />
            <span>Project Settings</span>
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
                    :to="projectSettingsLink(ownertype, ownername, projectref)"
                  >
                    <i class="mr-1 mdi mdi-settings" />
                    <span>Project Settings</span>
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
  projectLink,
  projectRunsLink,
  projectBranchesRunsLink,
  projectTagsRunsLink,
  projectPRsRunsLink,
  projectRunLink,
  projectRunTaskLink,
  projectSettingsLink
} from "@/util/link.js";

import { fetchRun } from "@/util/data.js";

import projbreadcrumbs from "@/components/projbreadcrumbs.vue";
import tabarrow from "@/components/tabarrow.vue";

export default {
  name: "Project",
  components: { projbreadcrumbs, tabarrow },
  directives: {
    clickOutside: vClickOutside.directive
  },
  props: {
    ownertype: String,
    ownername: String,
    projectref: Array
  },
  data() {
    return {
      dropdownActive: false,
      run: null
    };
  },
  watch: {
    $route: async function(route) {
      this.run = null;
      if (route.params.runid) {
        let { data, error } = await fetchRun(route.params.runid);
        if (error) {
          this.$store.dispatch("setError", error);
          return;
        }
        this.run = data;
      }
    }
  },
  methods: {
    projectLink: projectLink,
    projectRunsLink: projectRunsLink,
    projectBranchesRunsLink: projectBranchesRunsLink,
    projectTagsRunsLink: projectTagsRunsLink,
    projectPRsRunsLink: projectPRsRunsLink,
    projectRunLink: projectRunLink,
    projectRunTaskLink: projectRunTaskLink,
    projectSettingsLink: projectSettingsLink,
    projectName() {
      return this.projectref[this.projectref.length - 1];
    }
  },
  created: async function() {
    if (this.$route.params.runid) {
      let { data, error } = await fetchRun(this.$route.params.runid);
      if (error) {
        this.$store.dispatch("setError", error);
        return;
      }
      this.run = data;
    }
  }
};
</script>

<style scoped lang="scss">
</style>