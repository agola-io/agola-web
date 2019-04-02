<template>
  <div class="dark">
    <div class="log">
      <div class="stream-line" v-for="(item, index) in items" :key="index">
        <div v-html="item"/>
      </div>
    </div>
  </div>
</template>

<script>
import { apiurl, apiurlwithtoken, fetch } from "@/util/auth";
import AnsiUp from "ansi_up";

export default {
  name: "Log",
  props: {
    show: Boolean,
    runid: String,
    taskid: String,
    setup: Boolean,
    step: Number,
    stepphase: String
  },
  computed: {},
  data() {
    let formatter = new AnsiUp();
    formatter.use_classes = true;

    return {
      items: [],
      lines: [],
      formatter: formatter,
      es: null,
      fetching: false
    };
  },
  methods: {
    fetch() {
      if (this.fetching) {
        return;
      }
      this.fetching = true;
      if (this.stepphase == "running") {
        this.streamLogs();
      }

      if (this.stepphase == "success" || this.stepphase == "failed") {
        this.getLogs();
      }
    },
    streamLogs() {
      let path = "/logs?runID=" + this.runid + "&taskID=" + this.taskid;
      if (this.setup) {
        path += "&setup";
      } else {
        path += "&step=" + this.step;
      }
      path += "&follow&stream";

      this.es = new EventSource(apiurlwithtoken(path));
      this.es.onmessage = event => {
        var data = event.data;
        // TODO(sgotti) ansi_up doesn't handle carriage return (\r), find a way to also handle it
        this.items.push(this.formatter.ansi_to_html(data));
      };
      // don't reconnect on error
      this.es.onerror = () => {
        this.es.close();
      };
    },
    async getLogs() {
      let path = "/logs?runID=" + this.runid + "&taskID=" + this.taskid;
      if (this.setup) {
        path += "&setup";
      } else {
        path += "&step=" + this.step;
      }
      let res = await fetch(apiurl(path));
      if (res.status == 200) {
        let data = await res.text();
        this.items.push(this.formatter.ansi_to_html(data));
      }
    }
  },
  watch: {
    show: function(post, pre) {
      if (pre == false && post == true) {
        this.fetch();
      }
    },
    stepphase: function(post, pre) {
      if (pre == "notstarted" && post == "running") {
        this.streamLogs();
      }
      if (pre == "notstarted" && (post == "success" || post == "failed")) {
        this.getLogs();
      }

      if (pre == "running" && (post == "success" || post == "failed")) {
        // TODO(sgotti)
      }
    }
  },
  created: function() {
    if (this.show) {
      this.fetch();
    }
  },
  beforeDestroy() {
    if (this.es !== null) {
      this.es.close();
    }
  }
};
</script>

<style scoped lang="scss">
.log {
  background-color: #222;
  color: #f1f1f1;
  font-family: Cousine, monospace;
  font-size: 12px;
  line-height: 19px;
  white-space: pre-wrap;
  word-wrap: break-word;
  text-align: left;
  font-size: 12px;
  padding: 5px;

  .stream-line {
    pre {
      line-height: 1.2;
    }
  }
}
</style>