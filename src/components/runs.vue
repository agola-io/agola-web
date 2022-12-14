<template>
  <div>
    <div
      v-if="fetchRunsError"
      class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <div>{{ fetchRunsError }}</div>
    </div>

    <div v-if="!fetchedRuns && runs?.length == 0" class="ml-6 flex w-48">
      <div v-bind:class="{ spinner: !fetchedRuns }"></div>
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

<script lang="ts">
import { useAsyncState, useNow, useTimeoutFn } from '@vueuse/core';
import {
  computed,
  defineComponent,
  onUnmounted,
  PropType,
  Ref,
  ref,
  toRefs,
  watch,
} from 'vue';
import { ApiError, errorToString, RunResponse, useAPI } from '../app/api';
import { projectRunLink, userDirectRunLink } from '../util/link';
import { runResultClass } from '../util/run';
import { endTime, endTimeHuman, formatDuration } from '../util/time';

export default defineComponent({
  components: {},
  name: 'runs',
  props: {
    ownertype: {
      type: String,
      required: true,
    },
    ownername: {
      type: String,
      required: true,
    },
    projectref: Array as PropType<Array<string>>,
    query: String,
  },
  setup(props) {
    const { ownertype, ownername, projectref, query } = toRefs(props);

    const api = useAPI();

    let fetchAbort = new AbortController();

    const wantedRunsNumber = ref(25);
    const hasMoreRuns = ref(false);
    const now = useNow();
    const fetchRunsError: Ref<unknown | undefined> = ref();

    onUnmounted(() => {
      fetchAbort.abort();
    });

    const abortFetch = () => {
      fetchAbort.abort();
      fetchAbort = new AbortController();
    };

    const { start: startRefreshTimeout, stop: stopRefreshTimeout } =
      useTimeoutFn(
        async () => {
          abortFetch();
          await refreshRuns();
          startRefreshTimeout();
        },
        2000,
        { immediate: false }
      );

    const update = async () => {
      stopRefreshTimeout();
      abortFetch();

      await refreshRuns();
      startRefreshTimeout();
    };

    const rungrouptype = computed(() => {
      if (projectref.value) {
        return 'projects';
      }
      return 'users';
    });

    const rungroupref = computed(() => {
      if (projectref.value) {
        return [ownertype.value, ownername.value, ...projectref.value].join(
          '/'
        );
      }

      return ownername.value;
    });

    const stillRunning = (run: RunResponse) => {
      return run.result != 'unknown' && run.phase == 'running';
    };

    const waitingApproval = (run: RunResponse) => {
      return run.tasksWaitingApproval.length > 0;
    };

    const loadMoreRuns = async () => {
      wantedRunsNumber.value += 25;
      abortFetch();

      await refreshRuns();
    };

    // TODO(sgotti) use run events instead of refetching all runs everytime
    const fetchRuns = async () => {
      let subgroup = '';
      if (projectref.value) {
        if (query.value == 'branches') {
          subgroup = 'branch';
        } else if (query.value == 'tags') {
          subgroup = 'tag';
        } else if (query.value == 'pullrequests') {
          subgroup = 'pr';
        }
      }

      let newRuns: RunResponse[] = [];
      let stopFetch = false;
      let runCount = 0;
      let startRunNumber = undefined;

      try {
        while (!stopFetch) {
          const fetchedRuns = await api.getRuns(
            rungrouptype.value,
            rungroupref.value,
            subgroup,
            startRunNumber,
            fetchAbort.signal
          );

          runCount += fetchedRuns.length;
          if (runCount >= wantedRunsNumber.value || fetchedRuns.length == 0) {
            hasMoreRuns.value = fetchedRuns.length != 0;
            stopFetch = true;
          }
          newRuns = newRuns.concat(fetchedRuns);
          if (newRuns.length) {
            startRunNumber = newRuns[newRuns.length - 1].number;
          }
        }
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        fetchRunsError.value = e;
        return;
      }

      fetchRunsError.value = undefined;
      return newRuns;
    };

    const {
      state: runs,
      isReady: fetchedRuns,
      execute: refreshRuns,
    } = useAsyncState(
      async () => {
        return await fetchRuns();
      },
      undefined,
      { immediate: false, resetOnExecute: false }
    );

    const duration = (run: RunResponse) => {
      return formatDuration(run, now.value);
    };

    watch(
      props,
      () => {
        hasMoreRuns.value = false;
        runs.value = undefined;
        update();
      },
      { immediate: true }
    );

    return {
      fetchRunsError: computed(() => errorToString(fetchRunsError.value)),
      runs,
      projectRunLink,
      userDirectRunLink,
      runResultClass,
      waitingApproval,
      stillRunning,
      hasMoreRuns,
      duration,
      endTime,
      endTimeHuman,
      fetchedRuns,

      loadMoreRuns,
    };
  },
});
</script>
