<template>
  <ul>
    <li v-for="task in sortedTasks" v-bind:key="task.id">
      <div class="mb-2 border-l-5 rounded-l" :class="taskClass(task)">
        <div
          class="px-4 py-4 flex justify-between items-center border border-l-0 rounded-r"
        >
          <router-link class="w-1/3 font-bold" :to="task.link">
            <span class="w-1/3 font-bold">{{ task.name }}</span>
          </router-link>
          <div class="w-1/4">
            <span
              v-if="task.waiting_approval"
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
                v-bind:key="dep"
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

<script>
import * as moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';

momentDurationFormatSetup(moment);

export default {
  name: 'tasks',
  components: {},
  data() {
    return {
      now: moment(),
    };
  },
  props: {
    tasks: Object,
  },
  computed: {
    sortedTasks() {
      let tasks = this.tasks;

      // sort tasks by level
      let sortedTasks = Object.keys(tasks)
        .sort((a, b) =>
          tasks[a].level > tasks[b].level
            ? 1
            : tasks[b].level > tasks[a].level
            ? -1
            : 0
        )
        .map((k) => tasks[k]);

      for (let task of sortedTasks) {
        task.duration = this.duration(task);
      }

      return sortedTasks;
    },
  },
  methods: {
    duration(task) {
      let formatString = 'h:mm:ss[s]';
      let start = moment(task.start_time);
      let end = moment(task.end_time);

      if (task.start_time === null) {
        return moment.duration(0).format(formatString);
      }
      if (task.end_time === null) {
        return moment.duration(this.now.diff(start)).format(formatString);
      }
      return moment.duration(end.diff(start)).format(formatString);
    },
    taskClass(task) {
      if (task.status == 'success') return 'success';
      if (task.status == 'failed') return 'failed';
      if (task.status == 'stopped') return 'failed';
      if (task.status == 'running') return 'running';
      if (task.status == 'skipped') return 'skipped';
      return 'unknown';
    },
  },
  created() {
    window.setInterval(() => {
      this.now = moment();
    }, 500);
  },
};
</script>
