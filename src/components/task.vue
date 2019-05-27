<template>
  <div class="mb-2 border-l-5 rounded-l" :class="taskClass(task)">
    <div class="px-4 py-4 flex justify-between items-center border border-l-0 rounded-r">
      <router-link class="w-1/3 font-bold" tag="a" :to="link">
        <span class="w-1/3 font-bold">{{task.name}}</span>
      </router-link>
      <div class="w-1/4">
        <span class="tag" v-if="waitingApproval">Waiting approval</span>
      </div>
      <div class="w-1/4">
        <span class="block" v-if="parents.length > 0">depends on: &nbsp;</span>
        <span class="font-thin text-gray-600" v-for="dep in parents" v-bind:key="dep">{{dep}}</span>
      </div>
      <span class="w-16 text-right">{{ duration }}</span>
    </div>
  </div>
</template>

<script>
import * as moment from "moment";
import momentDurationFormatSetup from "moment-duration-format";

momentDurationFormatSetup(moment);

export default {
  name: "task",
  components: {},
  data() {
    return {
      now: moment()
    };
  },
  props: {
    task: Object,
    link: Object,
    waitingApproval: Boolean,
    parents: Array
  },
  computed: {
    duration() {
      let formatString = "h:mm:ss[s]";
      let start = moment(this.task.start_time);
      let end = moment(this.task.end_time);

      if (this.task.start_time === null) {
        return moment.duration(0).format(formatString);
      }
      if (this.task.end_time === null) {
        return moment.duration(this.now.diff(start)).format(formatString);
      }
      return moment.duration(end.diff(start)).format(formatString);
    }
  },
  methods: {
    taskClass(task) {
      if (task.status == "success") return "success";
      if (task.status == "failed") return "failed";
      if (task.status == "stopped") return "failed";
      if (task.status == "running") return "running";
      return "unknown";
    }
  },
  created() {
    window.setInterval(() => {
      this.now = moment();
    }, 500);
  }
};
</script>

<style scoped lang="scss">
</style>
