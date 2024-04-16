<template>
  <div>
    <h4 class="mb-4 text-xl font-bold">Create Project</h4>

    <input
      class="mb-4 appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
      type="text"
      placeholder="Project Name"
      v-model.trim="projectName"
      @input="validateProjectName"
      data-test="projectName"
    />
    <div v-if="projectNameError" class="text-red-500 text-sm">
      {{ projectNameError }}
    </div>
    <div class="mb-4">
      <label>
        <input
          type="checkbox"
          v-model="projectIsPrivate"
          data-test="projectIsPrivate"
        />
        Private
      </label>
    </div>
    <div class="mb-4" v-if="ownertype === 'org'">
      <label>
        <input
          type="checkbox"
          v-model="membersCanPerformRunActions"
          data-test="membersCanPerformRunActions"
        />
        Members can perform run action (restart, stop and cancel a run)
      </label>
    </div>
    <div class="mb-4">
      <label>
        <input
          type="checkbox"
          v-model="passVarsToForkedPR"
          data-test="passVarsToForkedPR"
        />
        Pass variables to run even if triggered by PR from forked repo
        (DANGEROUS)
      </label>
    </div>
    <div class="mb-3 flex items-center">
      <div class="flex relative w-64">
        <select
          class="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
          v-model="selectedRemoteSourceIndex"
          data-test="selectedRemoteSourceIndex"
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
        type="button"
        class="ml-3 btn btn-blue"
        :class="{ spinner: fetchRemoteReposLoading }"
        :disabled="selectedRemoteSourceIndex == null"
        @click="refreshRemoteRepos()"
        data-test="selectedRemoteSourceIndexButton"
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
        type="button"
        class="btn btn-blue"
        :class="{
          'opacity-50 cursor-not-allowed': isSaveButtonDisabled,
          spinner: createProjectLoading,
        }"
        :disabled="isSaveButtonDisabled"
        @click="createProject()"
        data-test="createProjectButton"
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
import { APIAbortedError, errorToString, useAPI } from '../app/api';
import { useAppState } from '../app/appstate';
import remoterepos from '../components/remoterepos.vue';
import { projectLink } from '../util/link';
import { getAllRemoteSources } from '../util/remotesource';
import { isValid, isValidName } from '../util/validator';

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

    const projectNameError: Ref<string | undefined> = ref();

    const createProjectError: Ref<unknown | undefined> = ref();

    const createProjectLoading = ref(false);
    const fetchRemoteReposLoading = ref(false);
    const membersCanPerformRunActions = ref(false);

    onUnmounted(() => {
      fetchAbort.abort();
    });

    const abortFetch = () => {
      fetchAbort.abort();
      fetchAbort = new AbortController();
    };

    const update = async () => {
      abortFetch();

      await refreshRemoteSources();
      await refreshProjects();
    };

    const apiParentProjectGroupRef = computed(() => {
      return [ownertype.value, ownername.value, ...projectgroupref.value].join(
        '/'
      );
    });

    const fetchProjects = async () => {
      try {
        return await api.getProjectGroupProjects(
          apiParentProjectGroupRef.value,
          fetchAbort.signal
        );
      } catch (e) {
        if (e instanceof APIAbortedError) return;
        appState.setGlobalError(e);
      }
    };

    const { state: projects, execute: refreshProjects } = useAsyncState(
      async () => {
        return await fetchProjects();
      },
      undefined,
      { immediate: false, shallow: false }
    );

    const fetchRemoteSources = async () => {
      try {
        return await getAllRemoteSources(api);
      } catch (e) {
        if (e instanceof APIAbortedError) return;
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
        if (e instanceof APIAbortedError) return;
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

    const isSaveButtonDisabled = computed(() => {
      return !isValid(projectNameValidator()) || !remoteRepoPath.value;
    });

    const projectNameValidator = () => {
      const projectNameUnique =
        projects.value &&
        !projects.value.some((project) => {
          return project.name === projectName.value;
        });

      if (!projectName.value) {
        return 'Project name is required';
      } else if (!isValidName(projectName.value)) {
        return 'Project name can only contain alphanumeric ASCII chars and optionally some single hypens in the middle';
      } else if (!projectNameUnique) {
        return 'Project with the specified name already exists';
      }
    };

    const validateProjectName = () => {
      projectNameError.value = projectNameValidator();
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

      let visibility = 'public';
      if (projectIsPrivate.value) {
        visibility = 'private';
      }

      const remoteSource = remoteSources.value[selectedRemoteSourceIndex.value];

      try {
        await api.createProject(
          apiParentProjectGroupRef.value,
          projectName.value,
          visibility,
          remoteSource.name,
          remoteRepoPath.value,
          passVarsToForkedPR.value,
          membersCanPerformRunActions.value
        );

        let newProjectref = [projectName.value];
        newProjectref = projectgroupref.value.concat(projectName.value);

        router.push(
          projectLink(ownertype.value, ownername.value, newProjectref)
        );
      } catch (e) {
        if (e instanceof APIAbortedError) return;
        createProjectError.value = e;
      } finally {
        createProjectLoading.value = false;
      }
    };

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
        membersCanPerformRunActions.value = false;

        update();
      },
      { immediate: true }
    );

    return {
      projectName,
      projectNameError,
      projectIsPrivate,
      remoteSources,
      remoteRepos,
      passVarsToForkedPR,
      selectedRemoteSourceIndex,

      createProjectError: computed(() =>
        errorToString(createProjectError.value)
      ),

      isSaveButtonDisabled,

      validateProjectName,
      createProjectLoading,
      fetchRemoteReposLoading,
      membersCanPerformRunActions,

      refreshRemoteRepos,
      repoSelected,
      createProject,
    };
  },
});
</script>
