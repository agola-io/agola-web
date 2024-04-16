<template>
  <div>
    <div
      v-if="createRemoteSourceError"
      class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <span class="block sm:inline">{{ createRemoteSourceError }}</span>
    </div>
    <div class="flex justify-center items-center">
      <CreateSourceForm v-on:createSource="createSource($event)" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref } from 'vue';
import { useRouter } from 'vue-router';
import { APIAbortedError, errorToString, useAPI } from '../app/api';
import CreateSourceForm from '../components/createsourceform.vue';

export interface createSourceEvent {
  admintoken: string;
  name: string;
  type: string;
  clientId: string;
  clientSecret: string;
  url: string;
  skipVerify: boolean;
  sshHostKey: string;
  skipSshHostKeyCheck: boolean;
}

export default defineComponent({
  name: 'CreateSource',
  components: {
    CreateSourceForm,
  },
  setup() {
    const router = useRouter();

    const api = useAPI();

    const fetchAbort = new AbortController();

    const createRemoteSourceError: Ref<unknown | undefined> = ref();

    const createSource = async (e: createSourceEvent) => {
      const {
        admintoken,
        name,
        type,
        clientId,
        clientSecret,
        url,
        skipVerify,
        sshHostKey,
        skipSshHostKeyCheck,
      } = e;

      try {
        await api.createRemoteSource(
          admintoken,
          type,
          name,
          clientId,
          clientSecret,
          url,
          'oauth2',
          skipVerify,
          sshHostKey,
          skipSshHostKeyCheck,
          true,
          true,
          fetchAbort.signal
        );
        router.push({ name: 'login' });
      } catch (e) {
        if (e instanceof APIAbortedError) return;
        createRemoteSourceError.value = e;
      }
    };

    return {
      createRemoteSourceError: computed(() =>
        errorToString(createRemoteSourceError.value)
      ),

      createSource,
    };
  },
});
</script>
