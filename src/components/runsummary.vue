<template>
  <div>
    <div
      v-if="fetchRunError"
      class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <div>{{ fetchRunError }}</div>
    </div>
    <rundetail :run="run" :ownertype="ownertype" :ownername="ownername" :projectref="projectref" />
    <div v-if="run">
      <div v-if="run.phase != 'setuperror'">
        <div class="flex items-center my-6 justify-between">
          <span class="ml-4 text-xl font-bold">Tasks</span>

          <div class="flex">
            <button
              @click="tasksDisplay = 'graph'"
              class="relative flex items-center focus:outline-none bg-blue-500 hover:bg-blue-600 text-white font-semibold hover:text-white py-2 px-4 border border-blue-700 rounded rounded-r-none"
              :class="{ 'bg-blue-600': tasksDisplay=='graph'}"
              title="Tasks Graph"
            >
              <i class="mr-1 mdi mdi-file-tree" />
            </button>
            <button
              @click="tasksDisplay = 'list'"
              class="relative flex items-center focus:outline-none bg-blue-500 hover:bg-blue-600 text-white font-semibold hover:text-white py-2 px-4 border border-l-0 border-blue-700 rounded rounded-l-none"
              title="Tasks List"
              :class="{ 'bg-blue-600': tasksDisplay=='list'}"
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
            v-for="(error, i) in run.setup_errors"
            v-bind:key="i"
          >{{error}}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchRun } from "@/util/data.js";
import { userDirectRunTaskLink, projectRunTaskLink } from "@/util/link.js";

import rundetail from "@/components/rundetail.vue";
import tasks from "@/components/tasks.vue";
import tasksgraph from "@/components/tasksgraph.vue";

export default {
  name: "runsummary",
  components: { rundetail, tasks, tasksgraph },
  props: {
    ownertype: String,
    ownername: String,
    projectref: Array,
    runid: String
  },
  data() {
    return {
      fetchRunError: null,
      run: null,
      polling: null,

      taskWidth: 200,
      taskHeight: 40,
      taskXSpace: 60,
      taskYSpace: 20,
      hoverTask: null,

      tasksDisplay: "graph"
    };
  },
  methods: {
    runTaskLink(task) {
      if (this.projectref) {
        return projectRunTaskLink(
          this.ownertype,
          this.ownername,
          this.projectref,
          this.runid,
          task.id
        );
      } else {
        return userDirectRunTaskLink(this.ownername, this.runid, task.id);
      }
    },
    parents(task) {
      return Object.keys(task.depends).map(key => {
        return this.run.tasks[task.depends[key].task_id].name;
      });
    },
    taskClass(task) {
      if (task.status == "success") return "success";
      if (task.status == "failed") return "failed";
      if (task.status == "stopped") return "failed";
      if (task.status == "running") return "running";
      return "unknown";
    },
    async fetchRun() {
      let { data, error } = await fetchRun(this.runid);
      if (error) {
        this.fetchRunError = error;
        return;
      }
      this.fetchRunError = null;
      this.run = data;

      let tasks = this.run.tasks;

      // add additional properties to every task
      for (let taskID in tasks) {
        let task = tasks[taskID];
        task.link = this.runTaskLink(task);
        task.parents = this.parents(task);
        task.waiting_approval = this.run.tasks_waiting_approval.includes(
          taskID
        );
      }
    },
    pollData() {
      this.polling = setInterval(() => {
        this.fetchRun();
      }, 2000);
    }
  },
  created: function() {
    this.fetchRun();
    this.pollData();
  },
  beforeDestroy() {
    clearInterval(this.polling);
  }
};
</script>

<style scoped lang="scss">
</style>