<template>
  <div>
    <div
      v-if="registerUserError"
      class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <span class="block sm:inline">{{ registerUserError }}</span>
    </div>
    <div v-if="registerUser" class="my-6 flex justify-center items-center">
      <div>
        <RegisterForm
          :remote-username="registerUser.remoteUserInfo.loginName"
          :username="registerUser.remoteUserInfo.loginName"
          @register="
            (username) => {
              registerUser &&
                doRegister(
                  registerUser.remoteSourceName,
                  username,
                  registerUser.remoteSourceLoginName,
                  registerUser.remoteSourceLoginPassword
                );
            }
          "
        />
      </div>
    </div>
    <template v-else-if="fetchedRemoteSources">
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
        v-else-if="!hasRegisterRemoteSources"
        class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      >
        No remote sources enabled for registration
      </div>
      <div v-else>
        <div
          class="my-6 flex justify-center items-center"
          v-for="rs in remoteSources"
          v-bind:key="rs.id"
        >
          <div v-if="rs.registrationEnabled">
            <LoginForm
              action="Register"
              :name="rs.name"
              v-if="rs.authType == 'password'"
              @login="
                (username, password) => doAuthorize(rs.name, username, password)
              "
            />
            <div v-else class="w-full max-w-xs">
              <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div class="flex justify-center">
                  <button class="btn btn-blue" @click="doAuthorize(rs.name)">
                    Register with {{ rs.name }}
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
import { computed, defineComponent, onUnmounted, Ref, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ApiError, errorToString, useAPI } from '../app/api';
import { useAppState } from '../app/appstate';
import { useAuth } from '../app/auth';
import LoginForm from '../components/loginform.vue';
import RegisterForm from '../components/registerform.vue';

export default defineComponent({
  name: 'Register',
  components: {
    LoginForm,
    RegisterForm,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const appState = useAppState();
    const api = useAPI();
    const auth = useAuth();

    let fetchAbort = new AbortController();

    const registerUserError: Ref<unknown | undefined> = ref();

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
      registerUserError.value = undefined;
    };

    const fetchRemoteSources = async () => {
      try {
        return await api.getRemoteSources();
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        appState.setGlobalError(e);
      }
    };

    const {
      state: remoteSources,
      isReady: fetchedRemoteSources,
      execute: refreshRemoteSources,
    } = useAsyncState(
      async () => {
        return await fetchRemoteSources();
      },
      undefined,
      { immediate: false, shallow: false }
    );

    const hasRemoteSources = computed(() => {
      if (!remoteSources.value) return false;

      return remoteSources.value.length > 0;
    });

    const hasRegisterRemoteSources = computed(() => {
      if (!remoteSources.value) return false;

      for (const rs of remoteSources.value) {
        if (rs.registrationEnabled) {
          return true;
        }
      }
      return false;
    });

    const doAuthorize = async (
      remoteSourceName: string,
      username?: string,
      password?: string
    ) => {
      resetErrors();

      try {
        await auth.authorize(remoteSourceName, username, password);
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        registerUserError.value = e;
      }
    };

    const doRegister = async (
      remoteSourceName: string,
      username: string,
      remoteLoginName?: string,
      remoteLoginPassword?: string
    ) => {
      resetErrors();

      try {
        await api.register(
          remoteSourceName,
          username,
          remoteLoginName,
          remoteLoginPassword,
          fetchAbort.signal
        );

        router.push({ name: 'home' });
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        registerUserError.value = e;
      }
    };

    watch(
      () => route.fullPath,
      () => {
        update();
      },
      { immediate: true }
    );

    return {
      registerUserError: computed(() => errorToString(registerUserError.value)),
      registerUser: computed(() => auth.registerUser.value),
      remoteSources,
      fetchedRemoteSources,
      hasRemoteSources,
      hasRegisterRemoteSources,

      doAuthorize,
      doRegister,
    };
  },
});
</script>
