<template>
  <div class="overflow-x-auto">
    <svg
      v-if="ready"
      version="1.1"
      :width="width"
      :height="height"
      class="svg-content"
      scroll
      overflow="scroll"
    >
      <g v-for="(segment, i) in segments" v-bind:key="i">
        <line
          :x1="segment.x1"
          :y1="segment.y1"
          :x2="segment.x2"
          :y2="segment.y2"
          :stroke-width="segment.strokeWidth"
          :stroke="segment.stroke"
          stroke-linecap="round"
          :class="['stroke-current', segment.stroke]"
        />
      </g>
      <g v-for="(task, idx) in outTasks" v-bind:key="idx">
        <foreignObject
          :x="(taskWidth + taskXSpace) * task.level"
          :y="(taskHeight + taskYSpace) * task.row"
          rx="3"
          ry="3"
          :width="taskWidth"
          :height="taskHeight"
        >
          <body>
            <div
              class="mb-2 border-l-5 rounded-l"
              :class="taskClass(task)"
              @mouseover="hoverTask = task"
              @mouseleave="hoverTask = null"
            >
              <router-link
                :to="task.link"
                class="px-1 flex flex-col border border-l-0 rounded-r"
                :style="{ height: taskHeight + 'px' }"
                :title="task.name"
              >
                <div class="flex justify-end">
                  <div class="text-right text-xs">{{ task.duration }}</div>
                </div>
                <div class="font-bold truncate">{{ task.name }}</div>
                <div class="flex justify-end">
                  <span
                    v-if="task.waitingApproval"
                    class="bg-gray-200 rounded-full px-2 py-0 text-xs text-center font-semibold"
                    >Waiting Approval</span
                  >
                </div>
              </router-link>
            </div>
          </body>
        </foreignObject>
      </g>
    </svg>
  </div>
</template>

<script lang="ts">
import { useNow } from '@vueuse/core';
import {
  computed,
  defineComponent,
  onMounted,
  PropType,
  Ref,
  ref,
  toRefs,
  watch,
} from 'vue';
import { formatDuration } from '../util/time';
import { Task } from './runsummary.vue';

interface EdgePoint {
  x: number;
  y: number;
}

interface Edge {
  edgePoints: EdgePoint[];
  sourceTask: Task;
  targetTask: Task;
}

export default defineComponent({
  name: 'tasksgraph',
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

    const ready = ref(false);
    const graphTasks: Ref<Task[]> = ref([]);
    const edges: Ref<Edge[]> = ref([]);
    const width = ref('');
    const height = ref('');

    const taskWidth = 240;
    const taskHeight = 60;
    const taskXSpace = 60;
    const taskYSpace = 20;
    const hoverTask = ref();

    onMounted(() => {
      update(tasks.value);
    });

    const segments = computed(() => {
      let segments = [];
      for (let edge of edges.value) {
        for (let i = 0; i < edge.edgePoints.length - 1; i++) {
          let strokeWidth = 1;
          if (hoverTask.value) {
            if (
              edge.sourceTask.id == hoverTask.value.id ||
              edge.targetTask.id == hoverTask.value.id
            ) {
              strokeWidth = 3;
            }
          }

          // TODO(sgotti) set different colors to edges based on source task status???
          let stroke = 'text-dark';
          segments.push({
            edge: edge,
            x1: edge.edgePoints[i].x,
            y1: edge.edgePoints[i].y,
            x2: edge.edgePoints[i + 1].x,
            y2: edge.edgePoints[i + 1].y,
            strokeWidth: strokeWidth,
            stroke: stroke,
          });
        }
      }

      // sort segments by color (first the ok)
      return segments;
    });

    const outTasks = computed(() => {
      // just augment this.graphTasks (without recalculating it) with the current duration.
      const gts = graphTasks.value.concat();
      for (let task of gts) {
        task.duration = formatDuration(task, now.value);
      }

      return gts;
    });

    const taskClass = (task: Task) => {
      if (task.status == 'success') return 'success';
      if (task.status == 'failed') return 'failed';
      if (task.status == 'stopped') return 'failed';
      if (task.status == 'running') return 'running';
      if (task.status == 'skipped') return 'skipped';
      return 'unknown';
    };

    const update = (tasks: Record<string, Task>) => {
      const ts = Object.values(tasks);
      // sort tasks by level
      let gts = ts.sort((a, b) =>
        a.level > b.level ? 1 : b.level > a.level ? -1 : 0
      );

      let maxlevel = 0;
      for (let task of gts) {
        if (task.level > maxlevel) {
          maxlevel = task.level;
        }
      }

      let taskChilds = function (tasks: Task[], task: Task) {
        let childs = [];
        for (let ot of tasks) {
          for (let depTaskID in ot.depends) {
            if (task.id == depTaskID) {
              childs.push(ot);
            }
          }
        }
        return childs;
      };

      let taskMaxChildLevel = function (tasks: Task[], task: Task) {
        let level = task.level;
        let childs = taskChilds(tasks, task);
        for (let child of childs) {
          if (child.level > level) {
            level = child.level;
          }
        }
        return level;
      };

      let levelTasks = function (tasks: Task[], level: number) {
        let levelTasks = [];
        for (let task of tasks) {
          if (task.level != level) {
            continue;
          }
          levelTasks.push(task);
        }
        return levelTasks;
      };

      let levelsTasks = function (tasks: Task[], startLevel: number) {
        let levelTasks = [];
        for (let task of tasks) {
          if (task.level < startLevel) {
            continue;
          }
          levelTasks.push(task);
        }
        return levelTasks;
      };

      let levelsTasksByRow = function (tasks: Task[], startLevel: number) {
        return levelsTasks(tasks, startLevel).sort((a, b) =>
          a.row > b.row ? 1 : b.row > a.row ? -1 : 0
        );
      };

      let levelFreeRow = function (tasks: Task[], level: number) {
        let rows = [];
        for (let task of tasks) {
          if (task.level != level) {
            continue;
          }
          if (task.row >= 0) {
            rows.push(task.row);
          }
        }

        rows = rows.sort((a, b) => a - b);

        let prevrow = 0;
        for (let row of rows) {
          if (row == prevrow) {
            prevrow++;
          } else {
            break;
          }
        }
        return prevrow;
      };

      let levelsMaxRow = function (tasks: Task[], level: number) {
        let row = 0;
        for (let task of tasks) {
          if (level >= 0 && task.level > level) {
            continue;
          }
          if (task.row > row) {
            row = task.row;
          }
        }
        return row;
      };

      for (let l = maxlevel; l >= 0; l--) {
        let seenTasks = new Map();

        let row = 0;
        // if not at the last level fetch parents by their childs
        if (l < maxlevel) {
          for (let curTask of levelsTasksByRow(gts, l + 1)) {
            for (let depTaskID in curTask.depends) {
              for (let parent of levelTasks(gts, l)) {
                if (seenTasks.has(parent.id)) {
                  continue;
                }
                if (parent.id == depTaskID) {
                  seenTasks.set(parent.id, true);

                  let maxChildLevel = taskMaxChildLevel(gts, parent);
                  if (maxChildLevel > parent.level + 1) {
                    // put parent in a row greater than the max row the next levels until the child level
                    let mrow = levelsMaxRow(gts, maxChildLevel - 1) + 1;
                    parent.row = mrow;
                    row = mrow + 1;
                  } else {
                    parent.row = row;
                    row++;
                  }
                }
              }
            }
          }
        }

        // arrange tasks of this level
        for (let curTask of levelTasks(gts, l)) {
          if (seenTasks.has(curTask.id)) {
            continue;
          }
          seenTasks.set(curTask.id, true);
          let crow = levelFreeRow(gts, l);
          curTask.row = crow;
          row = crow + 1;

          // group tasks with common parent
          for (let nextTask of levelTasks(gts, l)) {
            if (seenTasks.has(nextTask.id)) {
              continue;
            }

            let hasCommonParents = false;
            for (let nextParentID in nextTask.depends) {
              for (let curParentID in curTask.depends) {
                if (nextParentID == curParentID) {
                  hasCommonParents = true;
                  break;
                }
              }
            }
            if (hasCommonParents) {
              seenTasks.set(nextTask.id, true);
              let crow = levelFreeRow(gts, l);
              nextTask.row = crow;
              row = crow + 1;
            }
          }
        }
      }

      let curEdges: Edge[] = [];

      for (let curTask of gts) {
        for (let depTaskID in curTask.depends) {
          for (let pTask of gts) {
            if (pTask.id == depTaskID) {
              curEdges.push({
                edgePoints: [],
                sourceTask: pTask,
                targetTask: curTask,
              });
            }
          }
        }
      }

      for (let edge of curEdges) {
        edge.edgePoints.push({
          x: (taskWidth + taskXSpace) * edge.sourceTask.level + taskWidth,
          y: (taskHeight + taskYSpace) * edge.sourceTask.row + taskHeight / 2,
        });
        edge.edgePoints.push({
          x: (taskWidth + taskXSpace) * edge.targetTask.level - taskXSpace / 2,
          y: (taskHeight + taskYSpace) * edge.sourceTask.row + taskHeight / 2,
        });
        edge.edgePoints.push({
          x: (taskWidth + taskXSpace) * edge.targetTask.level - taskXSpace / 2,
          y: (taskHeight + taskYSpace) * edge.targetTask.row + taskHeight / 2,
        });
        edge.edgePoints.push({
          x: (taskWidth + taskXSpace) * edge.targetTask.level,
          y: (taskHeight + taskYSpace) * edge.targetTask.row + taskHeight / 2,
        });
      }

      edges.value = curEdges;

      let w = (maxlevel + 1) * (taskWidth + taskXSpace);
      width.value = w + 'px';

      let h = (levelsMaxRow(gts, -1) + 1) * (taskHeight + taskYSpace);
      height.value = h + 'px';

      graphTasks.value = gts;

      ready.value = true;
    };

    watch(
      tasks,
      (newTasks) => {
        update(newTasks);
      },
      { immediate: false }
    );

    return {
      ready,
      outTasks,
      edges,
      segments,

      taskWidth,
      taskHeight,
      taskXSpace,
      taskYSpace,
      hoverTask,

      width,
      height,

      taskClass,
    };
  },
});
</script>
