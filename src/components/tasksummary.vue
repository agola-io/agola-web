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
    <rundetail
      :run="run"
      :ownertype="ownertype"
      :ownername="ownername"
      :projectref="projectref"
    />
    <div v-if="task != null">
      <div class="mt-8 mb-4 flex justify-between items-center">
        <div class="flex items-center">
          <span class="text-2xl mr-3">{{ task.name }}</span>

          <span
            class="mr-3 rounded px-2 py-1 text-xs"
            :class="taskClass(task)"
            >{{ task.status | capitalize }}</span
          >
        </div>
        <button
          v-if="task.waiting_approval"
          class="btn btn-blue"
          @click="approveTask(run.id, task.id)"
        >
          Approve
        </button>
      </div>
      <step
        v-bind:runid="runid"
        v-bind:taskid="taskid"
        v-bind:setup="true"
        v-bind:step="task.setup_step"
      />
      <div v-for="(step, index) in task.steps" v-bind:key="index">
        <step
          v-bind:runid="runid"
          v-bind:taskid="taskid"
          v-bind:stepnum="index"
          v-bind:step="step"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { fetchRun, fetchTask, approveTask } from '@/util/data.js';

import step from '@/components/step.vue';
import rundetail from '@/components/rundetail.vue';

export default {
  components: {
    step,
    rundetail,
  },
  name: 'tasksummary',
  props: {
    ownertype: String,
    ownername: String,
    projectref: Array,
    runid: String,
    taskid: String,
  },
  data() {
    return {
      fetchAbort: null,

      fetchRunError: null,
      fetchTaskError: null,

      run: null,
      task: null,
    };
  },
  watch: {
    $route: async function () {
      if (this.fetchAbort) {
        this.fetchAbort.abort();
      }
      clearTimeout(this.fetchRunSchedule);
      clearTimeout(this.fetchTaskSchedule);

      this.fetchAbort = new AbortController();

      this.fetchRun();
      this.fetchTask();
    },
  },
  methods: {
    taskClass(task) {
      if (task.status == 'success') return 'is-success';
      if (task.status == 'failed') return 'is-failed';
      if (task.status == 'stopped') return 'is-failed';
      if (task.status == 'running') return 'is-running';
      if (task.status == 'skipped') return 'is-skipped';
      return 'unknown';
    },
    async fetchRun() {
      let { data, error, aborted } = await fetchRun(
        this.runid,
        this.fetchAbort.signal
      );
      if (aborted) {
        return;
      }
      if (error) {
        this.fetchRunError = error;
        this.scheduleFetchRun();
        return;
      }
      this.fetchRunError = error;
      this.run = data;
      this.scheduleFetchRun();
    },
    async fetchTask() {
      let { data, error, aborted } = await fetchTask(
        this.runid,
        this.taskid,
        this.fetchAbort.signal
      );
      if (aborted) {
        return;
      }
      if (error) {
        this.fetchTaskError = error;
        this.scheduleFetchTask();
        return;
      }
      this.fetchTaskError = error;
      this.task = data;
      this.scheduleFetchTask();
    },
    scheduleFetchRun() {
      clearTimeout(this.fetchRunSchedule);
      this.fetchRunSchedule = setTimeout(() => {
        this.fetchRun();
      }, 2000);
    },
    scheduleFetchTask() {
      clearTimeout(this.fetchTaskSchedule);
      this.fetchTaskSchedule = setTimeout(() => {
        this.fetchTask();
      }, 2000);
    },
    approveTask: approveTask,
  },
  created: function () {
    this.fetchAbort = new AbortController();

    this.fetchRun();
    this.fetchTask();
  },
  beforeDestroy() {
    if (this.fetchAbort) {
      this.fetchAbort.abort();
    }
    clearTimeout(this.fetchRunSchedule);
    clearTimeout(this.fetchTaskSchedule);
  },
};
</script>

<style scoped lang="scss"></style>
