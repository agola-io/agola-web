<template>
  <div class="overflow-x-auto">
    <div v-for="(item, index) in items" :key="index">
      <div class="font-mono leading-normal text-xs whitespace-no-wrap" v-html="item" />
    </div>
    <div v-if="lastitem" class="font-mono leading-snug text-xs">
      <div v-html="lastitem" />
    </div>
  </div>
</template>

<script>
import { apiurl, fetch } from "@/util/auth";
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
      lastitem: "",
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

      let follow = false;
      if (this.stepphase == "running") {
        follow = true;
      }

      this.getLogs(follow);
    },
    async getLogs(follow) {
      this.items = [];
      let path = "/logs?runID=" + this.runid + "&taskID=" + this.taskid;
      if (this.setup) {
        path += "&setup";
      } else {
        path += "&step=" + this.step;
      }
      if (follow) {
        path += "&follow";
      }

      let res = await fetch(apiurl(path));
      if (res.status == 200) {
        const reader = res.body.getReader();

        let lastline = "";
        let j = 0;
        for (;;) {
          let { done, value } = await reader.read();
          if (done) {
            return;
          }

          let data = new TextDecoder("utf-8").decode(value, { stream: true });

          let part = "";
          for (var i = 0; i < data.length; i++) {
            let c = data.charAt(i);
            if (c == "\r") {
              // replace lastline from start, simulating line feed (go to start of line)
              // this isn't perfect since the previous line contents could have
              // been written using different colors and this will lose them but
              // in practically all cases this won't happen
              lastline =
                lastline.slice(0, j) + part + lastline.slice(j + part.length);
              j = 0;
              this.lastitem = this.formatter.ansi_to_html(lastline);
              part = "";
            } else if (c == "\n") {
              lastline =
                lastline.slice(0, j) + part + lastline.slice(j + part.length);
              j += part.length;
              this.lastitem = this.formatter.ansi_to_html(lastline);
              this.items.push(this.lastitem);
              this.lastitem = "";
              lastline = "";
              j = 0;
              part = "";
            } else {
              part += c;
            }
          }
          lastline =
            lastline.slice(0, j) + part + lastline.slice(j + part.length);
          j += part.length;
          this.lastitem = this.formatter.ansi_to_html(lastline);
        }
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
        this.getLogs(true);
      } else {
        this.getLogs(false);
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
</style>