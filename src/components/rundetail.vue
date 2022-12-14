<template>
  <div>
    <div v-if="run">
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
                >{{ capitalize(runStatus(run)) }}</span
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
                  run.canRestartFromScratch || run.canRestartFromFailedTasks
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
                      v-if="run.canRestartFromScratch"
                      class="block px-4 py-2 hover:bg-blue-500 hover:text-white cursor-pointer"
                      @click="restartRun(run.number, true)"
                      >From start</a
                    >
                  </li>
                  <li>
                    <a
                      v-if="run.canRestartFromFailedTasks"
                      class="block px-4 py-2 hover:bg-blue-500 hover:text-white cursor-pointer"
                      @click="restartRun(run.number, false)"
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

<script lang="ts">
import { useNow } from '@vueuse/core';
import vClickOutside from 'click-outside-vue3';
import {
  computed,
  defineComponent,
  onUnmounted,
  PropType,
  Ref,
  ref,
  toRefs,
} from 'vue';
import { useRouter } from 'vue-router';
import {
  ApiError,
  errorToString,
  RunResponse,
  RunResponseTask,
  useAPI,
} from '../app/api';
import { projectRunLink, userDirectRunLink } from '../util/link';
import { runResultClass, runStatus } from '../util/run';
import { endTime, endTimeHuman, formatDuration } from '../util/time';

export default defineComponent({
  name: 'rundetail',
  directives: {
    clickOutside: vClickOutside.directive,
  },
  props: {
    rungrouptype: { type: String, required: true },
    rungroupref: { type: String, required: true },
    ownertype: { type: String, required: true },
    ownername: { type: String, required: true },
    projectref: Array as PropType<Array<string>>,
    run: {
      type: Object as PropType<RunResponse>,
      required: true,
    },
  },
  setup(props) {
    const { rungrouptype, rungroupref, ownertype, ownername, projectref } =
      toRefs(props);

    const api = useAPI();
    const router = useRouter();

    const fetchAbort: Ref<AbortController | undefined> = ref();

    const now = useNow();
    const dropdownActive = ref(false);
    const stopRunError: Ref<unknown | undefined> = ref();
    const cancelRunError: Ref<unknown | undefined> = ref();
    const restartRunError: Ref<unknown | undefined> = ref();

    onUnmounted(() => {
      fetchAbort.value?.abort();
    });

    const resetErrors = () => {
      stopRunError.value = undefined;
      cancelRunError.value = undefined;
      restartRunError.value = undefined;
    };

    const stillRunning = (run: RunResponse) => {
      return run.result != 'unknown' && run.phase == 'running';
    };

    const taskClass = (task: RunResponseTask) => {
      if (task.status == 'success') return 'success';
      if (task.status == 'failed') return 'failed';
      if (task.status == 'stopped') return 'failed';
      if (task.status == 'running') return 'running';
      return 'unknown';
    };

    const stopRun = async (runnumber: number) => {
      resetErrors();

      try {
        await api.stopRun(rungrouptype.value, rungroupref.value, runnumber);
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        stopRunError.value = e;
      }
    };

    const cancelRun = async (runnumber: number) => {
      resetErrors();

      try {
        await api.cancelRun(rungrouptype.value, rungroupref.value, runnumber);
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        cancelRunError.value = e;
      }
    };

    const restartRun = async (runnumber: number, fromStart: boolean) => {
      dropdownActive.value = false;
      try {
        const newRun = await api.restartRun(
          rungrouptype.value,
          rungroupref.value,
          runnumber,
          fromStart
        );

        let runLink;
        if (projectref.value) {
          runLink = projectRunLink(
            ownertype.value,
            ownername.value,
            projectref.value,
            newRun.number
          );
        } else {
          runLink = userDirectRunLink(ownername.value, newRun.number);
        }
        router.push(runLink);
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        restartRunError.value = e;
      }
    };

    const duration = (run: RunResponse) => {
      return formatDuration(run, now.value);
    };

    const capitalize = (s: string) => {
      return s.charAt(0).toUpperCase() + s.slice(1);
    };

    return {
      stopRunError: computed(() => errorToString(stopRunError.value)),
      cancelRunError: computed(() => errorToString(cancelRunError.value)),
      restartRunError: computed(() => errorToString(restartRunError.value)),
      dropdownActive,
      taskClass,
      stillRunning,
      duration,
      endTime,
      endTimeHuman,
      capitalize,

      runStatus,
      runResultClass,
      stopRun,
      cancelRun,
      restartRun,
    };
  },
});
</script>
