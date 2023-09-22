<template>
  <div>
    <div class="panel">
      <p class="panel-title">Linked Accounts</p>
      <div class="p-4">
        <div
          class="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded"
          role="alert"
        >
          <p>
            Removing a Linked Account will also block all the projects that uses
            this Linked Account to access their remote repository
          </p>
        </div>
        <ul v-if="user && user.linkedAccounts.length">
          <li
            class="flex justify-between items-center mb-2"
            v-for="(la, index) in user.linkedAccounts"
            :key="index"
          >
            <div>
              <span class="font-bold">{{ la.remoteUserName }}</span>
              <span class="ml-1"
                >(on remote source {{ laRemoteSourceName(la) }})</span
              >
            </div>
            <button class="btn btn-red" @click="deleteLinkedAccount(la)">
              Delete
            </button>
          </li>
          <div
            v-if="deleteLinkedAccountError"
            class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span class="block sm:inline">{{ deleteLinkedAccountError }}</span>
          </div>
        </ul>
        <div v-else>No linked accounts</div>
      </div>
      <div v-if="remoteSources && remoteSources.length" class="p-4 border-t">
        <h5 class="mb-3 text-xl">Add new linked account</h5>

        <div class="inline-block">
          <div class="flex mb-3 relative w-64">
            <select
              class="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
              v-model="selectedRemoteSourceIndex"
            >
              <option :value="undefined" disabled>
                Select the remote source
              </option>
              <option
                v-for="(rs, index) in remoteSources"
                :key="rs.id"
                :value="index"
              >
                {{ rs.name }}
              </option>
            </select>
          </div>
        </div>

        <button class="ml-3 btn btn-blue" @click="addLinkedAccount()">
          Add Linked Account
        </button>
      </div>
    </div>

    <div class="panel">
      <p class="panel-title">User Tokens</p>
      <div class="p-4">
        <ul v-if="user && user.tokens.length">
          <li
            class="flex justify-between items-center mb-2"
            v-for="token in user.tokens"
            :key="token"
          >
            <span class="font-bold">{{ token }}</span>
            <button class="btn btn-red" @click="deleteUserToken(token)">
              Delete
            </button>
          </li>
          <div
            v-if="deleteUserTokenError"
            class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span class="block sm:inline">{{ deleteUserTokenError }}</span>
          </div>
        </ul>
        <div v-else>No user tokens</div>
      </div>

      <div class="p-4 border-t">
        <div
          v-if="token"
          class="my-3 relative bg-teal-100 border-t-4 border-teal-500 rounded-b text-teal-900 px-4 py-3 shadow-md"
          role="alert"
        >
          <div class="flex">
            <div class="py-1">
              <svg
                class="fill-current h-6 w-6 text-teal-500 mr-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path
                  d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"
                ></path>
              </svg>
            </div>
            <div>
              <p class="font-bold">
                User token created. Copy it now since it won't be showed again
              </p>
              <p class="text-sm">{{ token }}</p>
            </div>
          </div>
          <span
            class="absolute top-0 bottom-0 right-0 px-4 py-3"
            @click="closeNewTokenNotification()"
          >
            <svg
              class="fill-current h-6 w-6 text-teal-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>Close</title>
              <path
                d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"
              ></path>
            </svg>
          </span>
        </div>
        <h5 class="mb-3 text-xl">Create new User Token</h5>
        <div class="control">
          <input
            class="shadow appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            placeholder="Token name"
            v-model="newTokenName"
          />
          <button class="ml-3 btn btn-blue" @click="createUserToken()">
            Create Token
          </button>
        </div>
        <div
          v-if="createUserTokenError"
          class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span class="block sm:inline">{{ createUserTokenError }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useAsyncState } from '@vueuse/core';
import { computed, defineComponent, onUnmounted, Ref, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ApiError,
  errorToString,
  LinkedAccountResponse,
  useAPI,
} from '../app/api';
import { useAppState } from '../app/appstate';
import { userAddLinkedAccountLink } from '../util/link';
import { getAllRemoteSources } from '../util/remotesource';

export default defineComponent({
  components: {},
  name: 'usersettings',
  props: {},
  setup() {
    const router = useRouter();
    const route = useRoute();
    const appState = useAppState();
    const api = useAPI();

    let fetchAbort = new AbortController();

    const token: Ref<string | undefined> = ref();
    const newTokenName: Ref<string | undefined> = ref();
    const selectedRemoteSourceIndex: Ref<number | undefined> = ref();

    const createUserTokenError: Ref<unknown | undefined> = ref();
    const deleteUserTokenError: Ref<unknown | undefined> = ref();
    const deleteLinkedAccountError: Ref<unknown | undefined> = ref();

    onUnmounted(() => {
      fetchAbort.abort();
    });

    const abortFetch = () => {
      fetchAbort.abort();
      fetchAbort = new AbortController();
    };

    const update = async () => {
      abortFetch();

      refreshUser();
      refreshRemoteSources();
    };

    const resetErrors = () => {
      createUserTokenError.value = undefined;
      deleteUserTokenError.value = undefined;
      deleteLinkedAccountError.value = undefined;
    };

    const fetchUser = async () => {
      try {
        return await api.getAuthUser(fetchAbort.signal);
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        appState.setGlobalError(e);
      }
    };

    const {
      state: user,
      // isReady: fetchedUser,
      execute: refreshUser,
    } = useAsyncState(
      async () => {
        return await fetchUser();
      },
      undefined,
      { immediate: false }
    );

    const fetchRemoteSources = async () => {
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
        return await fetchRemoteSources();
      },
      undefined,
      { immediate: false, shallow: false }
    );

    const laRemoteSourceName = (la: LinkedAccountResponse) => {
      if (!remoteSources.value) return undefined;

      for (const rs of remoteSources.value) {
        if (rs.id == la.remoteSourceID) {
          return rs.name;
        }
      }
    };

    const addLinkedAccount = () => {
      if (!user.value) return;
      if (!remoteSources.value) return;
      if (selectedRemoteSourceIndex.value == undefined) return;

      const remoteSource = remoteSources.value[selectedRemoteSourceIndex.value];

      const path = userAddLinkedAccountLink(
        user.value?.username,
        remoteSource.name
      );
      router.push(path);
    };

    const createUserToken = async () => {
      if (!user.value) return;
      if (!newTokenName.value) return;

      resetErrors();

      try {
        const tokenResponse = await api.createUserToken(
          user.value.username,
          newTokenName.value
        );
        token.value = tokenResponse.token;
        newTokenName.value = undefined;

        await refreshUser();
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        createUserTokenError.value = e;
      }
    };

    const closeNewTokenNotification = () => {
      token.value = undefined;
    };

    const deleteUserToken = async (tokenname: string) => {
      if (!user.value) return;

      resetErrors();

      try {
        await api.deleteUserToken(user.value.username, tokenname);

        await refreshUser();
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        deleteUserTokenError.value = e;
      }
    };

    const deleteLinkedAccount = async (la: LinkedAccountResponse) => {
      if (!user.value) return;

      resetErrors();

      try {
        await api.deleteUserLinkedAccount(user.value.username, la.id);

        await refreshUser();
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        deleteLinkedAccountError.value = e;
      }
    };

    watch(
      () => route.fullPath,
      () => {
        user.value = undefined;
        remoteSources.value = undefined;
        token.value = undefined;
        newTokenName.value = undefined;

        update();
      },
      { immediate: true }
    );

    return {
      createUserTokenError: computed(() =>
        errorToString(createUserTokenError.value)
      ),
      deleteUserTokenError: computed(() =>
        errorToString(deleteUserTokenError.value)
      ),
      deleteLinkedAccountError: computed(() =>
        errorToString(deleteLinkedAccountError.value)
      ),
      user,
      remoteSources,
      token,
      newTokenName,
      selectedRemoteSourceIndex,

      laRemoteSourceName,
      addLinkedAccount,
      deleteLinkedAccount,
      createUserToken,
      deleteUserToken,
      closeNewTokenNotification,
    };
  },
});
</script>
