<template>
  <div
    class="mb-2 border-l-5 rounded-l"
    :class="stepClass(step)"
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
        <span class>{{duration}}</span>
      </div>
      <div class="p-1 log-container" v-show="active">
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
  name: "Collapse",
  components: {
    Log
  },
  data() {
    return {
      active: false,
      duration: null
    };
  },
  props: {
    runid: String,
    taskid: String,
    setup: Boolean,
    stepnum: Number,
    step: Object
  },
  created() {
    this.updateDuration(this.step);
  },
  ready() {
    if (this.active) {
      this.$emit("collapse-open", this.index);
    }
  },
  watch: {
    step: function(step) {
      this.updateDuration(step);
    }
  },
  methods: {
    stepClass(step) {
      if (step.phase == "success") return "success";
      if (step.phase == "failed") return "failed";
      if (step.phase == "stopped") return "failed";
      if (step.phase == "running") return "running";
      return "unknown";
    },
    updateDuration(step) {
      let start = moment(step.start_time);
      let end = moment(step.end_time);
      if (start === null || end === null) {
        this.duration = null;
        return;
      }
      this.duration = moment.duration(end.diff(start)).format("h:mm:ss[s]");
    },
    toggle() {
      this.active = !this.active;
      if (this.active) {
        this.$emit("collapse-open", this.index);
      }
    }
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