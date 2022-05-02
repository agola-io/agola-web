<template>
  <div>
    <h4 class="mb-3 text-xl">Organization Members</h4>
    <ul v-if="orgMembers">
      <li
        class="flex"
        v-for="member in orgMembers.members"
        v-bind:key="member.user.id"
      >
        <span class="w-1/2 font-bold">{{ member.user.username }}</span>
        <span class="w-1/2">{{ member.role }}</span>
      </li>
    </ul>
    <div v-else>No Members</div>
  </div>
</template>

<script lang="ts">
import { useAsyncState } from '@vueuse/core';
import { defineComponent, onUnmounted, toRefs, watch } from 'vue';
import { ApiError, useAPI } from '../app/api';
import { useAppState } from '../app/appstate';

export default defineComponent({
  components: {},
  name: 'orgmembers',
  props: {
    orgname: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { orgname } = toRefs(props);

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

      refreshOrgMembers();
    };

    const fetchOrgMembers = async () => {
      try {
        return await api.getOrgMembers(orgname.value, fetchAbort.signal);
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        appState.setGlobalError(e);
      }
    };

    const {
      state: orgMembers,
      // isReady: fetchedOrgMembers,
      execute: refreshOrgMembers,
    } = useAsyncState(
      async () => {
        return await fetchOrgMembers();
      },
      undefined,
      { immediate: false, shallow: false }
    );

    watch(
      props,
      () => {
        orgMembers.value = undefined;

        update();
      },
      { immediate: true }
    );

    return { orgMembers };
  },
});
</script>
