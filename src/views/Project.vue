<template>
  <div>
    <projbreadcrumbs
      :ownertype="ownertype"
      :ownername="ownername"
      :projectref="projectref"
    />

    <div class="mb-8">
      <span class="text-3xl">{{ projectName }}</span>
    </div>

    <div class="flex justify-between">
      <ul class="flex-grow tab">
        <li class="tab-element-disabled">
          <i class="mr-1 mdi mdi-run-fast" />
          <span>Runs</span>
        </li>
        <li>
          <tabarrow />
        </li>
        <li
          class="tab-element"
          :class="[
            {
              'tab-element-selected':
                $route.name?.toString().endsWith('project') ||
                $route.name?.toString().endsWith('project runs'),
            },
          ]"
        >
          <router-link :to="projectRunsLink(ownertype, ownername, projectref)">
            <i class="mr-1 mdi mdi-asterisk" />
            <span>All</span>
          </router-link>
        </li>
        <li
          class="tab-element"
          :class="[
            {
              'tab-element-selected': $route.name
                ?.toString()
                .endsWith('project branches runs'),
            },
          ]"
        >
          <router-link
            :to="projectBranchesRunsLink(ownertype, ownername, projectref)"
          >
            <i class="mr-1 mdi mdi-source-branch" />
            <span>Branches</span>
          </router-link>
        </li>
        <li
          class="tab-element"
          :class="[
            {
              'tab-element-selected': $route.name
                ?.toString()
                .endsWith('project tags runs'),
            },
          ]"
        >
          <router-link
            :to="projectTagsRunsLink(ownertype, ownername, projectref)"
          >
            <i class="mr-1 mdi mdi-tag" />
            <span>Tags</span>
          </router-link>
        </li>
        <li
          class="tab-element"
          :class="[
            {
              'tab-element-selected': $route.name
                ?.toString()
                .endsWith('project pull requests runs'),
            },
          ]"
        >
          <router-link
            :to="projectPRsRunsLink(ownertype, ownername, projectref)"
          >
            <i class="mr-1 mdi mdi-source-pull" />
            <span>Pull Requests</span>
          </router-link>
        </li>
        <li
          v-if="
            run &&
            ($route.name?.toString().endsWith('project run') ||
              $route.name?.toString().endsWith('project run task'))
          "
        >
          <tabarrow />
        </li>
        <li
          class="tab-element"
          v-if="
            run &&
            runnumber &&
            ($route.name?.toString().endsWith('project run') ||
              $route.name?.toString().endsWith('project run task'))
          "
          :class="[
            {
              'tab-element-selected': $route.name
                ?.toString()
                .endsWith('project run'),
            },
          ]"
        >
          <router-link
            :to="projectRunLink(ownertype, ownername, projectref, runnumber)"
          >
            <p>
              Run
              <strong>#{{ run.number }}</strong>
            </p>
          </router-link>
        </li>
        <li v-if="run && $route.name?.toString().endsWith('project run task')">
          <tabarrow />
        </li>
        <li
          class="tab-element"
          v-if="
            run &&
            runnumber &&
            taskid &&
            $route.name?.toString().endsWith('project run task')
          "
          :class="[
            {
              'tab-element-selected': $route.name
                ?.toString()
                .endsWith('project run task'),
            },
          ]"
        >
          <router-link
            :to="
              projectRunTaskLink(
                ownertype,
                ownername,
                projectref,
                runnumber,
                taskid
              )
            "
          >
            <p>
              Task
              <strong>{{ run.tasks[taskid].name }}</strong>
            </p>
          </router-link>
        </li>
        <li
          v-if="$route.name?.toString().endsWith('project settings')"
          class="tab-element"
          :class="[
            {
              'tab-element-selected': $route.name
                ?.toString()
                .endsWith('project settings'),
            },
          ]"
        >
          <router-link
            :to="projectSettingsLink(ownertype, ownername, projectref)"
          >
            <i class="mr-1 mdi mdi-cog" />
            <span>Project Settings</span>
          </router-link>
        </li>
      </ul>
      <ul class="flex tab">
        <li>
          <div class="relative">
            <div
              class="flex -mt-3"
              v-on-click-outside="() => (dropdownActive = false)"
              @click="dropdownActive = !dropdownActive"
            >
              <button
                class="relative flex items-center focus:outline-none bg-transparent hover:bg-gray-300 text-dark font-semibold hover:text-dark py-1 px-4 border border-gray-500 rounded"
              >
                <i class="mr-4 mdi mdi-cog" />
                <i class="mdi mdi-chevron-down"></i>
              </button>
            </div>
            <div
              v-if="dropdownActive"
              class="z-10 origin-top-right absolute right-0 mt-2 w-64 bg-white rounded-lg border shadow-md py-2"
            >
              <ul>
                <li>
                  <router-link
                    class="block px-4 py-2 hover:bg-blue-500 hover:text-white"
                    :to="projectSettingsLink(ownertype, ownername, projectref)"
                  >
                    <i class="mr-1 mdi mdi-cog" />
                    <span>Project Settings</span>
                  </router-link>
                </li>
              </ul>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <router-view class="mt-8"></router-view>
  </div>
</template>

<script lang="ts">
import { useAsyncState } from '@vueuse/core';
import { vOnClickOutside } from '@vueuse/components';
import {
  computed,
  defineComponent,
  onUnmounted,
  PropType,
  ref,
  toRefs,
  watch,
} from 'vue';
import { ApiError, useAPI } from '../app/api';
import { useAppState } from '../app/appstate';
import projbreadcrumbs from '../components/projbreadcrumbs.vue';
import tabarrow from '../components/tabarrow.vue';
import {
  projectBranchesRunsLink,
  projectLink,
  projectPRsRunsLink,
  projectRunLink,
  projectRunsLink,
  projectRunTaskLink,
  projectSettingsLink,
  projectTagsRunsLink,
} from '../util/link';

export default defineComponent({
  name: 'Project',
  components: { projbreadcrumbs, tabarrow },
  directives: {
    onClickOutside: vOnClickOutside,
  },
  props: {
    ownertype: {
      type: String,
      required: true,
    },
    ownername: {
      type: String,
      required: true,
    },
    projectref: { type: Array as PropType<Array<string>>, required: true },
    runnumber: Number,
    taskid: String,
  },
  setup(props) {
    const { ownertype, ownername, projectref, runnumber } = toRefs(props);

    const appState = useAppState();
    const api = useAPI();

    const dropdownActive = ref(false);
    let fetchAbort = new AbortController();

    onUnmounted(() => {
      fetchAbort.abort();
    });

    const abortFetch = () => {
      fetchAbort.abort();
      fetchAbort = new AbortController();
    };

    const getRun = async () => {
      abortFetch();

      if (runnumber.value) {
        const rungrouptype = 'projects';
        const rungroupref = [
          ownertype.value,
          ownername.value,
          ...projectref.value,
        ].join('/');

        try {
          return await api.getRun(
            rungrouptype,
            rungroupref,
            runnumber.value,
            fetchAbort.signal
          );
        } catch (e) {
          if (e instanceof ApiError) {
            if (e.aborted) return;
          }
          appState.setGlobalError(e);
        }
      }
    };

    const {
      state: run,
      // isReady: fetchedRun,
      execute: refreshRun,
    } = useAsyncState(async () => {
      return await getRun();
    }, undefined);

    const projectName = computed(() => {
      return projectref.value[projectref.value.length - 1];
    });

    watch(
      props,
      () => {
        fetchAbort.abort();
        fetchAbort = new AbortController();

        refreshRun();
      },
      { immediate: true }
    );

    return {
      run,
      projectName,
      dropdownActive,

      projectLink,
      projectRunsLink,
      projectBranchesRunsLink,
      projectTagsRunsLink,
      projectPRsRunsLink,
      projectRunLink,
      projectRunTaskLink,
      projectSettingsLink,
    };
  },
});
</script>
