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
        <div class="p-4 border border-l-0 rounded-r flex">
          <div class="w-4/6 items-start justify-between">
            <div class="flex items-center mb-1">
              <h2 class="text-2xl mr-3">{{ run.name }}</h2>
              <span
                class="mr-3 rounded px-2 py-1 text-xs"
                :class="'is-' + runResultClass(run)"
                >{{ runStatus(run) | capitalize }}</span
              >
              <span
                v-if="stillRunning(run)"
                class="rounded bg-gray-500 text-white px-2 py-1 text-xs"
                >Still running</span
              >
            </div>
            <div class="mb-6">
              {{ run.annotations.message.split(/\r?\n/)[0] }}
            </div>
            <div>
              <a
                :href="run.annotations.commit_link"
                class="block"
                target="_blank"
              >
                <i class="mdi mdi-source-commit mdi-rotate-90"></i>
                <span>{{ run.annotations.commit_sha.substring(0, 8) }}</span>
              </a>
              <a
                v-if="run.annotations.ref_type == 'branch'"
                :href="run.annotations.branch_link"
                class="block"
                target="_blank"
              >
                <i class="mdi mdi-source-branch"></i>
                <span>{{ run.annotations.branch }}</span>
              </a>
              <a
                v-else-if="run.annotations.ref_type == 'tag'"
                :href="run.annotations.tag_link"
                class="block"
                target="_blank"
              >
                <i class="mdi mdi-tag"></i>
                <span>{{ run.annotations.tag }}</span>
              </a>
              <a
                v-else-if="run.annotations.ref_type == 'pull_request'"
                :href="run.annotations.pull_request_link"
                class="block"
                target="_blank"
              >
                <i class="mdi mdi-source-pull"></i>
                <span>PR #{{ run.annotations.pull_request_id }}</span>
              </a>
            </div>
          </div>
          <div class="w-1/6">
            <div>
              <i class="mdi mdi-clock-fast mr-1"></i>
              <span class="text-right">{{ duration(run) }}</span>
            </div>
            <div :title="endTime(run)">
              <i class="mdi mdi-calendar-month-outline mr-1"></i>
              <span class="text-right">{{ endTimeHuman(run) }}</span>
            </div>
          </div>
          <div class="w-1/6 flex items-start justify-between">
            <div class="relative ml-auto mr-3">
              <div
                v-if="
                  run.can_restart_from_scratch ||
                  run.can_restart_from_failed_tasks
                "
                class="flex"
                v-click-outside="() => (dropdownActive = false)"
              >
                <div class="flex items-center">
                  <button
                    class="btn btn-blue"
                    @click="dropdownActive = !dropdownActive"
                  >
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
                      class="block px-4 py-2 hover:bg-blue-500 hover:text-white cursor-pointer"
                      @click="restartRun(run.number, true)"
                      >From start</a
                    >
                  </li>
                  <li>
                    <a
                      v-if="run.can_restart_from_failed_tasks"
                      class="block px-4 py-2 hover:bg-blue-500 hover:text-white cursor-pointer"
                      @click="restartRun(run.number)"
                      >From failed tasks</a
                    >
                  </li>
                </ul>
              </div>
              <button
                class="btn btn-red"
                v-if="run.phase == 'queued'"
                @click="cancelRun(run.number)"
              >
                Cancel
              </button>
              <button
                class="btn btn-red"
                v-if="run.phase == 'running'"
                :disabled="run.stopping"
                @click="stopRun(run.number)"
              >
                Stop
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as vClickOutside from 'v-click-outside-x';

import { cancelRun, stopRun, restartRun } from '@/util/data.js';
import { userDirectRunLink, projectRunLink } from '@/util/link.js';
import { runStatus, runResultClass } from '@/util/run.js';

import * as moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';

momentDurationFormatSetup(moment);

export default {
  name: 'rundetail',
  directives: {
    clickOutside: vClickOutside.directive,
  },
  props: {
    rungrouptype: String,
    rungroupref: String,
    ownertype: String,
    ownername: String,
    projectref: Array,
    run: Object,
  },
  data() {
    return {
      now: moment(),
      stopRunError: null,
      cancelRunError: null,
      restartRunError: null,
      dropdownActive: false,
    };
  },
  methods: {
    runStatus: runStatus,
    runResultClass: runResultClass,
    resetErrors() {
      this.stopRunError = null;
      this.cancelRunError = null;
      this.restartRunError = null;
    },
    stillRunning(run) {
      return run.result != 'unknown' && run.phase == 'running';
    },
    taskClass(task) {
      if (task.status == 'success') return 'success';
      if (task.status == 'failed') return 'failed';
      if (task.status == 'stopped') return 'failed';
      if (task.status == 'running') return 'running';
      return 'unknown';
    },
    async stopRun(runnumber) {
      this.resetErrors();

      let { error } = await stopRun(
        this.rungrouptype,
        this.rungroupref,
        runnumber
      );
      if (error) {
        this.stopRunError = error;
        return;
      }

      this.run.stopping = true;
    },
    async cancelRun(runnumber) {
      this.resetErrors();

      let { error } = await cancelRun(
        this.rungrouptype,
        this.rungroupref,
        runnumber
      );
      if (error) {
        this.cancelRunError = error;
        return;
      }

      this.run.phase = 'cancelled';
    },
    async restartRun(runnumber, fromStart) {
      this.dropdownActive = false;
      let { data, error } = await restartRun(
        this.rungrouptype,
        this.rungroupref,
        runnumber,
        fromStart
      );
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
          data.number
        );
      } else {
        runLink = userDirectRunLink(this.ownername, data.number);
      }
      this.$router.push(runLink);
    },
    duration(run) {
      let formatString = 'h:mm:ss[s]';
      let start = moment(run.start_time);
      let end = moment(run.end_time);

      if (run.start_time === null) {
        return moment.duration(0).format(formatString);
      }
      if (run.end_time === null) {
        return moment.duration(this.now.diff(start)).format(formatString);
      }
      return moment.duration(end.diff(start)).format(formatString);
    },
    endTime(run) {
      let formatString = 'lll';
      let end = moment(run.end_time);

      if (run.end_time === null) {
        return '';
      }
      return 'Finished ' + end.format(formatString);
    },
    endTimeHuman(run) {
      let end = moment(run.end_time);

      if (run.end_time === null) {
        return '';
      }
      return end.fromNow();
    },
  },
  created: function () {
    window.setInterval(() => {
      this.now = moment();
    }, 500);
  },
};
</script>

<style scoped lang="scss"></style>
