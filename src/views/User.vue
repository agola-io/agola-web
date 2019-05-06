<template>
  <div>
    <nav class="breadcrumb is-large" aria-label="breadcrumbs">
      <ul>
        <li>
          <a>user</a>
        </li>
        <li>
          <router-link :to="ownerLink('user', username)">{{username}}</router-link>
        </li>
      </ul>
    </nav>
    <div class="tabs">
      <ul>
        <li :class="[{ 'is-active': $route.name === 'user projects' || $route.name === 'user' }]">
          <router-link :to="ownerProjectsLink('user', username)">
            <span class="icon is-small">
              <i class="mdi mdi-home"/>
            </span>
            <span>Projects</span>
          </router-link>
        </li>
        <li :class="[{ 'is-active': $route.name === 'user local runs' }]">
          <router-link :to="userLocalRunsLink(username)">
            <span class="icon is-small">
              <i class="mdi mdi-run-fast"/>
            </span>
            <span>Local Runs</span>
          </router-link>
        </li>
        <li
          v-if="$route.name === 'user local run' || $route.name == 'user local run task'"
          :class="[{ 'is-active': $route.name === 'user local run' }]"
        >
          <tabarrow/>
        </li>
        <li
          v-if="$route.name === 'user local run' || $route.name == 'user local run task'"
          :class="[{ 'is-active': $route.name === 'user local run' }]"
        >
          <router-link :to="userLocalRunLink(username, $route.params.runid)">
            <p v-if="run">
              Run
              <strong>#{{run.counter}}</strong>
            </p>
          </router-link>
        </li>
        <li
          v-if="$route.name === 'user local run task'"
          :class="[{ 'is-active': $route.name === 'user local run' }]"
        >
          <tabarrow/>
        </li>
        <li v-if="$route.name == 'user local run task'" class="is-active">
          <router-link
            :to="userLocalRunTaskLink(username, $route.params.runid, $route.params.taskid)"
          >
            <p v-if="run">
              Task
              <strong>{{run.tasks[$route.params.taskid].name}}</strong>
            </p>
          </router-link>
        </li>
      </ul>
      <ul class="is-right">
        <li :class="[{ 'is-active': $route.name.endsWith('user settings') }]">
          <router-link :to="userSettingsLink(username)">
            <span class="icon is-small">
              <i class="mdi mdi-settings"/>
            </span>
            <span>User Settings</span>
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
  userLocalRunsLink,
  userLocalRunLink,
  userLocalRunTaskLink,
  userSettingsLink
} from "@/util/link.js";

import { fetchRun } from "@/util/data.js";

import tabarrow from "@/components/tabarrow.vue";

export default {
  name: "User",
  components: { tabarrow },
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
        this.run = await fetchRun(route.params.runid);
      }
    }
  },
  methods: {
    ownerLink: ownerLink,
    ownerProjectsLink: ownerProjectsLink,
    userLocalRunsLink: userLocalRunsLink,
    userLocalRunLink: userLocalRunLink,
    userLocalRunTaskLink: userLocalRunTaskLink,
    userSettingsLink: userSettingsLink
  }
};
</script>

<style scoped lang="scss">
@import "@/css/_variables.scss";

.user-title {
  display: flex;
  align-items: center;
  padding-left: 5px;
  margin-bottom: 25px;
  .user-name {
    color: $grey-dark;
    padding-left: 5px;
    font-size: 1.5rem;
    padding-right: 1rem;
  }
}
</style>