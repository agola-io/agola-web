<template>
  <div>
    <div
      v-if="fetchRunsError"
      class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <div>{{ fetchRunsError }}</div>
    </div>
    <div v-if="runs.length > 0">
      <ul>
        <li
          class="mb-2 border-l-5 rounded-l"
          v-for="run in runs"
          v-bind:key="run.id"
          :class="runResultClass(run)"
        >
          <div class="pl-4 flex items-center border border-l-0 rounded-r">
            <router-link
              v-if="projectref"
              class="w-1/3 font-bold"
              :to="projectRunLink(ownertype, ownername, projectref, run.id)"
            >
              <span class>{{run.name}}</span>
            </router-link>
            <router-link v-else class="w-1/3 font-bold" :to="userDirectRunLink(ownername, run.id)">
              <span>{{run.name}}</span>
            </router-link>
            <div class="w-1/3">{{run.annotations.message}}</div>
            <span
              v-if="waitingApproval(run)"
              class="w-1/5 inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold mr-2"
            >Waiting Approval</span>
            <span v-if="!waitingApproval(run)" class="w-1/5"></span>
            <span
              v-if="stillRunning(run)"
              class="w-1/5 inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold mr-2"
            >Still running</span>
            <span v-if="!stillRunning(run)" class="w-1/5"></span>
            <div class="w-32">
              <a :href="run.annotations.commit_link" class="block" target="_blank">
                <i class="mdi mdi-source-commit mdi-rotate-90"></i>
                <span>{{run.annotations.commit_sha.substring(0,8)}}</span>
              </a>
              <a
                v-if="run.annotations.ref_type == 'branch'"
                :href="run.annotations.branch_link"
                class="block whitespace-no-wrap overflow-x-hidden"
                target="_blank"
              >
                <i class="mdi mdi-source-branch"></i>
                <span>{{run.annotations.branch}}</span>
              </a>
              <a
                v-else-if="run.annotations.ref_type == 'tag'"
                :href="run.annotations.tag_link"
                class="block"
                target="_blank"
              >
                <i class="mdi mdi-tag"></i>
                <span>{{run.annotations.tag}}</span>
              </a>
              <a
                v-else-if="run.annotations.ref_type == 'pull_request'"
                :href="run.annotations.pull_request_link"
                class="block"
                target="_blank"
              >
                <i class="mdi mdi-source-pull"></i>
                <span>PR #{{run.annotations.pull_request_id}}</span>
              </a>
            </div>
          </div>
        </li>
      </ul>
      <div class="flex justify-center my-3">
        <button
          v-if="hasMoreRuns"
          class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
          @click="loadMoreRuns()"
        >Load more...</button>
      </div>
    </div>
    <div v-else class>No runs</div>
  </div>
</template>

<script>
import { fetchUser, fetchProject, fetchRuns } from "@/util/data.js";
import { userDirectRunLink, projectRunLink } from "@/util/link.js";
import { runResultClass } from "@/util/run.js";

export default {
  components: {},
  name: "runs",
  props: {
    ownertype: String,
    ownername: String,
    projectref: Array,
    query: String
  },
  data() {
    return {
      fetchRunsError: null,
      runs: [],
      wantedRunsNumber: 25,
      hasMoreRuns: false,
      polling: null,
      project: null,
      user: null
    };
  },
  watch: {
    $route: function() {
      this.update();
    }
  },
  methods: {
    projectRunLink: projectRunLink,
    userDirectRunLink: userDirectRunLink,
    runResultClass: runResultClass,
    stillRunning(run) {
      return run.result != "unknown" && run.phase == "running";
    },
    waitingApproval(run) {
      return run.tasks_waiting_approval.length > 0;
    },
    update() {
      clearInterval(this.polling);
      if (this.projectref !== undefined) {
        this.fetchProject();
      } else {
        this.fetchUser();
      }
      this.pollData();
    },
    async fetchProject() {
      let projectref = [
        this.ownertype,
        this.ownername,
        ...this.projectref
      ].join("/");

      let { data, error } = await fetchProject(projectref);
      if (error) {
        this.$store.dispatch("setError", error);
        return;
      }
      this.project = data;

      this.fetchRuns();
    },
    async fetchUser() {
      let { data, error } = await fetchUser(this.ownername);
      if (error) {
        this.$store.dispatch("setError", error);
        return;
      }
      this.user = data;

      this.fetchRuns();
    },
    loadMoreRuns() {
      this.wantedRunsNumber += 25;
      this.fetchRuns();
    },
    // TODO(sgotti) use run events instead of refetching all runs everytime
    async fetchRuns() {
      let group;
      let lastrun = false;
      if (this.project !== null) {
        if (this.query == "branches") {
          group = "/project/" + this.project.id + "/branch";
        } else if (this.query == "tags") {
          group = "/project/" + this.project.id + "/tag";
        } else if (this.query == "pullrequests") {
          group = "/project/" + this.project.id + "/pr";
        } else {
          group = "/project/" + this.project.id;
        }
      } else if (this.user !== null) {
        group = "/user/" + this.user.id;
      }

      let newRuns = [];
      let hasMoreRuns = false;
      let stopFetch = false;
      let runCount = 0;
      let startRunID = null;
      while (!stopFetch) {
        let { data, error } = await fetchRuns(group, startRunID, lastrun);
        if (error) {
          this.fetchRunsError = error;
          return;
        }
        this.fetchRunsError = null;
        runCount += data.length;
        if (runCount >= this.wantedRunsNumber || data.length == 0) {
          hasMoreRuns = data.length != 0;
          stopFetch = true;
        }
        newRuns = newRuns.concat(data);
        if (newRuns.length) {
          startRunID = newRuns[newRuns.length - 1].id;
        }
      }
      this.runs = newRuns;
      this.hasMoreRuns = hasMoreRuns;
    },
    pollData() {
      clearInterval(this.polling);
      this.polling = setInterval(() => {
        this.fetchRuns();
      }, 2000);
    }
  },
  created: function() {
    this.update();
  },
  beforeDestroy() {
    clearInterval(this.polling);
  }
};
</script>

<style scoped lang="scss">
</style>
