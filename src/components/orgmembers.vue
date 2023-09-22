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
    <div class="flex justify-center my-3">
      <button
        v-if="hasMoreOrgMembers"
        class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
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
      orgMembers,
      hasMoreOrgMembers: computed(() => !!orgMembersCursor.value),

      orgMembersCursor,

      loadMoreOrgMembers,
    };
  },
});
</script>
