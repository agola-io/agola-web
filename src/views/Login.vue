<template>
  <div>
    <div
      v-if="error"
      class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <span class="block sm:inline">{{ error }}</span>
    </div>
    <template v-if="fetchedRemoteSources">
      <div
        v-if="!hasRemoteSources"
        class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      >
        No remote sources defined
        <router-link class="underline text-blue-600 block" to="/newsource">
          <button class="btn btn-blue">Create one</button>
        </router-link>
      </div>
      <div
        v-else-if="!hasLoginRemoteSources"
        class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      >
        No remote sources enabled for login
      </div>
      <div v-else>
        <div
          class="my-6 flex justify-center items-center"
          v-for="rs in remoteSources"
          :key="rs.id"
        >
          <div v-if="rs.loginEnabled">
            <LoginForm
              action="Login"
              :name="rs.name"
              v-if="rs.authType == 'password'"
              @login="
                (username, password) => doLogin(username, password, rs.name)
              "
            />
            <div v-else class="w-full max-w-xs">
              <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div class="flex justify-center">
                  <button class="btn btn-blue" @click="doLogin(rs.name)">
                    Login with {{ rs.name }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { useAsyncState } from '@vueuse/core';
import { getAllRemoteSources } from '../util/remotesource';
import { computed, defineComponent } from 'vue';
import { ApiError, errorToString, useAPI } from '../app/api';
import { useAppState } from '../app/appstate';
import { useAuth } from '../app/auth';
import LoginForm from '../components/loginform.vue';

export default defineComponent({
  name: 'Login',
  components: {
    LoginForm,
  },
  setup() {
    const appState = useAppState();
    const auth = useAuth();
    const api = useAPI();

    const {
      state: remoteSources,
      isReady: fetchedRemoteSources,
      // execute: refreshRemoteSources,
    } = useAsyncState(async () => {
      try {
        return await getAllRemoteSources(api);
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        appState.setGlobalError(e);
      }
    }, undefined);

    const hasRemoteSources = computed(() => {
      if (!remoteSources.value) return false;

      return remoteSources.value.length > 0;
    });

    const hasLoginRemoteSources = computed(() => {
      if (!remoteSources.value) return false;

      for (const rs of remoteSources.value) {
        if (rs.loginEnabled) {
          return true;
        }
      }

      return false;
    });

    const doLogin = async (
      remoteSourceName: string,
      username?: string,
      password?: string
    ) => {
      try {
        await auth.login(remoteSourceName, username, password);
      } catch (e) {
        appState.setGlobalError(e);
      }
    };

    return {
      error: computed(() => errorToString(appState.globalError.value)),
      remoteSources,
      fetchedRemoteSources,
      hasRemoteSources,
      hasLoginRemoteSources,

      doLogin,
    };
  },
});
</script>
