<template>
  <div>
    <RunDetail :run="run"/>
    <div v-if="run">
      <div v-if="run.phase != 'setuperror'">
        <div class="tabs">
          <ul>
            <li>
              <a>Tasks</a>
            </li>
          </ul>
        </div>

        <div v-if="run" class="tasks-list">
          <div v-for="task in run.sortedTasks" v-bind:key="task.id" :class="taskClass(task)">
            <div class="task-content">
              <div class="columns">
                <router-link class="column is-10" tag="a" :to="runTaskLink(task)">
                  <span class="name">{{task.name}}</span>
                </router-link>
                <div class="column">
                  <span
                    class="tag"
                    v-if="run.tasks_waiting_approval.includes(task.id)"
                  >Waiting approval</span>
                </div>
                <div class="parents column">
                  <span v-if="parents(task).length > 0">depends on: &nbsp;</span>
                  <span class="parent" v-for="dep in parents(task)" v-bind:key="dep">{{dep}}</span>
                </div>
              </div>
              <!--               <span
                class="duration"
                v-if="duration && (step.Phase == 'success' || step.Phase == 'failed') "
              >{{duration}}</span>-->
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <div class="tabs">
          <ul>
            <li>
              <a>Setup Errors</a>
            </li>
          </ul>
        </div>
        <div class="setuperrors">
          <span class="error-line" v-for="(error, i) in run.setup_errors" v-bind:key="i">{{error}}</span>
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
@import "@/css/_variables.scss";

.tasks-list {
  .task-content {
    margin-bottom: 5px;
    border: 1px solid $grey-lighter;
    border-left: 0 solid;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
  }

  .success {
    border-left: 5px solid $green;
  }

  .failed {
    border-left: 5px solid $red;
  }

  .running {
    border-left: 5px solid $blue;
  }

  .unknown {
    border-left: 5px solid $grey-lighter;
  }

  .name {
    font-weight: bold;
  }

  .parents {
    margin-left: 1rem;
    margin-right: 0rem;
    font-weight: lighter;
    font-size: 0.8rem;
    .parent {
      font-weight: normal;
    }
  }
}

.setuperrors {
  background-color: #222;
  color: #f1f1f1;
  font-family: Cousine, monospace;
  font-size: 12px;
  line-height: 19px;
  white-space: pre-wrap;
  word-wrap: break-word;
  text-align: left;
  font-size: 12px;
  padding: 5px;

  .error-line {
    pre {
      line-height: 1.2;
    }
  }
}
</style>