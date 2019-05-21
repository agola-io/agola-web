<template>
  <div>
    <div v-if="run != null">
      <div
        v-if="stopRunError"
        class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <span class="block sm:inline">{{ stopRunError }}</span>
      </div>
      <div
        v-if="cancelRunError"
        class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <span class="block sm:inline">{{ cancelRunError }}</span>
      </div>
      <div
        v-if="restartRunError"
        class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <span class="block sm:inline">{{ restartRunError }}</span>
      </div>

      <div class="mb-2 border-l-5 rounded shadow" :class="runResultClass(run)">
        <div class="p-4 border border-l-0 rounded-r">
          <div class="flex items-start justify-between">
            <div class="flex items-center">
              <span class="text-2xl mr-3">{{run.name}}</span>
              <span
                class="mr-3 rounded px-2 py-1 text-xs"
                :class="'is-' + runResultClass(run)"
              >{{ runStatus(run) | capitalize }}</span>
              <span
                v-if="stillRunning(run)"
                class="rounded bg-gray-500 text-white px-2 py-1 text-xs"
              >Still running</span>
            </div>
            <div class="relative mr-3">
              <div
                v-if="run.can_restart_from_scratch || run.can_restart_from_failed_tasks"
                class="flex"
                v-click-outside="() => dropdownActive = false"
              >
                <div class="flex items-center">
                  <button class="btn btn-blue" @click="toggleDropdown()">
                    <span>Restart</span>
                    <i class="ml-3 mdi mdi-restart" aria-hidden="true"></i>
                  </button>
                </div>
              </div>

              <div
                v-if="dropdownActive"
                class="z-10 origin-top-right absolute right-0 mt-2 w-64 bg-white rounded-lg border shadow-md py-2"
              >
                <ul>
                  <li>
                    <a
                      v-if="run.can_restart_from_scratch"
                      class="block px-4 py-2 hover:bg-blue-500 hover:text-white"
                      @click="restartRun(run.id, true)"
                    >From start</a>
                  </li>
                  <li>
                    <a
                      v-if="run.can_restart_from_failed_tasks"
                      class="block px-4 py-2 hover:bg-blue-500 hover:text-white"
                      @click="restartRun(run.id)"
                    >From failed tasks</a>
                  </li>
                </ul>
              </div>
              <button
                class="btn btn-red"
                v-if="run.phase == 'queued'"
                @click="cancelRun(run.id)"
              >Cancel</button>
              <button
                class="btn btn-red"
                v-if="run.phase == 'running'"
                :disabled="run.stopping"
                @click="stopRun(run.id)"
              >Stop</button>
            </div>
          </div>
          <div class="flex">
            <div class="w-1/2">{{run.annotations.message}}</div>
            <div class="w-1/2">
              <a :href="run.annotations.commit_link" class="block" target="_blank">
                <i class="mdi mdi-source-commit mdi-rotate-90"></i>
                <span>{{run.annotations.commit_sha.substring(0,8)}}</span>
              </a>
              <a
                v-if="run.annotations.event_type == 'push'"
                :href="run.annotations.branch_link"
                class="block"
                target="_blank"
              >
                <i class="mdi mdi-source-branch"></i>
                <span>{{run.annotations.branch}}</span>
              </a>
              <a
                v-else-if="run.annotations.event_type == 'tag'"
                :href="run.annotations.tag_link"
                class="block"
                target="_blank"
              >
                <i class="mdi mdi-tag"></i>
                <span>{{run.annotations.tag}}</span>
              </a>
              <a
                v-else-if="run.annotations.event_type == 'pull_request'"
                :href="run.annotations.pull_request_link"
                class="block"
                target="_blank"
              >
                <i class="mdi mdi-source-pull"></i>
                <span>PR #{{run.annotations.pull_request_id}}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import vClickOutside from "v-click-outside";

import { cancelRun, stopRun, restartRun } from "@/util/data.js";

import { userLocalRunLink, projectRunLink } from "@/util/link.js";

export default {
  name: "RunDetail",
  directives: {
    clickOutside: vClickOutside.directive
  },
  props: {
    ownertype: String,
    ownername: String,
    projectref: Array,
    run: Object
  },
  data() {
    return {
      stopRunError: null,
      cancelRunError: null,
      restartRunError: null,
      dropdownActive: false
    };
  },
  methods: {
    resetErrors() {
      this.stopRunError = null;
      this.cancelRunError = null;
      this.restartRunError = null;
    },
    toggleDropdown() {
      this.dropdownActive = !this.dropdownActive;
    },
    stillRunning(run) {
      return run.result != "unknown" && run.phase == "running";
    },
    runStatus(run) {
      if (run.phase != "finished") return run.phase;
      if (run.result != "unknown") return run.result;
      if (run.stopping) return "stopping";

      return run.result;
    },
    runResultClass(run) {
      let status = this.runStatus(run);

      if (status == "setuperror") return "setuperror";
      if (status == "queued") return "unknown";
      if (status == "cancelled") return "failed";
      if (status == "running") return "running";
      if (status == "stopping") return "failed";
      if (status == "stopped") return "failed";
      if (status == "success") return "success";
      if (status == "failed") return "failed";
      return "unknown";
    },
    taskClass(task) {
      if (task.status == "success") return "success";
      if (task.status == "failed") return "failed";
      if (task.status == "stopped") return "failed";
      if (task.status == "running") return "running";
      return "unknown";
    },
    async stopRun(runid) {
      this.resetErrors();

      let { error } = await stopRun(runid);
      if (error) {
        this.stopRunError = error;
        return;
      }

      this.run.stopping = true;
    },
    async cancelRun(runid) {
      this.resetErrors();

      let { error } = await cancelRun(runid);
      if (error) {
        this.cancelRunError = error;
        return;
      }

      this.run.phase = "cancelled";
    },
    async restartRun(runid, fromStart) {
      this.dropdownActive = false;
      let { data, error } = await restartRun(runid, fromStart);
      if (error) {
        this.restartRunError = error;
        return;
      }

      let runLink;
      if (this.projectref) {
        runLink = projectRunLink(
          this.ownertype,
          this.ownername,
          this.projectref,
          data.id
        );
      } else {
        runLink = userLocalRunLink(this.ownername, data.id);
      }
      this.$router.push(runLink);
    }
  }
};
</script>

<style scoped lang="scss">
</style>
