<template>
  <div>
    <div
      v-if="addLinkedAccountError"
      class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <span class="block sm:inline">{{ addLinkedAccountError }}</span>
    </div>
    <div class="my-6 flex justify-center items-center">
      <div v-if="remoteSource">
        <LoginForm
          v-if="remoteSource.authType == 'password'"
          action="Add Linked Account"
          :name="remoteSource.name"
          @login="
            (username, password) => {
              remoteSource &&
                doAddLinkedAccount(remoteSource.name, username, password);
            }
          "
        />
        <button
          v-else
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          @click="
            () => {
              remoteSource && doAddLinkedAccount(remoteSource.name);
            }
          "
        >
          Add Linked Account with {{ remoteSource.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useAsyncState } from '@vueuse/core';
import {
  computed,
  defineComponent,
  onUnmounted,
  Ref,
  ref,
  toRefs,
  watch,
} from 'vue';
import { useRouter } from 'vue-router';
import { ApiError, errorToString, useAPI } from '../app/api';
import { useAppState } from '../app/appstate';
import LoginForm from '../components/loginform.vue';
import { getAllRemoteSources } from '../util/remotesource';

export default defineComponent({
  name: 'AddLinkedAccount',
  props: {
    username: { type: String, required: true },
    remoteSourceName: { type: String, required: true },
  },
  components: {
    LoginForm,
  },
  setup(props) {
    const { username, remoteSourceName } = toRefs(props);

    const router = useRouter();
    const appState = useAppState();
    const api = useAPI();

    let fetchAbort = new AbortController();

    const addLinkedAccountError: Ref<unknown | undefined> = ref();

    onUnmounted(() => {
      fetchAbort.abort();
    });

    const abortFetch = () => {
      fetchAbort.abort();
      fetchAbort = new AbortController();
    };

    const update = async () => {
      abortFetch();

      refreshRemoteSources();
    };

    const resetErrors = () => {
      addLinkedAccountError.value = undefined;
    };

    const fetchremoteSources = async () => {
      try {
        return await getAllRemoteSources(api);
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        appState.setGlobalError(e);
      }
    };

    const {
      state: remoteSources,
      // isReady: fetchedRemoteSources,
      execute: refreshRemoteSources,
    } = useAsyncState(
      async () => {
        return await fetchremoteSources();
      },
      undefined,
      { immediate: false, shallow: false }
    );

    const remoteSource = computed(() => {
      if (!remoteSources.value) return;

      return remoteSources.value?.find(
        (rs) => rs.name == remoteSourceName.value
      );
    });

    const doAddLinkedAccount = async (
      rsName: string,
      loginname?: string,
      password?: string
    ) => {
      resetErrors();

      try {
        const res = await api.createUserLinkedAccount(
          username.value,
          rsName,
          loginname,
          password
        );
        if (!res) return;

        router.push({
          name: 'user settings',
          params: { username: username.value },
        });
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        addLinkedAccountError.value = e;
      }
    };

    watch(
      props,
      () => {
        remoteSources.value = undefined;

        update();
      },
      { immediate: true }
    );

    return {
      addLinkedAccountError: computed(() =>
        errorToString(addLinkedAccountError.value)
      ),
      remoteSource,

      doAddLinkedAccount,
    };
  },
});
</script>
