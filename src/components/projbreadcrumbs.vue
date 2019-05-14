<template>
  <nav class="breadcrumb" aria-label="breadcrumbs">
    <ul>
      <li>
        <a>{{ownertype}}</a>
      </li>
      <li>
        <router-link :to="ownerLink(ownertype, ownername)">{{ownername}}</router-link>
      </li>
      <li v-for="(ref, i) in projectref" v-bind:key="i">
        <router-link
          v-if="i+1 < projectref.length"
          :to="projectGroupLink(ownertype, ownername, projectref.slice(0, i+1))"
        >{{ref}}</router-link>
        <router-link
          v-else
          :to="projectLink(ownertype, ownername, projectref.slice(0, i+1))"
        >{{ref}}</router-link>
      </li>

      <li v-for="(ref, i) in projectgroupref" v-bind:key="i">
        <router-link
          :to="projectGroupLink(ownertype, ownername, projectgroupref.slice(0, i+1))"
        >{{ref}}</router-link>
      </li>
    </ul>
  </nav>
</template>


<script>
import { ownerLink, projectLink, projectGroupLink } from "@/util/link.js";

export default {
  name: "projbreadcrumbs",
  components: {},
  props: {
    ownertype: String,
    ownername: String,
    projectref: Array,
    projectgroupref: Array
  },
  methods: {
    ownerLink: ownerLink,
    projectLink: projectLink,
    projectGroupLink: projectGroupLink
  }
};
</script>


<style scoped lang="scss">
@import "@/css/_variables.scss";
</style>