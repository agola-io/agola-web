<template>
  <ul>
    <li v-for="task in sortedTasks" :key="task.id">
      <div class="mb-2 border-l-5 rounded-l" :class="taskClass(task)">
        <div
          class="px-4 py-4 flex justify-between items-center border border-l-0 rounded-r"
        >
          <router-link class="w-1/3 font-bold" :to="task.link">
            <span class="w-1/3 font-bold">{{ task.name }}</span>
          </router-link>
          <div class="w-1/4">
            <span
              v-if="task.waitingApproval"
              class="w-2/12 bg-gray-200 rounded-full px-3 py-1 text-sm text-center font-semibold mr-2"
              >Waiting Approval</span
            >
          </div>
          <div class="w-1/4">
            <span class="block text-xs" v-if="task.parents.length > 0"
              >depends on: &nbsp;</span
            >
            <ul>
              <li
                class="font-thin text-xs text-gray-600"
                v-for="dep in task.parents"
                :key="dep"
              >
                {{ dep }}
              </li>
            </ul>
          </div>
          <span class="w-16 text-right">{{ task.duration }}</span>
        </div>
      </div>
    </li>
  </ul>
</template>

<script lang="ts">
import { useNow } from '@vueuse/core';
import { computed, defineComponent, PropType, toRefs } from 'vue';
import { formatDuration } from '../util/time';
import { Task } from './runsummary.vue';

export default defineComponent({
  name: 'tasks',
  components: {},
  props: {
    tasks: {
      type: Object as PropType<Record<string, Task>>,
      required: true,
    },
  },
  setup(props) {
    const { tasks } = toRefs(props);

    const now = useNow();

    const sortedTasks = computed(() => {
      const ts = Object.values(tasks.value);

      // sort tasks by level
      const sortedTasks = ts.sort((a, b) =>
        a.level > b.level ? 1 : b.level > a.level ? -1 : 0
      );

      for (const task of sortedTasks) {
        task.duration = formatDuration(task, now.value);
      }

      return sortedTasks;
    });

    const taskClass = (task: Task) => {
      if (task.status == 'success') return 'success';
      if (task.status == 'failed') return 'failed';
      if (task.status == 'stopped') return 'failed';
      if (task.status == 'running') return 'running';
      if (task.status == 'skipped') return 'skipped';
      return 'unknown';
    };

    return {
      sortedTasks,
      taskClass,
    };
  },
});
</script>
