<template>
  <div>
    <h4 class="text-xl my-3">Organizations</h4>
    <div v-if="!fetchedOrganizations" class="ml-6 flex w-48">
      <div v-bind:class="{ spinner: !fetchedOrganizations }"></div>
    </div>

    <ul v-else-if="organizations && organizations.length > 0">
      <li
        class="mb-2 border rounded-l"
        v-for="org in organizations"
        v-bind:key="org.Organization?.id"
      >
        <div class="pl-4 py-4 flex items-center">
          <router-link
            class="item"
            :to="organizationLink(organizationRef(org.Organization?.name))"
          >
            <span class="font-bold">{{ org.Organization?.name }}</span>
            <span
              class="px-2 py-1 ml-4 border border-gray-200 rounded-xl text-xs"
              >{{ org.Organization?.visibility }}</span
            >
          </router-link>
        </div>
      </li>
    </ul>
    <div v-else class="font-bold">No organizations</div>
  </div>
</template>

<script lang="ts">
import { useAsyncState } from '@vueuse/core';
import { defineComponent, onUnmounted, watch } from 'vue';
import { ApiError, useAPI } from '../app/api';
import { useAppState } from '../app/appstate';
import { organizationLink } from '../util/link';

export default defineComponent({
  components: {},
  name: 'UserOrganizations',
  props: {
    ownertype: {
      type: String,
      required: true,
    },
    ownername: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const appState = useAppState();
    const api = useAPI();

    let fetchAbort = new AbortController();

    onUnmounted(() => {
      fetchAbort.abort();
    });

    const abortFetch = () => {
      fetchAbort.abort();
      fetchAbort = new AbortController();
    };

    const update = async () => {
      abortFetch();
      refreshUserOrgs();
    };

    const organizationRef = (name: string): string[] => {
      const ref: string[] = [];
      ref.push(name);
      return ref;
    };

    const fetchUserOrgs = async () => {
      try {
        return await api.getUserOrgs(fetchAbort.signal);
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        appState.setGlobalError(e);
      }
    };

    const {
      state: organizations,
      isReady: fetchedOrganizations,
      execute: refreshUserOrgs,
    } = useAsyncState(
      async () => {
        return await fetchUserOrgs();
      },
      undefined,
      { immediate: false, shallow: false }
    );

    watch(
      props,
      () => {
        organizations.value = undefined;

        update();
      },
      { immediate: true }
    );

    return {
      fetchedOrganizations,
      organizations,
      organizationLink,
      organizationRef,
    };
  },
});
</script>
