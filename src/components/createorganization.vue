<template>
  <div>
    <h4 class="mb-4 text-xl font-bold">New Organization</h4>
    <div>
      <div>
        <input
          class="mb-4 appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          placeholder="Organization name"
          v-model="orgName"
        />
      </div>
    </div>
    <div class="mb-4">
      <label>
        <input type="checkbox" v-model="orgIsPrivate" />
        Private
      </label>
    </div>
    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      @click="createOrg()"
    >
      Create Organization
    </button>
    <div
      v-if="createOrgError"
      class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <span class="block sm:inline">{{ createOrgError }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref } from 'vue';
import { useRouter } from 'vue-router';
import { APIAbortedError, errorToString, useAPI } from '../app/api';
import { ownerLink } from '../util/link';

export default defineComponent({
  components: {},
  name: 'createorganization',
  props: {},
  setup() {
    const router = useRouter();
    const api = useAPI();

    const orgName = ref('');
    const orgIsPrivate = ref(false);

    const createOrgError: Ref<unknown | undefined> = ref();

    const resetErrors = () => {
      createOrgError.value = undefined;
    };

    const createOrg = async () => {
      resetErrors();

      let visibility = 'public';
      if (orgIsPrivate.value) {
        visibility = 'private';
      }

      try {
        await api.createOrganization(orgName.value, visibility);
        router.push(ownerLink('org', orgName.value));
      } catch (e) {
        if (e instanceof APIAbortedError) return;
        createOrgError.value = e;
      }
    };

    return {
      createOrgError: computed(() => errorToString(createOrgError.value)),
      orgName,
      orgIsPrivate,

      createOrg,
    };
  },
});
</script>
