<template>
  <div>
    <h4 class="text-xl my-3">Organizations</h4>
    <ul v-if="userOrgs && userOrgs.length > 0">
      <li
        class="mb-2 border rounded-l"
        v-for="userOrg in userOrgs"
        :key="userOrg.Organization?.id"
      >
        <div class="pl-4 py-4 flex items-center">
          <router-link
            class="item"
            :to="organizationLink(organizationRef(userOrg.Organization?.name))"
          >
            <span class="font-bold">{{ userOrg.Organization?.name }}</span>
            <span
              class="px-2 py-1 ml-4 border border-gray-200 rounded-xl text-xs"
              >{{ userOrg.Organization?.visibility }}</span
            >
          </router-link>
        </div>
      </li>
    </ul>
    <div
      v-else-if="!loadingUserOrgs && userOrgs && userOrgs.length == 0"
      class="font-bold"
    >
      No organizations
    </div>

    <delay v-if="loadingUserOrgs" :timeout="500">
      <div class="mt-4 ml-6 flex w-48">
        <div :class="{ spinner: loadingUserOrgs }"></div>
      </div>
    </delay>

    <div class="flex justify-center my-3">
      <button
        v-if="hasMoreUserOrgs && !loadingUserOrgs"
        class="bg-transparent text-blue-700 font-semibold hover:(bg-blue-500 text-white border-transparent) py-2 px-4 border border-blue-500 disabled:(bg-blue-500 opacity-50 cursor-not-allowed) rounded"
        @click="loadMoreUserOrgs()"
      >
        Load more...
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onUnmounted, ref, Ref, watch } from 'vue';
import { ApiError, useAPI, UserOrgResponse } from '../app/api';
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

    const loadingUserOrgs = ref(false);
    const userOrgs: Ref<UserOrgResponse[] | undefined> = ref();
    const userOrgsCursor: Ref<string | undefined> = ref();

    onUnmounted(() => {
      fetchAbort.abort();
    });

    const abortFetch = () => {
      fetchAbort.abort();
      fetchAbort = new AbortController();
    };

    const organizationRef = (name: string): string[] => {
      const ref: string[] = [];
      ref.push(name);
      return ref;
    };

    const loadMoreUserOrgs = async () => {
      abortFetch();

      await fetchUserOrgs();
    };

    const fetchUserOrgs = async () => {
      try {
        loadingUserOrgs.value = true;

        if (!userOrgsCursor.value) {
          userOrgs.value = undefined;
        }

        const { res, cursor } = await api.getUserOrgs(
          userOrgsCursor.value,
          fetchAbort.signal
        );

        if (userOrgs.value) {
          userOrgs.value.push(...res);
        } else {
          userOrgs.value = res;
        }

        userOrgsCursor.value = cursor;
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }

        userOrgsCursor.value = undefined;

        appState.setGlobalError(e);
      } finally {
        loadingUserOrgs.value = false;
      }
    };

    const refreshUserOrgs = async () => {
      abortFetch();

      userOrgs.value = undefined;
      userOrgsCursor.value = undefined;

      await fetchUserOrgs();
    };

    watch(
      props,
      () => {
        refreshUserOrgs();
      },
      { immediate: true }
    );

    return {
      loadingUserOrgs,
      hasMoreUserOrgs: computed(() => !!userOrgsCursor.value),

      userOrgs,

      loadMoreUserOrgs,

      organizationLink,
      organizationRef,
    };
  },
});
</script>
