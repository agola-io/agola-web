<template>
  <div>
    <nav class="mb-4 bg-grey-light rounded font-sans w-full">
      <ol class="list-reset flex text-grey-dark">
        <li>
          <a>user</a>
        </li>
        <li>
          <span class="mx-2">/</span>
        </li>
        <li>
          <router-link :to="ownerLink('user', username)">{{username}}</router-link>
        </li>
      </ol>
    </nav>

    <div class="mb-8 flex justify-between">
      <span class="text-3xl">{{username}}</span>
      <createprojectbutton v-on:click="goToCreate($event)" />
    </div>

    <div class="flex justify-between">
      <ul class="flex-grow tab">
        <li
          class="tab-element"
          :class="[{ 'tab-element-selected': $route.name === 'user projects' || $route.name === 'user' }]"
        >
          <router-link :to="ownerProjectsLink('user', username)">
            <i class="mr-1 mdi mdi-home" />
            <span>Projects</span>
          </router-link>
        </li>
        <li
          class="tab-element"
          :class="[{ 'tab-element-selected': $route.name === 'user direct runs' }]"
        >
          <router-link :to="userDirectRunsLink(username)">
            <i class="mr-1 mdi mdi-run-fast" />
            <span>Direct Runs</span>
          </router-link>
        </li>
        <li
          v-if="run && ($route.name === 'user direct run' || $route.name == 'user direct run task')"
        >
          <tabarrow />
        </li>
        <li
          class="tab-element"
          v-if="run && ($route.name === 'user direct run' || $route.name == 'user direct run task')"
          :class="[{ 'tab-element-selected': $route.name === 'user direct run' }]"
        >
          <router-link :to="userDirectRunLink(username, $route.params.runid)">
            <span>
              Run
              <strong>#{{run.counter}}</strong>
            </span>
          </router-link>
        </li>
        <li v-if="run && $route.name === 'user direct run task'">
          <tabarrow />
        </li>
        <li
          class="tab-element"
          v-if="run && $route.name == 'user direct run task'"
          :class="[{ 'tab-element-selected': $route.name === 'user direct run task' }]"
        >
          <router-link
            :to="userDirectRunTaskLink(username, $route.params.runid, $route.params.taskid)"
          >
            <span>
              Task
              <strong>{{run.tasks[$route.params.taskid].name}}</strong>
            </span>
          </router-link>
        </li>
        <li
          v-if="$route.name.endsWith('user project group settings')"
          class="tab-element"
          :class="[{ 'tab-element-selected': $route.name.endsWith('user project group settings') }]"
        >
          <router-link :to="projectGroupSettingsLink('user', username, [])">
            <i class="mr-1 mdi mdi-settings" />
            <span>Root Project Group Settings</span>
          </router-link>
        </li>
        <li
          v-if="$route.name.endsWith('user settings')"
          class="tab-element"
          :class="[{ 'tab-element-selected': $route.name.endsWith('user settings') }]"
        >
          <router-link :to="ownerSettingsLink('user', username)">
            <i class="mr-1 mdi mdi-settings" />
            <span>User Settings</span>
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
                    :to="projectGroupSettingsLink('user', username, [])"
                  >
                    <i class="mr-1 mdi mdi-settings" />
                    <span>Root Project Group Settings</span>
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
  ownerLink,
  ownerProjectsLink,
  userDirectRunsLink,
  userDirectRunLink,
  userDirectRunTaskLink,
  ownerSettingsLink,
  projectGroupCreateProjectGroupLink,
  projectGroupCreateProjectLink,
  projectGroupSettingsLink
} from "@/util/link.js";

import { fetchRun } from "@/util/data.js";

import createprojectbutton from "@/components/createprojectbutton.vue";
import tabarrow from "@/components/tabarrow.vue";

export default {
  name: "User",
  components: { createprojectbutton, tabarrow },
  directives: {
    clickOutside: vClickOutside.directive
  },
  props: {
    username: String
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
    ownerLink: ownerLink,
    ownerProjectsLink: ownerProjectsLink,
    userDirectRunsLink: userDirectRunsLink,
    userDirectRunLink: userDirectRunLink,
    userDirectRunTaskLink: userDirectRunTaskLink,
    ownerSettingsLink: ownerSettingsLink,
    projectGroupCreateProjectGroupLink: projectGroupCreateProjectGroupLink,
    projectGroupCreateProjectLink: projectGroupCreateProjectLink,
    projectGroupSettingsLink: projectGroupSettingsLink,
    goToCreate(type) {
      if (type == "project") {
        this.$router.push(
          projectGroupCreateProjectLink("user", this.username, [])
        );
        return;
      }
      this.$router.push(
        projectGroupCreateProjectGroupLink("user", this.username, [])
      );
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