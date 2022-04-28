<template>
  <div v-if="projectGroup">
    <div class="panel">
      <p class="panel-title">Project Group Settings</p>
      <div class="p-4">
        <div v-if="!isRootProjectGroup" class="mb-4">
          <label class="block font-bold mb-2">Project Group Name</label>
          <div class="control">
            <input
              class="appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="Project Group Name"
              v-model="projectGroup.name"
            />
          </div>
        </div>
        <div class="mb-4">
          <label>
            <input type="checkbox" v-model="projectGroupIsPrivate" />
            Private
          </label>
        </div>
        <button class="btn btn-blue" @click="updateProjectGroup()">
          Update
        </button>

        <div
          v-if="updateProjectGroupError"
          class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span class="block sm:inline">{{ updateProjectGroupError }}</span>
        </div>
      </div>
    </div>

    <div class="panel">
      <p class="panel-title">Secrets</p>
      <div class="p-4">
        <projectsecrets
          :secrets="secrets"
          :allsecrets="allsecrets"
          type="projectgroup"
        />
      </div>
    </div>

    <div class="panel">
      <p class="panel-title">Variables</p>
      <div class="p-4">
        <projectvars
          :variables="variables"
          :allvariables="allvariables"
          type="projectgroup"
        />
      </div>
    </div>

    <div v-if="!isRootProjectGroup" class="panel">
      <p class="panel-title">Danger Zone</p>
      <div class="p-4">
        <h4 class="mb-4 title text-xl">Delete This Project Group</h4>
        <div
          class="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded"
          role="alert"
        >
          <p>
            This operation
            <strong>CANNOT</strong> be undone. This operation will remove
            <strong>{{ projectGroupPath }}</strong>
          </p>
        </div>
        <label class="block mb-2">
          Please type the project group name for confirmation:
          <span class="text-red-500 font-bold">{{ projectGroupName }}</span>
        </label>
        <div class="mb-4">
          <input
            class="appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
            v-model="projectGroupNameToDelete"
            type="email"
            placeholder="Project Group name to delete"
          />
        </div>
        <button
          class="btn btn-red"
          @click="deleteProjectGroup()"
          :disabled="!deleteButtonEnabled"
        >
          Delete Project Group
        </button>
      </div>
    </div>
    <div
      v-if="deleteProjectGroupError"
      class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <span class="block sm:inline">{{ deleteProjectGroupError }}</span>
    </div>
  </div>
</template>

<script>
import {
  fetchProjectGroup,
  fetchSecrets,
  fetchVariables,
  updateProjectGroup,
  deleteProjectGroup,
} from '../util/data';

import { projectGroupLink } from '../util/link';

import projectsecrets from './projectsecrets.vue';
import projectvars from './projectvars.vue';

export default {
  components: { projectsecrets, projectvars },
  name: 'projectgroupsettings',
  props: {
    ownertype: String,
    ownername: String,
    projectgroupref: Array,
  },
  data() {
    return {
      updateProjectGroupError: null,
      deleteProjectGroupError: null,
      projectGroup: null,
      projectGroupIsPrivate: false,
      secrets: [],
      allsecrets: [],
      variables: [],
      allvariables: [],
      projectGroupNameToDelete: '',
    };
  },
  computed: {
    projectGroupName: function () {
      return this.projectgroupref[this.projectgroupref.length - 1];
    },
    projectGroupPath: function () {
      return ['', this.ownertype, this.ownername, ...this.projectgroupref].join(
        '/'
      );
    },
    deleteButtonEnabled: function () {
      return this.projectGroupNameToDelete == this.projectGroupName;
    },
    isRootProjectGroup() {
      return this.projectgroupref.length == 0;
    },
  },
  methods: {
    resetErrors() {
      this.updateProjectGroupError = null;
      this.deleteProjectGroupError = null;
    },
    async updateProjectGroup() {
      this.resetErrors();

      let projectgroupref = [
        this.ownertype,
        this.ownername,
        ...this.projectgroupref,
      ].join('/');

      let visibility = 'public';
      if (this.projectGroupIsPrivate) {
        visibility = 'private';
      }
      let { error } = await updateProjectGroup(
        projectgroupref,
        this.projectGroup.name,
        visibility
      );
      if (error) {
        this.updateProjectGroupError = error;
        return;
      }
    },
    async deleteProjectGroup() {
      let projectgroupref = [
        this.ownertype,
        this.ownername,
        ...this.projectgroupref,
      ].join('/');

      if (this.projectGroupNameToDelete == this.projectGroupName) {
        let { error } = await deleteProjectGroup(projectgroupref);
        if (error) {
          this.deleteProjectGroupError = error;
          return;
        }
        this.$router.push(
          projectGroupLink(
            this.ownertype,
            this.ownername,
            this.projectgroupref.slice(0, -1)
          )
        );
      }
    },
  },
  created: async function () {
    let projectgroupref = [
      this.ownertype,
      this.ownername,
      ...this.projectgroupref,
    ].join('/');

    let { data, error } = await fetchProjectGroup(projectgroupref);
    if (error) {
      this.$store.dispatch('setError', error);
      return;
    }
    this.projectGroup = data;
    this.projectGroupIsPrivate = this.projectGroup.visibility == 'private';

    ({ data, error } = await fetchSecrets(
      'projectgroup',
      projectgroupref,
      false
    ));
    if (error) {
      this.$store.dispatch('setError', error);
      return;
    }
    this.secrets = data;

    ({ data, error } = await fetchSecrets(
      'projectgroup',
      projectgroupref,
      true
    ));
    if (error) {
      this.$store.dispatch('setError', error);
      return;
    }
    this.allsecrets = data;

    ({ data, error } = await fetchVariables(
      'projectgroup',
      projectgroupref,
      false
    ));
    if (error) {
      this.$store.dispatch('setError', error);
      return;
    }
    this.variables = data;

    ({ data, error } = await fetchVariables(
      'projectgroup',
      projectgroupref,
      true
    ));
    if (error) {
      this.$store.dispatch('setError', error);
      return;
    }
    this.allvariables = data;
  },
};
</script>

<style scoped lang="scss"></style>
