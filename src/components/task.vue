<template>
  <div>
    <RunDetail :run="run"/>
    <div v-if="task != null">
      <div class="task-title">
        <span class="task-name" v-html="task.name"/>
        <span class="tag" :class="taskClass(task)">{{ task.status | capitalize }}</span>
      </div>
      <Collapse
        v-bind:runid="runid"
        v-bind:taskid="taskid"
        v-bind:setup="true"
        v-bind:step="task.setup_step"
      />
      <div v-for="(step, index) in task.steps" v-bind:key="index">
        <Collapse
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
import { fetchRun, fetchTask } from "@/util/data.js";

import Collapse from "@/components/collapse.vue";
import RunDetail from "@/components/rundetail.vue";

export default {
  components: {
    Collapse,
    RunDetail
  },
  name: "task",
  data() {
    return {
      run: null,
      task: null,
      runid: this.$route.params.runid,
      taskid: this.$route.params.taskid,
      polling: null
    };
  },
  methods: {
    taskClass(task) {
      if (task.status == "success") return "is-success";
      if (task.status == "failed") return "is-failed";
      if (task.status == "stopped") return "is-failed";
      if (task.status == "running") return "is-running";
      return "unknown";
    },
    async fetchRun() {
      this.run = await fetchRun(this.runid);
    },
    async fetchTask() {
      this.task = await fetchTask(this.runid, this.taskid);
    },
    pollData() {
      this.polling = setInterval(() => {
        this.fetchTask();
        this.fetchRun();
      }, 2000);
    }
  },
  created: function() {
    this.fetchRun();
    this.fetchTask();
    this.pollData();
  },
  beforeDestroy() {
    clearInterval(this.polling);
  }
};
</script>

<style scoped lang="scss">
.task-title {
  display: flex;
  align-items: center;
  padding-left: 5px;
  margin-bottom: 25px;

  .task-name {
    padding-left: 5px;
    font-size: 1.5rem;
    padding-right: 1rem;
  }
}
</style>