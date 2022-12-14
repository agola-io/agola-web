<template>
  <div>
    <div
      v-if="fetchRunError || fetchTaskError"
      class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <div>Error fetching Run: {{ fetchRunError }}</div>
      <div>Error fetching Task: {{ fetchTaskError }}</div>
    </div>
    <div
      v-if="approveTaskError"
      class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <div>Error approving Task: {{ approveTaskError }}</div>
    </div>
    <rundetail
      v-if="run"
      :rungrouptype="rungrouptype"
      :rungroupref="rungroupref"
      :run="run"
      :ownertype="ownertype"
      :ownername="ownername"
      :projectref="projectref"
    />
    <div v-if="task">
      <div class="mt-8 mb-4 flex justify-between items-center">
        <div class="flex items-center">
          <span class="text-2xl mr-3">{{ task.name }}</span>

          <span
            class="mr-3 rounded px-2 py-1 text-xs"
            :class="taskClass(task)"
            >{{ capitalize(task.status) }}</span
          >
        </div>
        <button
          v-if="task.waitingApproval"
          class="btn btn-blue"
          @click="
            () => {
              run && task && approveTask(run.number, task.id);
            }
          "
        >
          Approve
        </button>
      </div>
      <step
        v-if="task.setupStep"
        v-bind:rungrouptype="rungrouptype"
        v-bind:rungroupref="rungroupref"
        v-bind:runnumber="runnumber"
        v-bind:taskid="taskid"
        v-bind:setup="true"
        v-bind:step="task.setupStep"
      />
      <div v-for="(step, index) in task.steps" v-bind:key="index">
        <step
          v-bind:rungrouptype="rungrouptype"
          v-bind:rungroupref="rungroupref"
          v-bind:runnumber="runnumber"
          v-bind:taskid="taskid"
          v-bind:stepnum="index"
          v-bind:step="step"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useAsyncState } from '@vueuse/core';
import { useTimeoutFn } from '@vueuse/shared';
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
import { ApiError, errorToString, RunTaskResponse, useAPI } from '../app/api';
import rundetail from '../components/rundetail.vue';
import step from '../components/step.vue';

export default defineComponent({
  components: {
    step,
    rundetail,
  },
  name: 'tasksummary',
  props: {
    ownertype: { type: String, required: true },
    ownername: { type: String, required: true },
    projectref: Array as PropType<Array<string>>,
    runnumber: { type: Number, required: true },
    taskid: { type: String, required: true },
  },
  setup(props) {
    const { ownertype, ownername, projectref, runnumber, taskid } =
      toRefs(props);

    const api = useAPI();

    let fetchAbort = new AbortController();

    const fetchRunError: Ref<unknown | undefined> = ref();
    const fetchTaskError: Ref<unknown | undefined> = ref();
    const approveTaskError: Ref<unknown | undefined> = ref();

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
          await Promise.all([refreshRun(), refreshTask()]);
          startRefreshTimeout();
        },
        2000,
        { immediate: false }
      );

    const update = async () => {
      stopRefreshTimeout();

      await Promise.all([refreshRun(), refreshTask()]);
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

    const taskClass = (task: RunTaskResponse) => {
      if (task.status == 'success') return 'is-success';
      if (task.status == 'failed') return 'is-failed';
      if (task.status == 'stopped') return 'is-failed';
      if (task.status == 'running') return 'is-running';
      if (task.status == 'skipped') return 'is-skipped';
      return 'unknown';
    };

    const getRun = async () => {
      try {
        return await api.getRun(
          rungrouptype.value,
          rungroupref.value,
          runnumber.value,
          fetchAbort.signal
        );
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        fetchRunError.value = e;
      }
    };

    const {
      state: run,
      // isReady: fetchedRun,
      execute: refreshRun,
    } = useAsyncState(
      async () => {
        return await getRun();
      },
      undefined,
      { immediate: false, resetOnExecute: false }
    );

    const getTask = async () => {
      try {
        return await api.getTask(
          rungrouptype.value,
          rungroupref.value,
          runnumber.value,
          taskid.value,
          fetchAbort.signal
        );
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        fetchTaskError.value = e;
      }
    };

    const {
      state: task,
      // isReady: fetchedTask,
      execute: refreshTask,
    } = useAsyncState(
      async () => {
        return await getTask();
      },
      undefined,
      { immediate: false, resetOnExecute: false }
    );

    const capitalize = (s: string) => {
      return s.charAt(0).toUpperCase() + s.slice(1);
    };

    const approveTask = async (runnumber: number, taskid: string) => {
      approveTaskError.value = undefined;

      try {
        await api.approveTask(
          rungrouptype.value,
          rungroupref.value,
          runnumber,
          taskid
        );
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        approveTaskError.value = e;
      }
    };

    watch(
      props,
      () => {
        update();
      },
      { immediate: true }
    );

    return {
      fetchRunError: computed(() => errorToString(fetchRunError.value)),
      fetchTaskError: computed(() => errorToString(fetchTaskError.value)),
      approveTaskError: computed(() => errorToString(approveTaskError.value)),
      run,
      task,
      rungrouptype,
      rungroupref,
      taskClass,
      capitalize,

      approveTask,
    };
  },
});
</script>
