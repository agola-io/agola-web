<template>
  <div>
    <nav class="breadcrumb is-large" aria-label="breadcrumbs">
      <ul>
        <li>
          <a>org</a>
        </li>
        <li>
          <router-link :to="ownerLink('org', orgname)">{{orgname}}</router-link>
        </li>
      </ul>
    </nav>
    <div class="tabs">
      <ul>
        <li :class="[{ 'is-active': $route.name === 'org projects' || $route.name === 'org' }]">
          <router-link :to="ownerProjectsLink('org', orgname)">Projects</router-link>
        </li>
      </ul>
    </div>
    <router-view></router-view>
  </div>
</template>


<script>
import { ownerLink, ownerProjectsLink } from "@/util/link.js";

import projects from "@/components/projects.vue";

export default {
  name: "Org",
  components: { projects },
  props: {
    orgname: String
  },
  methods: {
    ownerLink: ownerLink,
    ownerProjectsLink: ownerProjectsLink
  }
};
</script>

<style scoped lang="scss">
@import "@/css/_variables.scss";

.org-title {
  display: flex;
  align-items: center;
  padding-left: 5px;
  margin-bottom: 25px;
  .org-name {
    color: $grey-dark;
    padding-left: 5px;
    font-size: 1.5rem;
    padding-right: 1rem;
  }
}
</style>