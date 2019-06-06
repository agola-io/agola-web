<template>
  <div
    class="mb-2 border-l-5 rounded-l"
    :class="stepClass"
    role="tab"
    :aria-expanded="active ? 'true' : 'false'"
  >
    <div class="px-4 py-4 border border-l-0 rounded-r">
      <div class="cursor-pointer flex justify-between" @click.prevent="toggle">
        <div>
          <i
            class="inline-block mr-1 mdi mdi-arrow-right"
            :class="{ 'arrow-down': active, 'arrow-right': !active }"
          ></i>
          <span class="w-1/3 font-bold">{{step.name}}</span>
        </div>
        <span class>{{ duration }}</span>
      </div>
      <div class="p-1" v-show="active">
        <Log
          v-bind:runid="runid"
          v-bind:taskid="taskid"
          v-bind:setup="setup"
          v-bind:step="stepnum"
          v-bind:stepphase="step.phase"
          v-bind:show="active"
        />
      </div>
    </div>
  </div>
</template>

<script>
import * as moment from "moment";
import momentDurationFormatSetup from "moment-duration-format";
import Log from "@/components/log.vue";

momentDurationFormatSetup(moment);

export default {
  name: "step",
  components: {
    Log
  },
  data() {
    return {
      active: false,
      now: moment()
    };
  },
  props: {
    runid: String,
    taskid: String,
    setup: Boolean,
    stepnum: Number,
    step: Object
  },
  computed: {
    duration() {
      let formatString = "h:mm:ss[s]";
      let start = moment(this.step.start_time);
      let end = moment(this.step.end_time);

      if (this.step.start_time === null) {
        return moment.duration(0).format(formatString);
      }
      if (this.step.end_time === null) {
        return moment.duration(this.now.diff(start)).format(formatString);
      }
      return moment.duration(end.diff(start)).format(formatString);
    },
    stepClass() {
      if (this.step.phase == "success") return "success";
      if (this.step.phase == "failed") return "failed";
      if (this.step.phase == "stopped") return "failed";
      if (this.step.phase == "running") return "running";
      return "unknown";
    }
  },
  methods: {
    toggle() {
      this.active = !this.active;
      if (this.active) {
        this.$emit("step-open", this.index);
      }
    }
  },
  created() {
    if (this.active) {
      this.$emit("step-open", this.index);
    }
    window.setInterval(() => {
      this.now = moment();
    }, 500);
  }
};
</script>

<style scoped lang="scss">
.arrow-right {
  transition: transform 0.2s ease-in-out;
}

.arrow-down {
  transition: transform 0.2s ease-in-out;
  transform: rotate(90deg);
}
</style>