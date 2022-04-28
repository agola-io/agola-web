<template>
  <div>
    <div
      v-if="fetchRunsError"
      class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <div>{{ fetchRunsError }}</div>
    </div>

    <div class="ml-6 flex w-48">
      <div v-bind:class="{ spinner: fetchRunsLoading }"></div>
    </div>
    <div v-if="runs">
      <ul>
        <li
          class="mb-2 border-l-5 rounded-l"
          v-for="run in runs"
          v-bind:key="run.number"
          :class="runResultClass(run)"
        >
          <div class="pl-4 flex items-center border border-l-0 rounded-r">
            <!-- TODO(sgotti) add gradient overflow -->
            <div v-if="projectref" class="w-2/12">
              <div
                v-if="run.annotations.ref_type == 'branch'"
                class="whitespace-no-wrap overflow-x-hidden"
              >
                <i class="mdi mdi-source-branch mr-1"></i>
                <span>{{ run.annotations.branch }}</span>
              </div>
              <div
                v-else-if="run.annotations.ref_type == 'tag'"
                class="whitespace-no-wrap overflow-x-hidden"
              >
                <i class="mdi mdi-tag mr-1"></i>
                <span>{{ run.annotations.tag }}</span>
              </div>
              <div
                v-else-if="run.annotations.ref_type == 'pull_request'"
                class="whitespace-no-wrap overflow-x-hidden"
              >
                <i class="mdi mdi-source-pull mr-1"></i>
                <span>PR #{{ run.annotations.pull_request_id }}</span>
              </div>
            </div>
            <div v-else class="w-2/12">
              <i class="mdi mdi-run-fast mr-1"></i>
              <span>direct run</span>
            </div>
            <router-link
              v-if="projectref"
              class="w-5/12 pl-3 mr-auto whitespace-no-wrap overflow-hidden"
              :to="projectRunLink(ownertype, ownername, projectref, run.number)"
            >
              <span class="font-bold">{{ run.name }}</span>
              <div>{{ run.annotations.message.split(/\r?\n/)[0] }}</div>
            </router-link>
            <router-link
              v-else
              class="w-5/12 pl-3 mr-auto whitespace-no-wrap overflow-hidden"
              :to="userDirectRunLink(ownername, run.number)"
            >
              <span class="font-bold">{{ run.name }}</span>
              <div>{{ run.annotations.message.split(/\r?\n/)[0] }}</div>
            </router-link>
            <span
              v-if="waitingApproval(run)"
              class="w-2/12 bg-gray-200 rounded-full px-3 py-1 text-sm text-center font-semibold mr-2"
              >Waiting Approval</span
            >
            <span
              v-if="stillRunning(run)"
              class="w-2/12 bg-gray-200 rounded-full px-3 py-1 text-sm text-center font-semibold mr-2"
              >Still running</span
            >
            <div class="w-32">
              <span>#{{ run.number }}</span>
              <a
                :href="run.annotations.commit_link"
                class="block"
                target="_blank"
              >
                <i class="mdi mdi-source-commit mdi-rotate-90 mr-1"></i>
                <span>{{ run.annotations.commit_sha.substring(0, 8) }}</span>
              </a>
            </div>
            <div class="w-32">
              <div>
                <i class="mdi mdi-clock-fast mr-1"></i>
                <span class="text-right">{{ duration(run) }}</span>
              </div>
              <div :title="endTime(run)">
                <i class="mdi mdi-calendar-month-outline mr-1"></i>
                <span class="text-right">{{ endTimeHuman(run) }}</span>
              </div>
            </div>
          </div>
        </li>
      </ul>
      <div class="flex justify-center my-3">
        <button
          v-if="hasMoreRuns"
          class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
          @click="loadMoreRuns()"
        >
          Load more...
        </button>
      </div>
    </div>
    <div v-if="runs && runs.length == 0" class>No runs</div>
  </div>
</template>

<script>
import { fetchUser, fetchProject, fetchRuns } from '../util/data';
import { userDirectRunLink, projectRunLink } from '../util/link';
import { runResultClass } from '../util/run';
import * as moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';

momentDurationFormatSetup(moment);

export default {
  components: {},
  name: 'runs',
  props: {
    ownertype: String,
    ownername: String,
    projectref: Array,
    query: String,
  },
  data() {
    return {
      now: moment(),

      fetchAbort: null,

      fetchRunsLoading: false,
      fetchRunsLoadingTimeout: false,
      fetchRunsError: null,
      fetchRunsSchedule: null,

      runs: null,
      wantedRunsNumber: 25,
      hasMoreRuns: false,
      project: null,
      user: null,
    };
  },
  computed: {
    rungrouptype() {
      if (this.projectref !== undefined) {
        return 'projects';
      }
      return 'users';
    },
    rungroupref() {
      if (this.projectref !== undefined) {
        return [this.ownertype, this.ownername, ...this.projectref].join('/');
      }
      return this.ownername;
    },
  },
  watch: {
    $route: function () {
      this.runs = null;
      this.hasMoreRuns = false;
      this.update();
    },
  },
  methods: {
    projectRunLink: projectRunLink,
    userDirectRunLink: userDirectRunLink,
    runResultClass: runResultClass,
    startFetchRunsLoading() {
      this.fetchRunsLoadingTimeout = setTimeout(() => {
        this.fetchRunsLoading = true;
      }, 0);
    },
    stopFetchRunsLoading() {
      clearTimeout(this.fetchRunsLoadingTimeout);
      this.fetchRunsLoading = false;
    },
    stillRunning(run) {
      return run.result != 'unknown' && run.phase == 'running';
    },
    waitingApproval(run) {
      return run.tasks_waiting_approval.length > 0;
    },
    update() {
      if (this.fetchAbort) {
        this.fetchAbort.abort();
      }
      clearTimeout(this.fetchRunsSchedule);
      if (this.projectref !== undefined) {
        this.fetchProject();
      } else {
        this.fetchUser();
      }
    },
    async fetchProject() {
      this.fetchAbort = new AbortController();

      let projectref = [
        this.ownertype,
        this.ownername,
        ...this.projectref,
      ].join('/');

      let { data, error, aborted } = await fetchProject(
        projectref,
        this.fetchAbort.signal
      );
      if (aborted) {
        return;
      }
      if (error) {
        this.$store.dispatch('setError', error);
        return;
      }
      this.project = data;

      this.fetchRuns(true);
    },
    async fetchUser() {
      this.fetchAbort = new AbortController();

      let { data, error, aborted } = await fetchUser(
        this.ownername,
        this.fetchAbort.signal
      );
      if (aborted) {
        return;
      }
      if (error) {
        this.$store.dispatch('setError', error);
        return;
      }
      this.user = data;

      this.fetchRuns(true);
    },
    loadMoreRuns() {
      this.wantedRunsNumber += 25;
      this.fetchRuns();
    },
    // TODO(sgotti) use run events instead of refetching all runs everytime
    async fetchRuns(loading) {
      let subgroup = '';
      if (this.projectref) {
        if (this.query == 'branches') {
          subgroup = 'branch';
        } else if (this.query == 'tags') {
          subgroup = 'tag';
        } else if (this.query == 'pullrequests') {
          subgroup = 'pr';
        }
      }

      let newRuns = [];
      let hasMoreRuns = false;
      let stopFetch = false;
      let runCount = 0;
      let startRunNumber = null;

      if (loading) this.startFetchRunsLoading();
      while (!stopFetch) {
        let { data, error, aborted } = await fetchRuns(
          this.rungrouptype,
          this.rungroupref,
          subgroup,
          startRunNumber,
          this.fetchAbort.signal
        );
        if (aborted) {
          return;
        }
        if (error) {
          this.stopFetchRunsLoading();
          this.fetchRunsError = error;

          this.scheduleFetchRuns();
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
          startRunNumber = newRuns[newRuns.length - 1].number;
        }
      }
      this.stopFetchRunsLoading();
      this.runs = newRuns;
      this.hasMoreRuns = hasMoreRuns;

      this.scheduleFetchRuns();
    },
    scheduleFetchRuns() {
      clearTimeout(this.fetchRunsSchedule);
      this.fetchRunsSchedule = setTimeout(() => {
        this.fetchRuns();
      }, 2000);
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

    this.update();
  },
  beforeUnmount() {
    if (this.fetchAbort) {
      this.fetchAbort.abort();
    }
    clearTimeout(this.fetchRunsSchedule);
  },
};
</script>

<style scoped lang="scss"></style>
