<template>
  <nav class="breadcrumb is-large" aria-label="breadcrumbs">
    <ul>
      <li>
        <router-link :to="ownerLink(ownertype, ownername)">{{ownername}}</router-link>
      </li>
      <li v-if="projectname">
        <router-link :to="projectLink(ownertype, ownername, projectname)">{{projectname}}</router-link>
      </li>
    </ul>
  </nav>
</template>


<script>
import { ownerLink, projectLink } from "@/util/link.js";

export default {
  name: "projbreadcrumbs",
  components: {},
  props: {
    ownertype: String,
    ownername: String,
    projectname: String
  },
  methods: {
    ownerLink: ownerLink,
    projectLink: projectLink
  }
};
</script>


<style scoped lang="scss">
@import "@/css/_variables.scss";
</style>