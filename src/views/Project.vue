<template>
  <div>
    <projbreadcrumbs :ownertype="ownertype" :ownername="ownername" :projectref="projectref"/>
    <div class="tabs">
      <ul>
        <li>
          <span class="icon is-small">
            <i class="mdi mdi-run-fast"/>
          </span>
          <span>Runs</span>
        </li>
        <li>
          <tabarrow/>
        </li>
        <li
          :class="[{ 'is-active': $route.name.match('project runs') || $route.name.endsWith('project') }]"
        >
          <router-link :to="projectRunsLink(ownertype, ownername, projectref)">
            <span class="icon is-small">
              <i class="mdi mdi-asterisk"/>
            </span>
            <span>All</span>
          </router-link>
        </li>
        <li :class="[{ 'is-active': $route.name.match('project branches runs') }]">
          <router-link :to="projectBranchesRunsLink(ownertype, ownername, projectref)">
            <span class="icon is-small">
              <i class="mdi mdi-source-branch"/>
            </span>
            <span>Branches</span>
          </router-link>
        </li>
        <li :class="[{ 'is-active': $route.name.match('project tags runs') }]">
          <router-link :to="projectTagsRunsLink(ownertype, ownername, projectref)">
            <span class="icon is-small">
              <i class="mdi mdi-tag"/>
            </span>
            <span>Tags</span>
          </router-link>
        </li>
        <li :class="[{ 'is-active': $route.name.match('project pull requests runs') }]">
          <router-link :to="projectPRsRunsLink(ownertype, ownername, projectref)">
            <span class="icon is-small">
              <i class="mdi mdi-source-pull"/>
            </span>
            <span>Pull Requests</span>
          </router-link>
        </li>
        <li
          v-if="$route.name.endsWith('project run') || $route.name.endsWith('project run task')"
          :class="[{ 'is-active': $route.name.endsWith('project run') }]"
        >
          <tabarrow/>
        </li>
        <li
          v-if="$route.name.endsWith('project run') || $route.name.endsWith('project run task')"
          :class="[{ 'is-active': $route.name.endsWith('project run') }]"
        >
          <router-link :to="projectRunLink(ownertype, ownername, projectref, $route.params.runid)">
            <p v-if="run">
              Run
              <strong>#{{run.counter}}</strong>
            </p>
          </router-link>
        </li>
        <li
          v-if="$route.name.endsWith('project run task')"
          :class="[{ 'is-active': $route.name.endsWith('project run') }]"
        >
          <tabarrow/>
        </li>
        <li v-if="$route.name.endsWith('project run task')" class="is-active">
          <router-link
            :to="projectRunTaskLink(ownertype, ownername, projectref, $route.params.runid, $route.params.taskid)"
          >
            <p v-if="run">
              Task
              <strong>{{run.tasks[$route.params.taskid].name}}</strong>
            </p>
          </router-link>
        </li>
      </ul>
      <ul class="is-right">
        <li :class="[{ 'is-active': $route.name.endsWith('project settings') }]">
          <router-link :to="projectSettingsLink(ownertype, ownername, projectref)">
            <span class="icon is-small">
              <i class="mdi mdi-settings"/>
            </span>
            <span>Project Settings</span>
          </router-link>
        </li>
      </ul>
    </div>
    <router-view></router-view>
  </div>
</template>


<script>
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
  props: {
    ownertype: String,
    ownername: String,
    projectref: Array
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
    projectLink: projectLink,
    projectRunsLink: projectRunsLink,
    projectBranchesRunsLink: projectBranchesRunsLink,
    projectTagsRunsLink: projectTagsRunsLink,
    projectPRsRunsLink: projectPRsRunsLink,
    projectRunLink: projectRunLink,
    projectRunTaskLink: projectRunTaskLink,
    projectSettingsLink: projectSettingsLink
  },
  created: async function() {
    if (this.$route.params.runid) {
      this.run = await fetchRun(this.$route.params.runid);
    }
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
    padding-left: 5px;
    font-size: 1.5rem;
    padding-right: 1rem;
  }
}
</style>