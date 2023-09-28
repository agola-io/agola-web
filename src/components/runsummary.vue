<template>
  <div>
    <div
      v-if="fetchRunError"
      class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <div>{{ fetchRunError }}</div>
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
    <div v-if="run">
      <div v-if="run.phase != 'setuperror'">
        <div class="flex items-center my-6 justify-between">
          <span class="ml-4 text-xl font-bold">Tasks</span>

          <div class="flex">
            <button
              @click="tasksDisplay = 'graph'"
              class="relative flex items-center focus:outline-none bg-blue-500 hover:bg-blue-600 text-white font-semibold hover:text-white py-2 px-4 border border-blue-700 rounded rounded-r-none"
              :class="{ 'bg-blue-600': tasksDisplay == 'graph' }"
              title="Tasks Graph"
            >
              <i class="mr-1 mdi mdi-file-tree" />
            </button>
            <button
              @click="tasksDisplay = 'list'"
              class="relative flex items-center focus:outline-none bg-blue-500 hover:bg-blue-600 text-white font-semibold hover:text-white py-2 px-4 border border-l-0 border-blue-700 rounded rounded-l-none"
              title="Tasks List"
              :class="{ 'bg-blue-600': tasksDisplay == 'list' }"
            >
              <i class="mr-1 mdi mdi-format-list-bulleted-square" />
            </button>
          </div>
        </div>
        <tasks v-if="tasksDisplay == 'list'" :tasks="run.tasks" />
        <tasksgraph v-if="tasksDisplay == 'graph'" :tasks="run.tasks" />
      </div>
      <div v-else>
        <h2 class="my-4 text-2xl">Setup Errors</h2>
        <div class="p-3 rounded bg-gray-800 text-white">
          <pre
            class="font-mono leading-snug text-xs"
            v-for="(error, i) in run.setupErrors"
            :key="i"
            >{{ error }}</pre
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useAsyncState, useTimeoutFn } from '@vueuse/core';
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
import { RouteLocationRaw } from 'vue-router';
import {
  ApiError,
  errorToString,
  RunResponse,
  RunResponseTask,
  useAPI,
} from '../app/api';
import rundetail from '../components/rundetail.vue';
import tasks from '../components/tasks.vue';
import tasksgraph from '../components/tasksgraph.vue';
import { projectRunTaskLink, userDirectRunTaskLink } from '../util/link';

export class Task extends RunResponseTask {
  link: RouteLocationRaw = '';
  parents: string[] = [];
  waitingApproval = false;
  duration = '';
  row = -1;
}

export class Run extends RunResponse {
  tasks: Record<string, Task> = {};
}

export default defineComponent({
  name: 'runsummary',
  components: { rundetail, tasks, tasksgraph },
  props: {
    ownertype: { type: String, required: true },
    ownername: { type: String, required: true },
    projectref: Array as PropType<Array<string>>,
    runnumber: { type: Number, required: true },
  },
  setup(props) {
    const { ownertype, ownername, projectref, runnumber } = toRefs(props);

    const api = useAPI();

    let fetchAbort = new AbortController();

    const fetchRunError: Ref<unknown | undefined> = ref();
    const tasksDisplay = ref('graph');

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
          await refreshRun();
          startRefreshTimeout();
        },
        2000,
        { immediate: false }
      );

    const update = () => {
      stopRefreshTimeout();
      abortFetch();

      refreshRun();
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

    const runTaskLink = (task: RunResponseTask) => {
      if (projectref.value) {
        return projectRunTaskLink(
          ownertype.value,
          ownername.value,
          projectref.value,
          runnumber.value,
          task.id
        );
      } else {
        return userDirectRunTaskLink(ownername.value, runnumber.value, task.id);
      }
    };

    const parents = (run: RunResponse, task: RunResponseTask) => {
      return Object.keys(task.depends).map((key) => {
        return run.tasks[key].name;
      });
    };

    const getRun = async () => {
      try {
        const run = await api.getRun(
          rungrouptype.value,
          rungroupref.value,
          runnumber.value,
          fetchAbort.signal
        );

        const erun: Run = new Run();
        Object.assign(erun, run);

        // let tasks = erun.tasks;

        // add additional properties to every task
        for (const [taskID, task] of Object.entries(run.tasks)) {
          const etask: Task = new Task();
          Object.assign(etask, task);
          etask.link = runTaskLink(task);
          etask.parents = parents(run, task);
          etask.waitingApproval = run.tasksWaitingApproval.includes(taskID);
          erun.tasks[taskID] = etask;
        }

        fetchRunError.value = undefined;

        return erun;
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

    watch(
      props,
      () => {
        run.value = undefined;
        update();
      },
      { immediate: true }
    );

    return {
      fetchRunError: computed(() => errorToString(fetchRunError.value)),
      run,
      rungrouptype,
      rungroupref,
      tasksDisplay,
    };
  },
});
</script>
