<template>
  <div>
    <h4 class="mb-3 text-xl">Organization Members</h4>
    <ul v-if="orgMembers?.members && orgMembers.members.length > 0">
      <li
        class="flex"
        v-for="member in orgMembers.members"
        :key="member.user.id"
      >
        <span class="w-1/2 font-bold">{{ member.user.username }}</span>
        <span class="w-1/2">{{ member.role }}</span>
      </li>
    </ul>
    <div
      v-else-if="
        !loadingOrgMembers &&
        orgMembers?.members &&
        orgMembers.members.length == 0
      "
      class="font-bold"
    >
      No Members
    </div>

    <delay v-if="loadingOrgMembers" :timeout="500">
      <div class="mt-4 ml-6 flex w-48">
        <div :class="{ spinner: loadingOrgMembers }"></div>
      </div>
    </delay>

    <div class="flex justify-center my-3">
      <button
        v-if="hasMoreOrgMembers && !loadingOrgMembers"
        class="bg-transparent text-blue-700 font-semibold hover:(bg-blue-500 text-white border-transparent) py-2 px-4 border border-blue-500 disabled:(bg-blue-500 opacity-50 cursor-not-allowed) rounded"
        @click="loadMoreOrgMembers()"
      >
        Load more...
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onUnmounted,
  Ref,
  ref,
  toRefs,
  watch,
} from 'vue';
import { ApiError, OrgMembersResponse, useAPI } from '../app/api';
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

    const loadingOrgMembers = ref(false);
    const orgMembers: Ref<OrgMembersResponse | undefined> = ref();
    const orgMembersCursor: Ref<string | undefined> = ref();

    onUnmounted(() => {
      fetchAbort.abort();
    });

    const abortFetch = () => {
      fetchAbort.abort();
      fetchAbort = new AbortController();
    };

    const loadMoreOrgMembers = async () => {
      abortFetch();

      await fetchOrgMembers();
    };

    const fetchOrgMembers = async () => {
      try {
        loadingOrgMembers.value = true;

        if (!orgMembersCursor.value) {
          orgMembers.value = undefined;
        }

        const { res, cursor } = await api.getOrgMembers(
          orgname.value,
          orgMembersCursor.value,
          fetchAbort.signal
        );

        if (orgMembers.value) {
          orgMembers.value.members.push(...res.members);
        } else {
          orgMembers.value = res;
        }

        orgMembersCursor.value = cursor;
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        appState.setGlobalError(e);
      } finally {
        loadingOrgMembers.value = false;
      }
    };

    const refreshOrgMembers = async () => {
      abortFetch();

      orgMembers.value = undefined;
      orgMembersCursor.value = undefined;

      await fetchOrgMembers();
    };

    watch(
      props,
      () => {
        refreshOrgMembers();
      },
      { immediate: true }
    );

    return {
      loadingOrgMembers,
      hasMoreOrgMembers: computed(() => !!orgMembersCursor.value),

      orgMembers,

      loadMoreOrgMembers,
    };
  },
});
</script>
