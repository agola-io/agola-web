<template>
  <div>
    <div class="user-title">
      <router-link class="user-name" :to="ownerLink('user', username)">
        <span>{{username}}</span>
      </router-link>
    </div>
    <div class="tabs">
      <ul>
        <li :class="[{ 'is-active': $route.name === 'user projects' || $route.name === 'user' }]">
          <router-link :to="ownerProjectsLink('user', username)">Projects</router-link>
        </li>
        <li :class="[{ 'is-active': $route.name === 'user local runs' }]">
          <router-link :to="userLocalRunsLink(username)">Local Runs</router-link>
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
    </div>
    <router-view></router-view>
  </div>
</template>


<script>
import { apiurl, fetch } from "@/util/auth";
import {
  ownerLink,
  ownerProjectsLink,
  userLocalRunsLink,
  userLocalRunLink,
  userLocalRunTaskLink
} from "@/util/link.js";

import { fetchRun } from "@/util/data.js";

import tabarrow from "@/components/tabarrow.vue";

export default {
  name: "User",
  components: { tabarrow },
  props: {
    username: String,
    currentTab: {
      type: String,
      default: "projects"
    }
  },
  data() {
    return {
      run: null
    };
  },
  async beforeRouteEnter(to, from, next) {
    if (!to.params.runid) next();
    let run = await fetchRun(to.params.runid);
    next(vm => (vm.run = run));
  },
  async beforeRouteUpdate(to, from, next) {
    if (!to.params.runid) next();
    this.run = await fetchRun(to.params.runid);
    next();
  },
  methods: {
    ownerLink: ownerLink,
    ownerProjectsLink: ownerProjectsLink,
    userLocalRunsLink: userLocalRunsLink,
    userLocalRunLink: userLocalRunLink,
    userLocalRunTaskLink: userLocalRunTaskLink
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