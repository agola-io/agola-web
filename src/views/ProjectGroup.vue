
<template>
  <div>
    <projbreadcrumbs
      :ownertype="ownertype"
      :ownername="ownername"
      :projectgroupref="projectgroupref"
    />
    <div class="tabs">
      <ul>
        <li
          :class="[{ 'is-active': $route.name.match('project group project') || $route.name.endsWith('project group') }]"
        >
          <router-link
            :to="projectGroupProjectsLink(ownertype, ownername, projectgroupref)"
          >Projects</router-link>
        </li>
      </ul>
      <ul class="is-right">
        <li :class="[{ 'is-active': $route.name.endsWith('project group settings') }]">
          <router-link
            :to="projectGroupSettingsLink(ownertype, ownername, projectgroupref)"
          >Project Group Settings</router-link>
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
