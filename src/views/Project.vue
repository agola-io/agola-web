<template>
  <div>
    <projbreadcrumbs :ownertype="ownertype" :ownername="ownername" :projectname="projectname"/>
    <div class="tabs">
      <ul>
        <li
          :class="[{ 'is-active': $route.name.endsWith('project runs') || $route.name.endsWith('project') }]"
        >
          <router-link :to="projectRunsLink(ownertype, ownername, projectname)">Runs</router-link>
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
          <router-link
            :to="projectRunLink(ownertype, ownername, $route.params.projectname, $route.params.runid)"
          >Run {{$route.params.runid}}</router-link>
        </li>
        <li
          v-if="$route.name.endsWith('project run task')"
          :class="[{ 'is-active': $route.name.endsWith('project run') }]"
        >
          <tabarrow/>
        </li>
        <li v-if="$route.name.endsWith('project run task')" class="is-active">
          <router-link
            :to="projectRunTaskLink(ownertype, ownername, $route.params.projectname, $route.params.runid, $route.params.taskid)"
          >Task {{$route.params.taskid}}</router-link>
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
  projectRunLink,
  projectRunTaskLink
} from "@/util/link.js";

import projbreadcrumbs from "@/components/projbreadcrumbs.vue";
import runs from "@/components/runs.vue";
import tabarrow from "@/components/tabarrow.vue";

export default {
  name: "Project",
  components: { projbreadcrumbs, runs, tabarrow },
  props: {
    ownertype: String,
    ownername: String,
    projectname: String,
    currentTab: {
      type: String,
      default: "description"
    }
  },
  methods: {
    projectLink: projectLink,
    projectRunsLink: projectRunsLink,
    projectRunLink: projectRunLink,
    projectRunTaskLink: projectRunTaskLink
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