<template>
  <div>
    <h4 class="text-xl my-3">Projects</h4>
    <div v-if="fetchProjectsLoading" class="ml-6 flex w-48">
      <div v-bind:class="{ 'spinner': fetchProjectsLoading }"></div>
    </div>
    <ul v-else-if="projects.length > 0">
      <li class="mb-2 border rounded-l" v-for="project in projects" v-bind:key="project.id">
        <div class="pl-4 py-4 flex items-center">
          <router-link class="item" :to="projectLink(ownertype, ownername, ref(project.name))">
            <span class="font-bold">{{project.name}}</span>
          </router-link>
        </div>
      </li>
    </ul>
    <div v-else class="font-bold">No projects</div>

    <hr class="my-6 border-t" />

    <h4 class="text-xl my-3">Project Groups</h4>
    <div v-if="fetchProjectGroupsLoading" class="ml-6 flex w-48">
      <div v-bind:class="{ 'spinner': fetchProjectGroupsLoading }"></div>
    </div>
    <ul v-else-if="projectgroups.length > 0">
      <li
        class="mb-2 border rounded-l"
        v-for="projectgroup in projectgroups"
        v-bind:key="projectgroup.id"
      >
        <div class="pl-4 py-4 flex items-center">
          <router-link
            class="item"
            :to="projectGroupLink(ownertype, ownername, ref(projectgroup.name))"
          >
            <span class="font-bold">{{projectgroup.name}}</span>
          </router-link>
        </div>
      </li>
    </ul>
    <div v-else class="font-bold">No project groups</div>
  </div>
</template>

<script>
import {
  fetchProjectGroupProjects,
  fetchProjectGroupSubgroups
} from "@/util/data.js";

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
      fetchProjectGroupsLoading: false,
      fetchProjectsLoading: false,

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
    startFetchProjectsLoading() {
      this.fetchProjectsLoading = true;
    },
    stopFetchProjectsLoading() {
      this.fetchProjectsLoading = false;
    },
    startFetchProjectGroupsLoading() {
      this.fetchProjectGroupsLoading = true;
    },
    stopFetchProjectGroupsLoading() {
      this.fetchProjectGroupsLoading = false;
    },
    ref(name) {
      let ref = [];
      if (this.projectgroupref) {
        ref = this.projectgroupref.slice(0);
      }
      ref.push(name);
      return ref;
    },
    async fetchProjects(ownertype, ownername) {
      let projectgroupref = [ownertype, ownername];
      if (this.projectgroupref) {
        projectgroupref.push(...this.projectgroupref);
      }

      this.startFetchProjectsLoading();
      let { data, error } = await fetchProjectGroupProjects(
        projectgroupref.join("/")
      );
      this.stopFetchProjectsLoading();
      if (error) {
        this.$store.dispatch("setError", error);
        return;
      }
      this.projects = data;
    },
    async fetchProjectGroups(ownertype, ownername) {
      let projectgroupref = [ownertype, ownername];
      if (this.projectgroupref) {
        projectgroupref.push(...this.projectgroupref);
      }
      this.startFetchProjectGroupsLoading();
      let { data, error } = await fetchProjectGroupSubgroups(
        projectgroupref.join("/")
      );
      this.stopFetchProjectGroupsLoading();
      if (error) {
        this.$store.dispatch("setError", error);
        return;
      }
      this.projectgroups = data;
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
</style>