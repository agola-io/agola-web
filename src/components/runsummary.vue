<template>
  <div>
    <div
      v-if="fetchRunError"
      class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <div>{{ fetchRunError }}</div>
    </div>
    <rundetail :run="run" :ownertype="ownertype" :ownername="ownername" :projectref="projectref"/>
    <div v-if="run">
      <div v-if="run.phase != 'setuperror'">
        <div class="m-4 text-xl font-bold">Tasks</div>

        <ul v-if="run">
          <li v-for="task in run.sortedTasks" v-bind:key="task.id">
            <task
              v-bind:task="task"
              v-bind:link="runTaskLink(task)"
              v-bind:waiting-approval="run.tasks_waiting_approval.includes(task.id)"
              v-bind:parents="parents(task)"
            />
          </li>
        </ul>
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
import task from "@/components/task.vue";

export default {
  name: "runsummary",
  components: { rundetail, task },
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
      polling: null
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

      // sort tasks by level
      let tasks = this.run.tasks;
      let sortedTasks = Object.keys(this.run.tasks)
        .sort((a, b) =>
          tasks[a].level > tasks[b].level
            ? 1
            : tasks[b].level > tasks[a].level
            ? -1
            : 0
        )
        .map(k => this.run.tasks[k]);
      this.run.sortedTasks = sortedTasks;
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