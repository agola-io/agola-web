<template>
  <div>
    <h4 class="mb-4 text-xl font-bold">Create Project</h4>

    <input
      class="mb-4 appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
      type="text"
      placeholder="Project Name"
      v-model="projectName"
    />
    <div class="mb-4">
      <label>
        <input type="checkbox" v-model="projectIsPrivate" />
        Private
      </label>
    </div>
    <div class="mb-4">
      <label>
        <input type="checkbox" v-model="passVarsToForkedPR" />
        Pass variables to run even if triggered by PR from forked repo
        (DANGEROUS)
      </label>
    </div>
    <div class="mb-3 flex items-center">
      <div class="flex relative w-64">
        <select
          class="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
          v-model="selectedRemoteSourceIndex"
        >
          <option :value="undefined" disabled>Select the remote source</option>
          <option
            v-for="(rs, index) in remoteSources"
            :key="rs.id"
            :value="index"
          >
            {{ rs.name }}
          </option>
        </select>
      </div>
      <button
        class="ml-3 btn btn-blue"
        :class="{ spinner: fetchRemoteReposLoading }"
        :disabled="selectedRemoteSourceIndex == null"
        @click="refreshRemoteRepos()"
      >
        Fetch remote repositories
      </button>
    </div>

    <div v-if="remoteRepos && remoteRepos.length">
      <h4 class="text-xl">Available remote repositories</h4>
      <remoterepos
        :remoterepos="remoteRepos"
        v-on:reposelected="repoSelected($event)"
      />
      <button
        class="btn btn-blue"
        :class="{ spinner: createProjectLoading }"
        :disabled="!createProjectButtonEnabled"
        @click="createProject()"
      >
        Create Project
      </button>
      <div
        v-if="createProjectError"
        class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <span class="block sm:inline">{{ createProjectError }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useAsyncState } from '@vueuse/core';
import { getAllRemoteSources } from '../util/remotesource';
import {
  computed,
  defineComponent,
  onUnmounted,
  PropType,
  ref,
  Ref,
  toRefs,
  watch,
} from 'vue';
import { useRouter } from 'vue-router';
import { ApiError, errorToString, useAPI } from '../app/api';
import { useAppState } from '../app/appstate';
import remoterepos from '../components/remoterepos.vue';
import { projectLink } from '../util/link';

export default defineComponent({
  components: { remoterepos },
  name: 'createproject',
  props: {
    ownertype: {
      type: String,
      required: true,
    },
    ownername: {
      type: String,
      required: true,
    },
    projectgroupref: { type: Array as PropType<Array<string>>, required: true },
  },
  setup(props) {
    const { ownertype, ownername, projectgroupref } = toRefs(props);

    const router = useRouter();
    const appState = useAppState();
    const api = useAPI();

    let fetchAbort = new AbortController();

    const selectedRemoteSourceIndex: Ref<number | undefined> = ref();
    const remoteRepoPath: Ref<string | undefined> = ref();
    const projectName = ref('');
    const projectIsPrivate = ref(false);
    const passVarsToForkedPR = ref(false);

    const createProjectError: Ref<unknown | undefined> = ref();

    const createProjectLoading = ref(false);
    const fetchRemoteReposLoading = ref(false);

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
      createProjectError.value = undefined;
    };

    const createProject = async () => {
      if (remoteSources.value == undefined) return;
      if (selectedRemoteSourceIndex.value == undefined) return;
      if (!remoteRepoPath.value) return;

      createProjectLoading.value = true;
      resetErrors();

      let refArray = [ownertype.value, ownername.value];
      if (projectgroupref.value) {
        refArray = [...refArray, ...projectgroupref.value];
      }
      const parentref = refArray.join('/');

      let visibility = 'public';
      if (projectIsPrivate.value) {
        visibility = 'private';
      }

      const remoteSource = remoteSources.value[selectedRemoteSourceIndex.value];

      try {
        await api.createProject(
          parentref,
          projectName.value,
          visibility,
          remoteSource.name,
          remoteRepoPath.value,
          passVarsToForkedPR.value
        );

        let newProjectref = [projectName.value];
        if (projectgroupref.value) {
          newProjectref = projectgroupref.value.concat(projectName.value);
        }
        router.push(
          projectLink(ownertype.value, ownername.value, newProjectref)
        );
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        createProjectError.value = e;
      } finally {
        createProjectLoading.value = false;
      }
    };

    const createProjectButtonEnabled = computed(() => {
      return projectName.value && remoteRepoPath.value;
    });

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

    const fetchRemoteRepos = async () => {
      if (remoteSources.value == undefined) return;
      if (selectedRemoteSourceIndex.value == undefined) return;

      fetchRemoteReposLoading.value = true;
      try {
        const remoteSource =
          remoteSources.value[selectedRemoteSourceIndex.value];
        return await api.getUserRemoteRepos(remoteSource.id);
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        appState.setGlobalError(e);
      } finally {
        fetchRemoteReposLoading.value = false;
      }
    };

    const {
      state: remoteRepos,
      // isReady: fetchedRemoteRepos,
      execute: refreshRemoteRepos,
    } = useAsyncState(
      async () => {
        return await fetchRemoteRepos();
      },
      undefined,
      { immediate: false, shallow: false }
    );

    const repoSelected = (repoPath: string) => {
      remoteRepoPath.value = repoPath;
    };

    watch(
      props,
      () => {
        remoteSources.value = undefined;
        remoteRepos.value = undefined;
        remoteRepoPath.value = undefined;
        projectName.value = '';
        projectIsPrivate.value = false;
        passVarsToForkedPR.value = false;

        update();
      },
      { immediate: true }
    );

    return {
      createProjectError: computed(() =>
        errorToString(createProjectError.value)
      ),
      remoteSources,
      remoteRepos,
      projectName,
      projectIsPrivate,
      passVarsToForkedPR,
      selectedRemoteSourceIndex,
      createProjectButtonEnabled,
      createProjectLoading,
      fetchRemoteReposLoading,

      refreshRemoteRepos,
      repoSelected,
      createProject,
    };
  },
});
</script>
