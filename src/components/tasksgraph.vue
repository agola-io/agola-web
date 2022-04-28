<template>
  <div class="overflow-x-auto">
    <svg
      version="1.1"
      :width="width"
      :height="height"
      class="svg-content"
      scroll
      overflow="scroll"
    >
      <g v-for="(segment, i) in segments" v-bind:key="segment + i">
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
                    v-if="task.waiting_approval"
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

<script>
import * as moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';

momentDurationFormatSetup(moment);

export default {
  name: 'tasksgraph',
  components: {},
  data() {
    return {
      now: moment(),

      graphTasks: [],
      edges: [],

      taskWidth: 240,
      taskHeight: 60,
      taskXSpace: 60,
      taskYSpace: 20,
      hoverTask: null,

      height: '400px',
    };
  },
  props: {
    tasks: Object,
  },
  computed: {
    segments: function () {
      let segments = [];
      for (let edge of this.edges) {
        for (let i = 0; i < edge.edgePoints.length - 1; i++) {
          let strokeWidth = 1;
          if (this.hoverTask) {
            if (
              edge.sourceTask.id == this.hoverTask.id ||
              edge.targetTask.id == this.hoverTask.id
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
    },
    outTasks() {
      // just augment this.graphTasks (without recalculating it) with the current duration.
      for (let task of this.graphTasks) {
        task.duration = this.duration(task);
      }

      return this.graphTasks;
    },
  },
  watch: {
    tasks: function (tasks) {
      this.update(tasks);
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
    update(tasks) {
      // sort tasks by level
      let graphTasks = Object.keys(tasks)
        .sort((a, b) =>
          tasks[a].level > tasks[b].level
            ? 1
            : tasks[b].level > tasks[a].level
            ? -1
            : 0
        )
        .map((k) => tasks[k]);

      this.graphTasks = graphTasks;

      let maxlevel = 0;
      for (let task of graphTasks) {
        if (task.level > maxlevel) {
          maxlevel = task.level;
        }
      }

      let taskChilds = function (tasks, task) {
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

      let taskMaxChildLevel = function (tasks, task) {
        let level = task.level;
        let childs = taskChilds(tasks, task);
        for (let child of childs) {
          if (child.level > level) {
            level = child.level;
          }
        }
        return level;
      };

      let levelTasks = function (tasks, level) {
        let levelTasks = [];
        for (let task of tasks) {
          if (task.level != level) {
            continue;
          }
          levelTasks.push(task);
        }
        return levelTasks;
      };

      let levelsTasks = function (tasks, startLevel) {
        let levelTasks = [];
        for (let task of tasks) {
          if (task.level < startLevel) {
            continue;
          }
          levelTasks.push(task);
        }
        return levelTasks;
      };

      let levelsTasksByRow = function (tasks, startLevel) {
        return levelsTasks(tasks, startLevel).sort((a, b) =>
          a.row > b.row ? 1 : b.row > a.row ? -1 : 0
        );
      };

      let levelFreeRow = function (tasks, level) {
        let rows = [];
        for (let task of tasks) {
          if (task.level != level) {
            continue;
          }
          if (task.row !== undefined) {
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

      let levelsMaxRow = function (tasks, level) {
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
          for (let curTask of levelsTasksByRow(graphTasks, l + 1)) {
            for (let depTaskID in curTask.depends) {
              for (let parent of levelTasks(graphTasks, l)) {
                if (seenTasks.has(parent.id)) {
                  continue;
                }
                if (parent.id == depTaskID) {
                  seenTasks.set(parent.id, true);

                  let maxChildLevel = taskMaxChildLevel(graphTasks, parent);
                  if (maxChildLevel > parent.level + 1) {
                    // put parent in a row greater than the max row the next levels until the child level
                    let mrow = levelsMaxRow(graphTasks, maxChildLevel - 1) + 1;
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
        for (let curTask of levelTasks(graphTasks, l)) {
          if (seenTasks.has(curTask.id)) {
            continue;
          }
          seenTasks.set(curTask.id, true);
          let crow = levelFreeRow(graphTasks, l);
          curTask.row = crow;
          row = crow + 1;

          // group tasks with common parent
          for (let nextTask of levelTasks(graphTasks, l)) {
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
              let crow = levelFreeRow(graphTasks, l);
              nextTask.row = crow;
              row = crow + 1;
            }
          }
        }
      }

      let edges = [];

      for (let curTask of graphTasks) {
        for (let depTaskID in curTask.depends) {
          for (let pTask of graphTasks) {
            if (pTask.id == depTaskID) {
              edges.push({
                sourceTask: pTask,
                targetTask: curTask,
                source: { level: pTask.level, row: pTask.row },
                target: { level: curTask.level, row: curTask.row },
              });
            }
          }
        }
      }

      this.edges = edges;

      for (let edge of edges) {
        edge.edgePoints = [];
        let taskWidth = this.taskWidth;
        let taskHeight = this.taskHeight;
        let taskXSpace = this.taskXSpace;
        let taskYSpace = this.taskYSpace;

        edge.edgePoints.push({
          x: (taskWidth + taskXSpace) * edge.source.level + taskWidth,
          y: (taskHeight + taskYSpace) * edge.source.row + taskHeight / 2,
        });
        edge.edgePoints.push({
          x: (taskWidth + taskXSpace) * edge.target.level - taskXSpace / 2,
          y: (taskHeight + taskYSpace) * edge.source.row + taskHeight / 2,
        });
        edge.edgePoints.push({
          x: (taskWidth + taskXSpace) * edge.target.level - taskXSpace / 2,
          y: (taskHeight + taskYSpace) * edge.target.row + taskHeight / 2,
        });
        edge.edgePoints.push({
          x: (taskWidth + taskXSpace) * edge.target.level,
          y: (taskHeight + taskYSpace) * edge.target.row + taskHeight / 2,
        });
      }

      let width = (maxlevel + 1) * (this.taskWidth + this.taskXSpace);
      this.width = width + 'px';

      let height =
        (levelsMaxRow(graphTasks, -1) + 1) *
        (this.taskHeight + this.taskYSpace);
      this.height = height + 'px';
    },
  },
  created() {
    this.update(this.tasks);

    window.setInterval(() => {
      this.now = moment();
    }, 500);
  },
};
</script>
