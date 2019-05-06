
<template>
  <div>
    <projbreadcrumbs
      :ownertype="ownertype"
      :ownername="ownername"
      :projectgroupref="projectgroupref"
    />

    <div class="name">
      <span class="is-size-3">{{projectgroupref[projectgroupref.length-1]}}</span>
    </div>

    <div class="tabs">
      <ul>
        <li
          :class="[{ 'is-active': $route.name.match('project group project') || $route.name.endsWith('project group') }]"
        >
          <router-link :to="projectGroupProjectsLink(ownertype, ownername, projectgroupref)">
            <span class="icon is-small">
              <i class="mdi mdi-home"/>
            </span>
            <span>Projects</span>
          </router-link>
        </li>
      </ul>
      <ul class="is-right">
        <li :class="[{ 'is-active': $route.name.endsWith('project group settings') }]">
          <router-link :to="projectGroupSettingsLink(ownertype, ownername, projectgroupref)">
            <span class="icon is-small">
              <i class="mdi mdi-settings"/>
            </span>
            <span>Project Group Settings</span>
          </router-link>
        </li>
      </ul>
    </div>
    <router-view></router-view>
  </div>
</template>


<script>
import {
  projectGroupProjectsLink,
  projectGroupSettingsLink
} from "@/util/link.js";

import { fetchRun } from "@/util/data.js";

import projbreadcrumbs from "@/components/projbreadcrumbs.vue";

export default {
  name: "ProjectGroup",
  components: { projbreadcrumbs },
  props: {
    ownertype: String,
    ownername: String,
    projectgroupref: Array
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
    projectGroupProjectsLink: projectGroupProjectsLink,
    projectGroupSettingsLink: projectGroupSettingsLink
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

.name {
  padding-left: 5px;
  margin-bottom: 25px;
}
</style>
