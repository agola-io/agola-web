<template>
  <div>
    <div
      v-if="fetchRunsError"
      class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <div>{{ fetchRunsError }}</div>
    </div>

    <div v-if="runs">
      <ul>
        <li
          class="mb-2 border-l-5 rounded-l"
          v-for="run in runs"
          :key="run.number"
          :class="runResultClass(run)"
        >
          <div class="pl-4 flex items-center border border-l-0 rounded-r">
            <!-- TODO(sgotti) add gradient overflow -->
            <div v-if="projectref" class="w-2/12">
              <div
                v-if="run.annotations.ref_type == 'branch'"
                class="whitespace-nowrap overflow-x-hidden"
              >
                <i class="mdi mdi-source-branch mr-1"></i>
                <span>{{ run.annotations.branch }}</span>
              </div>
              <div
                v-else-if="run.annotations.ref_type == 'tag'"
                class="whitespace-nowrap overflow-x-hidden"
              >
                <i class="mdi mdi-tag mr-1"></i>
                <span>{{ run.annotations.tag }}</span>
              </div>
              <div
                v-else-if="run.annotations.ref_type == 'pull_request'"
                class="whitespace-nowrap overflow-x-hidden"
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
              class="w-5/12 pl-3 mr-auto whitespace-nowrap overflow-hidden"
              :to="projectRunLink(ownertype, ownername, projectref, run.number)"
            >
              <span class="font-bold">{{ run.name }}</span>
              <div>{{ run.annotations.message.split(/\r?\n/)[0] }}</div>
            </router-link>
            <router-link
              v-else
              class="w-5/12 pl-3 mr-auto whitespace-nowrap overflow-hidden"
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
              <span data-test="runNumber">#{{ run.number }}</span>
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

      <delay v-if="loadingRuns" :timeout="500">
        <div class="mt-4 ml-6 flex w-48">
          <div :class="{ spinner: loadingRuns }"></div>
        </div>
      </delay>

      <div class="flex justify-center my-3">
        <button
          v-if="hasMoreRuns"
          class="bg-transparent text-blue-700 font-semibold hover:(bg-blue-500 text-white border-transparent) py-2 px-4 border border-blue-500 disabled:(bg-blue-500 opacity-50 cursor-not-allowed) rounded"
          @click="loadMoreRuns()"
          data-test="loadMoreRunsButton"
        >
          Load more...
        </button>
      </div>
    </div>
    <div v-if="runs && runs.length == 0" class>No runs</div>
  </div>
</template>

<script lang="ts">
import { useNow, useTimeoutFn } from '@vueuse/core';
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

const RUNS_INCREMENT_VALUE = 25;

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

    const wantedRunsNumber = ref(RUNS_INCREMENT_VALUE);
    const hasMoreRuns = ref(false);
    const now = useNow();
    const fetchRunsError: Ref<unknown | undefined> = ref();

    const loadMoreDisabled = ref(false);
    const loadingRuns = ref(false);
    const runs: Ref<RunResponse[] | undefined> = ref();

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
      wantedRunsNumber.value += RUNS_INCREMENT_VALUE;
      loadMoreDisabled.value = true;

      abortFetch();

      await refreshRuns();
    };

    // TODO(sgotti) use run events instead of refetching all runs everytime
    const fetchRuns = async () => {
      loadingRuns.value = true;

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

      const newRuns: RunResponse[] = [];
      let stopFetch = false;
      let runCount = 0;

      let runsCursor: string | undefined;
      try {
        while (!stopFetch) {
          let res: RunResponse[];
          let cursor: string | undefined;
          if (runsCursor) {
            ({ res, cursor } = await api.getRuns(
              rungrouptype.value,
              rungroupref.value,
              runsCursor
            ));
          } else {
            ({ res, cursor } = await api.getRuns(
              rungrouptype.value,
              rungroupref.value,
              undefined,
              subgroup,
              undefined,
              fetchAbort.signal
            ));
          }

          runsCursor = cursor;
          hasMoreRuns.value = !!cursor;

          runCount += res.length;
          if (runCount >= wantedRunsNumber.value || !cursor) {
            stopFetch = true;
          }

          newRuns.push(...res);
          if (newRuns.length > wantedRunsNumber.value) {
            wantedRunsNumber.value = newRuns.length;
          }
        }

        runs.value = newRuns;
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        fetchRunsError.value = e;
        return;
      } finally {
        loadingRuns.value = false;
        loadMoreDisabled.value = false;
      }

      fetchRunsError.value = undefined;
    };

    const refreshRuns = async () => {
      abortFetch();

      await fetchRuns();
    };

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
      loadingRuns,
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

      loadMoreRuns,
    };
  },
});
</script>
