<template>
  <div class="item">
    <div
      class="touchable"
      :class="stepClass(step)"
      role="tab"
      :aria-expanded="active ? 'true' : 'false'"
    >
      <div class="item-content">
        <div class="header" @click.prevent="toggle">
          <span class="icon">
            <i
              class="mdi mdi-arrow-right"
              :class="{ 'arrow-down': active, 'arrow-right': !active }"
            ></i>
          </span>
          <span class="name">{{step.name}}</span>
          <span class="duration">{{duration}}</span>
        </div>
        <div class="log-container" v-show="active">
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
@import "@/css/_variables.scss";

.item {
}

.item-content {
  margin-bottom: 5px;
  border: 1px solid $grey-lighter;
  border-left: 0 solid;
  padding: 10px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  flex: 0 0 30%;
  font-weight: bold;
  cursor: pointer;
}

.duration {
  margin-left: auto;
}

.log-container {
  padding: 10px;
}

.arrow-right {
  transition: transform 0.2s ease-in-out;
}

.arrow-down {
  transition: transform 0.2s ease-in-out;
  transform: rotate(90deg);
}
</style>