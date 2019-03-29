<template>
  <div>
    <div class="item-list" v-for="project in projects" v-bind:key="project.id">
      <router-link tag="div" class="item" :to="projectURL(project)">
        <span class="name">{{project.name}}</span>
      </router-link>
    </div>
  </div>
</template>

<script>
import { apiurl, fetch } from "@/util/auth";

export default {
  components: {},
  name: "Projects",
  props: {
    ownertype: String,
    ownername: String
  },
  data() {
    return {
      projects: [],
      polling: null
    };
  },
  methods: {
    projectURL(project) {
      if (this.ownertype == "user") {
        return {
          name: "user project",
          params: { username: this.ownername, projectname: project.name }
        };
      } else if (this.ownertype == "org") {
        return {
          name: "org project",
          params: { orgname: this.ownername, projectname: project.name }
        };
      }
    },
    async fetchProjects(ownertype, ownername) {
      let path =
        "/projectgroups/" + encodeURIComponent(ownertype + "/" + ownername);
      path += "/projects";
      let res = await (await fetch(apiurl(path))).json();
      console.log(res);
      this.projects = res;
      console.log("projects", this.projects);
    }
  },
  created: function() {
    this.fetchProjects(this.ownertype, this.ownername);
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