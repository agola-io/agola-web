<template>
  <div>
    <h4 class="title is-4">Projects</h4>
    <div class="item-list" v-for="project in projects" v-bind:key="project.id">
      <router-link
        tag="div"
        class="item"
        :to="projectLink(ownertype, ownername, ref(project.name))"
      >
        <span class="name">{{project.name}}</span>
      </router-link>
    </div>

    <hr>
    <h4 class="title is-4">Project Groups</h4>
    <div class="item-list" v-for="projectgroup in projectgroups" v-bind:key="projectgroup.id">
      <router-link
        tag="div"
        class="item"
        :to="projectGroupLink(ownertype, ownername, ref(projectgroup.name))"
      >
        <span class="name">{{projectgroup.name}}</span>
      </router-link>
    </div>
  </div>
</template>

<script>
import { apiurl, fetch } from "@/util/auth";
import { projectLink, projectGroupLink } from "@/util/link.js";

export default {
  components: {},
  name: "Projects",
  props: {
    ownertype: String,
    ownername: String,
    projectgroupref: Array
  },
  data() {
    return {
      projects: [],
      projectgroups: [],
      polling: null
    };
  },
  watch: {
    $route: async function() {
      this.fetchProjects(this.ownertype, this.ownername);
      this.fetchProjectGroups(this.ownertype, this.ownername);
    }
  },
  methods: {
    ref(name) {
      let ref = [];
      if (this.projectgroupref) {
        ref = this.projectgroupref.slice(0);
      }
      ref.push(name);
      return ref;
    },
    async fetchProjects(ownertype, ownername) {
      let ref = [ownertype, ownername];
      if (this.projectgroupref) {
        ref.push(...this.projectgroupref);
      }
      let path = "/projectgroups/" + encodeURIComponent(ref.join("/"));
      path += "/projects";
      let res = await (await fetch(apiurl(path))).json();
      this.projects = res;
    },
    async fetchProjectGroups(ownertype, ownername) {
      let ref = [ownertype, ownername];
      if (this.projectgroupref) {
        ref.push(...this.projectgroupref);
      }
      let path = "/projectgroups/" + encodeURIComponent(ref.join("/"));
      path += "/subgroups";
      let res = await (await fetch(apiurl(path))).json();
      this.projectgroups = res;
    },
    projectLink: projectLink,
    projectGroupLink: projectGroupLink
  },
  created: function() {
    this.fetchProjects(this.ownertype, this.ownername);
    this.fetchProjectGroups(this.ownertype, this.ownername);
  }
};
</script>

<style scoped lang="scss">
@import "@/css/_variables.scss";

.item-list {
  .item {
    margin-bottom: 5px;
    border: 1px solid $grey-lighter;
    cursor: pointer;
    display: flex;
    padding: 10px;
  }
  .name {
    font-weight: bold;
  }
}
</style>