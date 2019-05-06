<template>
  <div>
    <nav class="breadcrumb" aria-label="breadcrumbs">
      <ul>
        <li>
          <a>org</a>
        </li>
        <li>
          <router-link :to="ownerLink('org', orgname)">{{orgname}}</router-link>
        </li>
      </ul>
    </nav>

    <div class="name">
      <span class="is-size-3">{{orgname}}</span>
    </div>

    <div class="tabs">
      <ul>
        <li :class="[{ 'is-active': $route.name === 'org projects' || $route.name === 'org' }]">
          <router-link :to="ownerProjectsLink('org', orgname)">
            <span class="icon is-small">
              <i class="mdi mdi-home"/>
            </span>
            <span>Projects</span>
          </router-link>
        </li>
      </ul>
    </div>
    <router-view></router-view>
  </div>
</template>


<script>
import { ownerLink, ownerProjectsLink } from "@/util/link.js";

export default {
  name: "Org",
  components: {},
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

.name {
  padding-left: 5px;
  margin-bottom: 25px;
}
</style>