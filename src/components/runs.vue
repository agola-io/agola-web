<template>
  <div>
    <div v-if="runs.length > 0">
      <div class="item-list">
        <div v-for="run in runs" v-bind:key="run.id" :class="runResultClass(run)">
          <div class="item-content">
            <router-link
              v-if="projectref"
              tag="div"
              class="name"
              :to="projectRunLink(ownertype, ownername, projectref, run.id)"
            >
              <span>{{run.name}}</span>
            </router-link>
            <router-link v-else tag="div" class="name" :to="userLocalRunLink(ownername, run.id)">
              <span>{{run.name}}</span>
            </router-link>
            <div class="commitmessage">{{run.annotations.message}}</div>
            <span v-if="waitingApproval(run)" class="waitingapproval tag">Waiting Approval</span>
            <span v-if="!waitingApproval(run)" class="waitingapproval"></span>
            <span v-if="stillRunning(run)" class="stillrunning tag">Still running</span>
            <span v-if="!stillRunning(run)" class="stillrunning"></span>
            <div class="source-info">
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
      <div class="has-text-centered">
        <button
          v-if="hasMoreRuns"
          class="button is-primary is-outlined is-fullwidth load-more-button"
          @click="loadMoreRuns()"
        >Load more...</button>
      </div>
    </div>
    <div v-else class="item-list">No runs</div>
  </div>
</template>

<script>
import { fetchUser, fetchProject, fetchRuns } from "@/util/data.js";
import { userLocalRunLink, projectRunLink } from "@/util/link.js";

export default {
  components: {},
  name: "runs",
  props: {
    ownertype: String,
    ownername: String,
    projectref: Array,
    query: String
  },
  data() {
    return {
      runs: [],
      wantedRunsNumber: 25,
      hasMoreRuns: false,
      polling: null,
      project: null,
      user: null
    };
  },
  watch: {
    $route: function() {
      this.update();
    }
  },
  methods: {
    projectRunLink: projectRunLink,
    userLocalRunLink: userLocalRunLink,
    stillRunning(run) {
      return run.result != "unknown" && run.phase == "running";
    },
    waitingApproval(run) {
      return run.tasks_waiting_approval.length > 0;
    },
    runResultClass(run) {
      if (run.result == "unknown") {
        if (run.phase == "setuperror") return "setuperror";
        if (run.phase == "queued") return "unknown";
        if (run.phase == "cancelled") return "failed";
        if (run.phase == "running") return "running";
      }
      if (run.result == "success") return "success";
      if (run.result == "failed") return "failed";
      if (run.result == "stopped") return "failed";
      return "unknown";
    },
    update() {
      clearInterval(this.polling);
      if (this.projectref !== undefined) {
        this.fetchProject();
      } else {
        this.fetchUser();
      }
      this.pollData();
    },
    async fetchProject() {
      let projectref = [
        this.ownertype,
        this.ownername,
        ...this.projectref
      ].join("/");

      let { data, error } = await fetchProject(projectref);
      if (error) {
        this.$store.dispatch("setError", error);
        return;
      }
      this.project = data;

      this.fetchRuns();
    },
    async fetchUser() {
      let { data, error } = await fetchUser(this.ownername);
      if (error) {
        this.$store.dispatch("setError", error);
        return;
      }
      this.user = data;

      this.fetchRuns();
    },
    loadMoreRuns() {
      this.wantedRunsNumber += 25;
      this.fetchRuns();
    },
    // TODO(sgotti) use run events instead of refetching all runs everytime
    async fetchRuns() {
      let group;
      let lastrun = false;
      if (this.project !== null) {
        if (this.query == "branches") {
          group = "/project/" + this.project.id + "/branch";
          lastrun = true;
        } else if (this.query == "tags") {
          group = "/project/" + this.project.id + "/tag";
          lastrun = true;
        } else if (this.query == "pullrequests") {
          group = "/project/" + this.project.id + "/pr";
          lastrun = true;
        } else {
          group = "/project/" + this.project.id;
        }
      } else if (this.user !== null) {
        group = "/user/" + this.user.id;
      }

      let newRuns = [];
      let hasMoreRuns = false;
      let stopFetch = false;
      let runCount = 0;
      let startRunID = null;
      while (!stopFetch) {
        let { data, error } = await fetchRuns(group, startRunID, lastrun);
        if (error) {
          this.$store.dispatch("setError", error);
          return;
        }
        runCount += data.length;
        if (runCount >= this.wantedRunsNumber || data.length == 0) {
          hasMoreRuns = data.length != 0;
          stopFetch = true;
        }
        newRuns = newRuns.concat(data);
        if (newRuns.length) {
          startRunID = newRuns[newRuns.length - 1].id;
        }
      }
      this.runs = newRuns;
      this.hasMoreRuns = hasMoreRuns;
    },
    pollData() {
      clearInterval(this.polling);
      this.polling = setInterval(() => {
        this.fetchRuns();
      }, 2000);
    }
  },
  created: function() {
    this.update();
  },
  beforeDestroy() {
    clearInterval(this.polling);
  }
};
</script>

<style scoped lang="scss">
@import "@/css/_variables.scss";

.project-title {
  display: flex;
  align-items: center;
  padding-left: 5px;
  margin-bottom: 25px;
  .project-name {
    padding-left: 5px;
    font-size: 1.5rem;
    padding-right: 1rem;
  }
}

.item-list {
  .item-content {
    margin-bottom: 5px;
    border: 1px solid $grey-lighter;
    border-left: 0 solid;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
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

  .setuperror {
    border-left: 5px solid $yellow;
  }

  .name {
    flex: 0 0 30%;
    font-weight: bold;
    cursor: pointer;
  }

  .commitmessage {
    flex: 0 0 40%;
  }

  .stillrunning {
    flex: 0 0 10%;
  }

  .waitingapproval {
    flex: 0 0 10%;
  }

  .source-info {
    flex: 0 0 10%;
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

.load-more-button {
  margin-top: 1rem;
  margin-bottom: 2rem;
}
</style>
