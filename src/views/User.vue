<template>
  <div>
    <nav class="mb-4 rounded font-sans w-full">
      <ol class="list-none flex">
        <li>
          <a>user</a>
        </li>
        <li>
          <span class="mx-2">/</span>
        </li>
        <li>
          <router-link :to="ownerLink('user', username)">{{
            username
          }}</router-link>
        </li>
      </ol>
    </nav>

    <div class="mb-8 flex justify-between">
      <span class="text-3xl">{{ username }}</span>
      <createprojectbutton v-on:click="goToCreate($event)" />
    </div>

    <div class="flex justify-between">
      <ul class="flex-grow tab">
        <li
          class="tab-element"
          :class="[
            {
              'tab-element-selected':
                $route.name?.toString() === 'user projects' ||
                $route.name?.toString() === 'user',
            },
          ]"
        >
          <router-link :to="ownerProjectsLink('user', username)">
            <i class="mr-1 mdi mdi-home" />
            <span>Projects</span>
          </router-link>
        </li>
        <li
          class="tab-element"
          :class="[
            {
              'tab-element-selected': $route.name?.toString() === 'user orgs',
            },
          ]"
        >
          <router-link :to="userOrganizationsLink()">
            <i class="mr-1 mdi mdi-account-group" />
            <span>Organizations</span>
          </router-link>
        </li>
        <li
          class="tab-element"
          :class="[
            {
              'tab-element-selected':
                $route.name?.toString() === 'user direct runs',
            },
          ]"
        >
          <router-link :to="userDirectRunsLink(username)">
            <i class="mr-1 mdi mdi-run-fast" />
            <span>Direct Runs</span>
          </router-link>
        </li>
        <li
          v-if="
            run &&
            ($route.name?.toString() == 'user direct run' ||
              $route.name?.toString() == 'user direct run task')
          "
        >
          <tabarrow />
        </li>
        <li
          class="tab-element"
          v-if="
            run &&
            runnumber &&
            ($route.name?.toString() == 'user direct run' ||
              $route.name?.toString() == 'user direct run task')
          "
          :class="[
            {
              'tab-element-selected':
                $route.name?.toString() == 'user direct run',
            },
          ]"
        >
          <router-link :to="userDirectRunLink(username, runnumber)">
            <span>
              Run
              <strong>#{{ run.number }}</strong>
            </span>
          </router-link>
        </li>
        <li v-if="run && $route.name?.toString() == 'user direct run task'">
          <tabarrow />
        </li>
        <li
          class="tab-element"
          v-if="
            run &&
            runnumber &&
            taskid &&
            $route.name?.toString() == 'user direct run task'
          "
          :class="[
            {
              'tab-element-selected':
                $route.name?.toString() == 'user direct run task',
            },
          ]"
        >
          <router-link :to="userDirectRunTaskLink(username, runnumber, taskid)">
            <span>
              Task
              <strong>{{ run.tasks[taskid].name }}</strong>
            </span>
          </router-link>
        </li>
        <li
          v-if="$route.name?.toString().endsWith('user project group settings')"
          class="tab-element"
          :class="[
            {
              'tab-element-selected': $route.name
                ?.toString()
                .endsWith('user project group settings'),
            },
          ]"
        >
          <router-link :to="projectGroupSettingsLink('user', username, [])">
            <i class="mr-1 mdi mdi-cog" />
            <span>Root Project Group Settings</span>
          </router-link>
        </li>
        <li
          v-if="$route.name?.toString().endsWith('user settings')"
          class="tab-element"
          :class="[
            {
              'tab-element-selected': $route.name
                ?.toString()
                .endsWith('user settings'),
            },
          ]"
        >
          <router-link :to="ownerSettingsLink('user', username)">
            <i class="mr-1 mdi mdi-cog" />
            <span>User Settings</span>
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
                    :to="projectGroupSettingsLink('user', username, [])"
                  >
                    <i class="mr-1 mdi mdi-cog" />
                    <span>Root Project Group Settings</span>
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
import { defineComponent, onUnmounted, ref, toRefs, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ApiError, useAPI } from '../app/api';
import { useAppState } from '../app/appstate';
import createprojectbutton from '../components/createprojectbutton.vue';
import tabarrow from '../components/tabarrow.vue';
import {
  ownerLink,
  ownerProjectsLink,
  ownerSettingsLink,
  projectGroupCreateProjectGroupLink,
  projectGroupCreateProjectLink,
  projectGroupSettingsLink,
  userDirectRunLink,
  userDirectRunsLink,
  userDirectRunTaskLink,
  userOrganizationsLink,
} from '../util/link';

export default defineComponent({
  name: 'User',
  components: { createprojectbutton, tabarrow },
  directives: {
    onClickOutside: vOnClickOutside,
  },
  props: {
    username: { type: String, required: true },
    runnumber: Number,
    taskid: String,
  },
  setup(props) {
    const { username, runnumber } = toRefs(props);

    const appState = useAppState();
    const api = useAPI();

    const router = useRouter();

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
        const rungrouptype = 'users';
        const rungroupref = username.value;

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

    const goToCreate = (type: string) => {
      if (type == 'project') {
        router.push(projectGroupCreateProjectLink('user', username.value, []));
        return;
      }
      router.push(
        projectGroupCreateProjectGroupLink('user', username.value, [])
      );
    };

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
      dropdownActive,

      ownerLink,
      ownerProjectsLink,
      userDirectRunsLink,
      userOrganizationsLink,
      userDirectRunLink,
      userDirectRunTaskLink,
      ownerSettingsLink,
      projectGroupCreateProjectGroupLink,
      projectGroupCreateProjectLink,
      projectGroupSettingsLink,

      goToCreate,
    };
  },
});
</script>
