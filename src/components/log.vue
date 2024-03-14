<template>
  <div>
    <span
      v-if="!fetching && !logExists"
      class="bg-gray-700 border border-yellow-500 rounded px-3 py-1 text-center font-semibold"
    >
      Log doesn't exist
    </span>
    <template v-else>
      <div
        v-if="
          (streaming || done) && logLines.length == 0 && lastLogLine.length == 0
        "
        class="bg-gray-700 border border-yellow-500 rounded mb-1 px-3 py-1 text-center font-semibold"
      >
        No lines
      </div>
      <div class="overflow-x-auto">
        <div v-for="(logLines, index) in logLinesGroups" :key="index">
          <div v-for="(logLine, index) in logLines" :key="index">
            <div
              class="font-mono leading-normal text-xs whitespace-nowrap"
              v-html="logLine"
            />
          </div>
        </div>
        <div v-if="lastLogLine" class="font-mono leading-snug text-xs">
          <div v-html="lastLogLine" />
        </div>
        <div v-if="fetching" class="w-3 h-5 spinner"></div>
      </div>
    </template>
    <template v-if="error">
      <span
        class="bg-gray-700 border border-red-600 rounded px-3 py-1 text-center font-semibold"
      >
        Error fetching log
      </span>
      <button
        class="ml-3 font-bold py-1 px-4 rounded bg-gray-700 text-white hover:bg-gray-600 focus:bg-gray-600 focus:outline-none"
        @click="fetch()"
      >
        Retry
      </button>
    </template>
  </div>
</template>

<script lang="ts">
import { AnsiUp } from 'ansi_up';
import {
  computed,
  defineComponent,
  onUnmounted,
  Ref,
  ref,
  toRefs,
  watch,
} from 'vue';
import { ApiError, useAPI } from '../app/api';

export default defineComponent({
  name: 'Log',
  props: {
    show: Boolean,
    rungrouptype: { type: String, required: true },
    rungroupref: { type: String, required: true },
    runnumber: { type: Number, required: true },
    taskid: String,
    setup: Boolean,
    step: Number,
    stepphase: String,
  },
  setup(props) {
    const {
      show,
      rungrouptype,
      rungroupref,
      runnumber,
      taskid,
      setup,
      step,
      stepphase,
    } = toRefs(props);

    const api = useAPI();

    const logLines: Ref<string[]> = ref([]);
    const lastLogLine = ref('');
    const fetching = ref(false);
    const streaming = ref(false);
    const done = ref(false);
    const logExists = ref(false);
    const error = ref(false);

    const fetchAbort: Ref<AbortController | undefined> = ref(
      new AbortController()
    );

    const formatter = new AnsiUp();
    formatter.use_classes = true;

    onUnmounted(() => {
      fetchAbort.value?.abort();
    });

    const abortFetch = () => {
      fetchAbort.value?.abort();
      fetchAbort.value = new AbortController();
    };

    const fetch = async () => {
      if (fetching.value) {
        return;
      }

      let follow = false;
      if (stepphase.value == 'running') {
        follow = true;
      }

      getLogs(follow);
    };

    const getLogs = async (follow: boolean) => {
      logLines.value = [];
      logExists.value = false;
      error.value = false;

      const apiURL = api.baseURL();
      apiURL.pathname +=
        '/' +
        rungrouptype.value +
        '/' +
        encodeURIComponent(rungroupref.value) +
        '/runs/' +
        runnumber.value +
        '/tasks/' +
        taskid.value +
        '/logs';

      if (setup.value) {
        apiURL.searchParams.append('setup', '');
      } else {
        if (step.value !== undefined) {
          apiURL.searchParams.append('step', step.value.toString());
        }
      }
      if (follow) {
        apiURL.searchParams.append('follow', '');
      }

      try {
        fetching.value = true;

        const res = await api.fetch(apiURL.toString(), {
          method: 'GET',
          signal: fetchAbort.value?.signal,
        });
        if (res.status == 200) {
          if (!res.body) return;

          logExists.value = true;
          streaming.value = true;
          const reader = res.body.getReader();

          let lastline = '';
          let j = 0;
          for (;;) {
            const { done: readerDone, value } = await reader.read();
            if (readerDone) {
              fetching.value = false;
              streaming.value = false;
              done.value = true;
              return;
            }

            const data = new TextDecoder('utf-8').decode(value, {
              stream: true,
            });

            let part = '';
            for (let i = 0; i < data.length; i++) {
              const c = data.charAt(i);
              if (c == '\r') {
                // replace lastline from start, simulating line feed (go to start of line)
                // this isn't perfect since the previous line contents could have
                // been written using different colors and this will lose them but
                // in practically all cases this won't happen
                lastline =
                  lastline.slice(0, j) + part + lastline.slice(j + part.length);
                j = 0;
                lastLogLine.value = formatter.ansi_to_html(lastline);
                part = '';
              } else if (c == '\n') {
                lastline =
                  lastline.slice(0, j) + part + lastline.slice(j + part.length);
                j += part.length;
                logLines.value.push(formatter.ansi_to_html(lastline));
                lastLogLine.value = '';
                lastline = '';
                j = 0;
                part = '';
              } else {
                part += c;
              }
            }
            lastline =
              lastline.slice(0, j) + part + lastline.slice(j + part.length);
            j += part.length;
            lastLogLine.value = formatter.ansi_to_html(lastline);
          }
        } else if (res.status == 404) {
          logExists.value = false;
        } else if (res.status == 500) {
          error.value = true;
        }
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
          if (e.httpStatus == 404) {
            logExists.value = false;
            return;
          }
          // TODO(sgotti) show that log fetching has failed
        }
        error.value = true;
      } finally {
        fetching.value = false;
        streaming.value = false;
        done.value = false;
      }
    };

    watch(show, (post, pre) => {
      if (pre == false && post == true) {
        abortFetch();
        fetch();
      }
      if (pre == true && post == false) {
        abortFetch();
      }
    });

    watch(stepphase, (post) => {
      if (!show.value) {
        return;
      }
      if (fetching.value) {
        return;
      }
      if (post == 'running') {
        abortFetch();
        getLogs(true);
      } else {
        abortFetch();
        getLogs(false);
      }
    });

    // creating group of N log lines inside their own div will make the rendering faster.
    // We could also use an intersection observer to only render visible groups
    // but this will break searching using browser searching since it won't find
    // data inside not rendered groups and will require a custom searching entry.
    const logLinesGroups = computed(() => {
      const groups: string[][] = [];
      const groupSize = 100;
      for (let i = 0; i < logLines.value.length; i += groupSize) {
        groups.push(logLines.value.slice(i, i + groupSize));
      }

      return groups;
    });

    return {
      logLines,
      logLinesGroups,
      lastLogLine,
      formatter,
      fetching,
      streaming,
      done,
      logExists,
      error,

      fetch,
    };
  },
});
</script>
