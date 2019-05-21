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
      <createprojectbutton v-on:click="goToCreate($event)"/>
    </div>

    <div class="flex justify-between">
      <ul class="flex-grow tab">
        <li
          class="tab-element"
          :class="[{ 'tab-element-selected': $route.name === 'user projects' || $route.name === 'user' }]"
        >
          <router-link :to="ownerProjectsLink('user', username)">
            <i class="mr-1 mdi mdi-home"/>
            <span>Projects</span>
          </router-link>
        </li>
        <li
          class="tab-element"
          :class="[{ 'tab-element-selected': $route.name === 'user local runs' }]"
        >
          <router-link :to="userLocalRunsLink(username)">
            <i class="mr-1 mdi mdi-run-fast"/>
            <span>Local Runs</span>
          </router-link>
        </li>
        <li v-if="$route.name === 'user local run' || $route.name == 'user local run task'">
          <tabarrow/>
        </li>
        <li
          class="tab-element"
          v-if="$route.name === 'user local run' || $route.name == 'user local run task'"
          :class="[{ 'tab-element-selected': $route.name === 'user local run' }]"
        >
          <router-link :to="userLocalRunLink(username, $route.params.runid)">
            <span v-if="run">
              Run
              <strong>#{{run.counter}}</strong>
            </span>
          </router-link>
        </li>
        <li v-if="$route.name === 'user local run task'">
          <tabarrow/>
        </li>
        <li
          class="tab-element"
          v-if="$route.name == 'user local run task'"
          :class="[{ 'tab-element-selected': $route.name === 'user local run task' }]"
        >
          <router-link
            :to="userLocalRunTaskLink(username, $route.params.runid, $route.params.taskid)"
          >
            <span v-if="run">
              Task
              <strong>{{run.tasks[$route.params.taskid].name}}</strong>
            </span>
          </router-link>
        </li>
      </ul>
      <ul class="flex tab">
        <li
          class="tab-element"
          :class="[{ 'tab-element-selected': $route.name.endsWith('user project group settings') }]"
        >
          <router-link :to="projectGroupSettingsLink('user', username, [])">
            <i class="mr-1 mdi mdi-settings"/>
            <span>Root Project Group Settings</span>
          </router-link>
        </li>
        <li
          class="tab-element"
          :class="[{ 'tab-element-selected': $route.name.endsWith('user settings') }]"
        >
          <router-link :to="ownerSettingsLink('user', username)">
            <i class="mr-1 mdi mdi-settings"/>
            <span>User Settings</span>
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
  userLocalRunsLink,
  userLocalRunLink,
  userLocalRunTaskLink,
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
  props: {
    username: String
  },
  data() {
    return {
      run: null
    };
  },
  watch: {
    $route: async function(route) {
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
    userLocalRunsLink: userLocalRunsLink,
    userLocalRunLink: userLocalRunLink,
    userLocalRunTaskLink: userLocalRunTaskLink,
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
  }
};
</script>

<style scoped lang="scss">
</style>