<template>
  <div>
    <projbreadcrumbs :ownertype="ownertype" :ownername="ownername" :projectref="projectref"/>

    <div class="mb-8">
      <span class="text-3xl">{{projectName()}}</span>
    </div>

    <div class="flex justify-between">
      <ul class="flex-grow tab">
        <li class="tab-element">
          <i class="mr-1 mdi mdi-run-fast"/>
          <span>Runs</span>
        </li>
        <li>
          <tabarrow/>
        </li>
        <li
          class="tab-element"
          :class="[{ 'tab-element-selected': $route.name.match('project runs') || $route.name.endsWith('project') }]"
        >
          <router-link :to="projectRunsLink(ownertype, ownername, projectref)">
            <i class="mr-1 mdi mdi-asterisk"/>
            <span>All</span>
          </router-link>
        </li>
        <li
          class="tab-element"
          :class="[{ 'tab-element-selected': $route.name.match('project branches runs') }]"
        >
          <router-link :to="projectBranchesRunsLink(ownertype, ownername, projectref)">
            <i class="mr-1 mdi mdi-source-branch"/>
            <span>Branches</span>
          </router-link>
        </li>
        <li
          class="tab-element"
          :class="[{ 'tab-element-selected': $route.name.match('project tags runs') }]"
        >
          <router-link :to="projectTagsRunsLink(ownertype, ownername, projectref)">
            <i class="mr-1 mdi mdi-tag"/>
            <span>Tags</span>
          </router-link>
        </li>
        <li
          class="tab-element"
          :class="[{ 'tab-element-selected': $route.name.match('project pull requests runs') }]"
        >
          <router-link :to="projectPRsRunsLink(ownertype, ownername, projectref)">
            <i class="mr-1 mdi mdi-source-pull"/>
            <span>Pull Requests</span>
          </router-link>
        </li>
        <li v-if="$route.name.endsWith('project run') || $route.name.endsWith('project run task')">
          <tabarrow/>
        </li>
        <li
          class="tab-element"
          v-if="$route.name.endsWith('project run') || $route.name.endsWith('project run task')"
          :class="[{ 'tab-element-selected': $route.name.endsWith('project run') }]"
        >
          <router-link :to="projectRunLink(ownertype, ownername, projectref, $route.params.runid)">
            <p v-if="run">
              Run
              <strong>#{{run.counter}}</strong>
            </p>
          </router-link>
        </li>
        <li v-if="$route.name.endsWith('project run task')">
          <tabarrow/>
        </li>
        <li class="tab-element" v-if="$route.name.endsWith('project run task')">
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
      <ul class="flex tab">
        <li
          class="tab-element"
          :class="[{ 'tab-element-selected': $route.name.endsWith('project settings') }]"
        >
          <router-link :to="projectSettingsLink(ownertype, ownername, projectref)">
            <i class="mr-1 mdi mdi-settings"/>
            <span>Project Settings</span>
          </router-link>
        </li>
      </ul>
    </div>
    <router-view class="mt-8"></router-view>
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