<template>
  <div>
    <RunDetail :run="run" :ownertype="ownertype" :ownername="ownername" :projectref="projectref"/>
    <div v-if="run">
      <div v-if="run.phase != 'setuperror'">
        <div class="m-4 text-xl font-bold">Tasks</div>

        <ul v-if="run">
          <li
            class="mb-2 border-l-5 rounded-l"
            v-for="task in run.sortedTasks"
            v-bind:key="task.id"
            :class="taskClass(task)"
          >
            <div class="pl-4 py-4 flex justify-between items-center border border-l-0 rounded-r">
              <router-link class="w-1/3 font-bold" tag="a" :to="runTaskLink(task)">
                <span class="w-1/3 font-bold">{{task.name}}</span>
              </router-link>
              <div class="column">
                <span
                  class="tag"
                  v-if="run.tasks_waiting_approval.includes(task.id)"
                >Waiting approval</span>
              </div>
              <div class="w-40">
                <span class="block" v-if="parents(task).length > 0">depends on: &nbsp;</span>
                <span
                  class="font-thin text-gray-600"
                  v-for="dep in parents(task)"
                  v-bind:key="dep"
                >{{dep}}</span>
              </div>
              <!--               <span
                class="duration"
                v-if="duration && (step.Phase == 'success' || step.Phase == 'failed') "
              >{{duration}}</span>-->
            </div>
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
import { userLocalRunTaskLink, projectRunTaskLink } from "@/util/link.js";

import RunDetail from "@/components/rundetail.vue";

export default {
  name: "run",
  components: { RunDetail },
  props: {
    ownertype: String,
    ownername: String,
    projectref: Array,
    runid: String
  },
  data() {
    return {
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
        return userLocalRunTaskLink(this.ownername, this.runid, task.id);
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
        this.$store.dispatch("setError", error);
        return;
      }
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