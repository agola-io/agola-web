<template>
  <div>
    <div v-if="run != null">
      <div class="run">
        <div :class="runResultClass(run)">
          <div class="run-content">
            <div class="item-content columns">
              <div class="run-title column is-10">
                <span class="run-name">{{run.name}}</span>
                <span
                  class="tag"
                  :class="'is-'+runResultClass(run)"
                >{{ runStatus(run) | capitalize }}</span>
                <span v-if="stillRunning(run)" class="stillrunning tag">Still running</span>
                <span v-if="!stillRunning(run)" class="stillrunning"></span>
              </div>
              <div class="run-actions column is-2 is-pulled-right">
                <div
                  class="dropdown is-hoverable is-right"
                  v-if="run.can_restart_from_scratch || run.can_restart_from_failed_tasks"
                >
                  <div class="dropdown-trigger">
                    <button class="button" aria-haspopup="true" aria-controls="dropdown-menu">
                      <span>Restart</span>
                      <span class="icon is-small">
                        <i class="mdi mdi-restart" aria-hidden="true"></i>
                      </span>
                    </button>
                  </div>
                  <div class="dropdown-menu" role="menu">
                    <div class="dropdown-content">
                      <a
                        v-if="run.can_restart_from_scratch"
                        class="dropdown-item"
                        @click="restartRun(run, true)"
                      >From start</a>
                      <a
                        v-if="run.can_restart_from_failed_tasks"
                        class="dropdown-item"
                        @click="restartRun(run)"
                      >From failed tasks</a>
                    </div>
                  </div>
                </div>￼
                <button
                  class="button is-danger"
                  v-if="run.phase == 'running'"
                  @click="stopRun(run)"
                >Stop</button>
              </div>
            </div>
            <div class="item-content columns">
              <div class="commitmessage column">{{run.annotations.message}}</div>
              <div class="source-info column">
                <a :href="run.annotations.commit_link" class="commit" target="_blank">
                  <i class="mdi mdi-source-commit mdi-rotate-90"></i>
                  <span>{{run.annotations.commit_sha.substring(0,8)}}</span>
                </a>
                <a
                  v-if="run.annotations.event_type == 'push'"
                  :href="run.annotations.branch_link"
                  class="commit"
                  target="_blank"
                >
                  <i class="mdi mdi-source-branch"></i>
                  <span>{{run.annotations.branch}}</span>
                </a>
                <a
                  v-else-if="run.annotations.event_type == 'tag'"
                  :href="run.annotations.tag_link"
                  class="commit"
                  target="_blank"
                >
                  <i class="mdi mdi-tag"></i>
                  <span>{{run.annotations.tag}}</span>
                </a>
                <a
                  v-else-if="run.annotations.event_type == 'pull_request'"
                  :href="run.annotations.pull_request_link"
                  class="commit"
                  target="_blank"
                >
                  <i class="mdi mdi-source-pull"></i>
                  <span>PR #{{run.annotations.pull_request_id}}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { apiurl, fetch } from "@/util/auth";
import { userLocalRunTaskLink, projectRunTaskLink } from "@/util/link.js";

export default {
  name: "RunDetail",
  props: {
    run: Object
  },
  data() {
    return {};
  },
  methods: {
    stillRunning(run) {
      return run.result != "unknown" && run.phase == "running";
    },
    runStatus(run) {
      if (run.phase != "finished") return run.phase;
      if (run.result != "unknown") return run.result;
      if (run.stopping) return "stopping";

      return run.result;
    },
    runResultClass(run) {
      status = this.runStatus(run);

      if (status == "queued") return "unknown";
      if (status == "cancelled") return "failed";
      if (status == "running") return "running";
      if (status == "stopping") return "failed";
      if (status == "stopped") return "failed";
      if (status == "success") return "success";
      if (status == "failed") return "failed";
      return "unknown";
    },
    taskClass(task) {
      if (task.status == "success") return "success";
      if (task.status == "failed") return "failed";
      if (task.status == "stopped") return "failed";
      if (task.status == "running") return "running";
      return "unknown";
    },
    restartRun(run, fromStart) {
      fetch(apiurl("/run/" + run.id + "/actions"), {
        method: "POST",
        body: JSON.stringify({
          action_type: "restart",
          from_start: fromStart
        })
      }).then(r => {
        console.log("r: " + r);
        if (r.status == 200) {
          return r.json();
        }
        throw Error(r.statusText);
      });
    },
    stopRun(run) {
      fetch(apiurl("/run/" + run.id + "/actions"), {
        method: "POST",
        body: JSON.stringify({
          action_type: "stop"
        })
      }).then(r => {
        console.log("r: " + r);
        if (r.status == 200) {
          return r.json();
        }
        throw Error(r.statusText);
      });
    }
  }
};
</script>

<style scoped lang="scss">
@import "@/css/_variables.scss";

.run {
  margin-bottom: 2rem;

  .run-content {
    margin-bottom: 5px;
    border: 1px solid $grey-lighter;
    border-left: 0 solid;
    display: block;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
  }

  .run-title {
    align-items: center;
    padding-left: 5px;
    margin-bottom: 25px;

    .run-name {
      padding-left: 5px;
      font-size: 1.5rem;
      padding-right: 1rem;
    }

    .success {
      border-left: 0px solid $green;
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
  }

  .run-actions {
    text-align: right;
  }

  .item-content {
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
    font-weight: bold;
    cursor: pointer;
  }

  .commitmessage {
  }

  .stillrunning {
  }

  .source-info {
    overflow: hidden;
    white-space: nowrap;

    a {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .commit {
    display: block;
    font-size: 0.8rem;
  }
}
</style>
