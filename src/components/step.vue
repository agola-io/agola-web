<template>
  <div
    class="mb-2 border-l-5 rounded-l"
    :class="stepClass"
    role="tab"
    :aria-expanded="active ? 'true' : 'false'"
  >
    <div class="px-4 py-4 border border-l-0 rounded-r">
      <div
        class="cursor-pointer flex justify-between"
        @click.prevent="() => toggleActive()"
      >
        <div>
          <i
            class="inline-block mr-1 mdi mdi-arrow-right"
            :class="{ 'arrow-down': active, 'arrow-right': !active }"
          ></i>
          <span class="w-1/3 font-bold">{{ step.name }}</span>
        </div>
        <span class>{{ duration }}</span>
      </div>
      <div class="p-1 font-mono text-xs" v-show="active">
        <div v-if="step.type == 'run'">
          <div class="p-3 rounded-t bg-gray-900 text-white">
            <span>
              <span
                class="w-2/12 bg-gray-700 rounded-l px-3 py-1 text-center font-semibold"
                >Shell</span
              >
              <span
                class="w-2/12 bg-gray-600 rounded-r px-3 py-1 text-center font-semibold mr-2"
                >{{ step.shell }}</span
              >
            </span>
            <span v-if="step.exit_status != undefined">
              <span
                class="w-2/12 bg-gray-700 rounded-l px-3 py-1 text-center font-semibold"
                >Exit Status</span
              >
              <span
                class="w-2/12 bg-gray-600 rounded-r px-3 py-1 text-center font-semibold mr-2"
                >{{ step.exit_status }}</span
              >
            </span>
          </div>
          <div
            class="px-3 py-2 border-b-2 border-gray-900 bg-gray-700 text-white cursor-pointer"
            @click.prevent="() => toggleCommandActive()"
          >
            <i
              class="inline-block mr-1 mdi mdi-arrow-right"
              :class="{
                'arrow-down': commandActive,
                'arrow-right': !commandActive,
              }"
            ></i>
            <span>Command</span>
          </div>
          <div
            v-show="commandActive"
            class="p-3 bg-gray-900 text-white overflow-x-auto"
            :class="{ rounded: step.type != 'run' }"
          >
            <pre class="font-mono text-xs">{{ step.command }}</pre>
          </div>
        </div>
        <div v-if="step.type == 'run'" class="px-3 py-2 bg-gray-700 text-white">
          Log
        </div>
        <div
          class="p-3 rounded-b bg-gray-900 text-white"
          :class="{ rounded: step.type != 'run' }"
        >
          <Log
            :rungrouptype="rungrouptype"
            :rungroupref="rungroupref"
            :runnumber="runnumber"
            :taskid="taskid"
            :setup="setup"
            :step="stepnum"
            :stepphase="step.phase"
            :show="active"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useNow, useToggle } from '@vueuse/core';
import { computed, defineComponent, toRefs } from 'vue';
import Log from '../components/log.vue';
import { formatDuration } from '../util/time';

export default defineComponent({
  name: 'step',
  components: {
    Log,
  },
  props: {
    rungrouptype: { type: String, required: true },
    rungroupref: { type: String, required: true },
    runnumber: { type: Number, required: true },
    taskid: String,
    setup: Boolean,
    stepnum: Number,
    step: { type: Object, required: true },
  },
  setup(props) {
    const { step } = toRefs(props);

    const now = useNow();
    const [active, toggleActive] = useToggle(false);
    const [commandActive, toggleCommandActive] = useToggle(true);

    const duration = computed(() => {
      return formatDuration(step.value, now.value);
    });

    const stepClass = computed(() => {
      if (step.value.phase == 'success') return 'success';
      if (step.value.phase == 'failed') return 'failed';
      if (step.value.phase == 'stopped') return 'failed';
      if (step.value.phase == 'running') return 'running';
      return 'unknown';
    });

    return {
      active,
      commandActive,
      duration,
      stepClass,

      toggleActive,
      toggleCommandActive,
    };
  },
});
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
