<template>
  <div v-if="project">
    <div class="panel">
      <p class="panel-title">Project Settings</p>
      <div class="p-4">
        <div class="mb-4">
          <label class="block font-bold mb-2">Project Name</label>
          <input
            class="appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            placeholder="Project Name"
            v-model="project.name"
            data-test="projectNameInput"
          />
        </div>
        <div class="mb-4">
          <label>
            <input
              type="checkbox"
              v-model="projectIsPrivate"
              data-test="projectIsPrivateInput"
            />
            Private
          </label>
        </div>
        <div class="mb-4" v-if="ownertype === 'org'">
          <label>
            <input
              type="checkbox"
              v-model="project.membersCanPerformRunActions"
              data-test="membersCanPerformRunActions"
            />
            Members can perform run action (restart, stop and cancel a run)
          </label>
        </div>
        <div class="mb-4">
          <label>
            <input
              type="checkbox"
              v-model="project.passVarsToForkedPR"
              data-test="projectPassVarsToForkedPRInput"
            />
            Pass variables to run even if triggered by PR from forked repo
            (DANGEROUS)
          </label>
        </div>
        <button
          class="btn btn-blue"
          @click="updateProject()"
          data-test="updateProjectButton"
        >
          Update
        </button>
        <div
          v-if="updateProjectError"
          class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span class="block sm:inline">{{ updateProjectError }}</span>
        </div>
      </div>
    </div>

    <div class="panel">
      <p class="panel-title">Secrets</p>
      <div class="p-4">
        <projectsecrets
          v-if="secrets && allSecrets"
          :secrets="secrets"
          :allSecrets="allSecrets"
          :ownertype="ownertype"
          :ownername="ownername"
          :projectref="projectref"
          refType="project"
          @delete-secret="handleDeleteSecret"
        />
      </div>
    </div>

    <div class="panel">
      <p class="panel-title">Variables</p>
      <div class="p-4">
        <projectvars
          v-if="variables && allVariables"
          :variables="variables"
          :allVariables="allVariables"
          refType="project"
        />
      </div>
    </div>

    <div class="panel">
      <p class="panel-title">Danger Zone</p>
      <div class="p-4">
        <h4 class="mb-4 title text-xl">Delete This Project</h4>
        <div
          class="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded"
          role="alert"
        >
          <p>
            This operation
            <strong>CANNOT</strong> be undone. This operation will remove
            <strong>{{ projectPath }}</strong>
          </p>
        </div>
        <label class="block mb-2">
          Please type the project name for confirmation:
          <span class="text-red-500 font-bold">{{ projectName }}</span>
        </label>
        <div class="mb-4">
          <input
            class="appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
            v-model="projectNameToDelete"
            type="email"
            placeholder="Project name to delete"
          />
        </div>
        <button
          class="btn btn-red"
          @click="deleteProject()"
          :disabled="!deleteButtonEnabled"
        >
          Delete Project
        </button>

        <div
          v-if="deleteProjectError"
          class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span class="block sm:inline">{{ deleteProjectError }}</span>
        </div>
      </div>
      <div class="p-4 border-t">
        <h4 class="mb-4 title text-xl">
          Change remote repository linked account
        </h4>
        <div
          class="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded"
          role="alert"
        >
          <p>
            This operation will change the linked account associated with the
            project remote repository to the current user linked account
          </p>
        </div>
        <button class="btn btn-red" @click="updateRepoLinkedAccount()">
          Change
        </button>

        <div
          v-if="updateRepoLinkedAccountError"
          class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span class="block sm:inline">{{
            updateRepoLinkedAccountError
          }}</span>
        </div>
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
  Ref,
  ref,
  toRefs,
  watch,
} from 'vue';
import { useRouter } from 'vue-router';
import { ApiError, errorToString, useAPI, Visibility } from '../app/api';
import { useAppState } from '../app/appstate';
import { projectGroupLink, projectSettingsLink } from '../util/link';
import projectsecrets from './projectsecrets.vue';
import projectvars from './projectvars.vue';

export default defineComponent({
  components: { projectsecrets, projectvars },
  name: 'projectsettings',
  props: {
    ownertype: {
      type: String,
      required: true,
    },
    ownername: {
      type: String,
      required: true,
    },
    projectref: { type: Array as PropType<Array<string>>, required: true },
  },
  setup(props) {
    const { ownertype, ownername, projectref } = toRefs(props);

    const router = useRouter();
    const appState = useAppState();
    const api = useAPI();

    let fetchAbort = new AbortController();

    const projectNameToDelete = ref('');
    const updateProjectError: Ref<unknown | undefined> = ref();
    const deleteProjectError: Ref<unknown | undefined> = ref();
    const updateRepoLinkedAccountError: Ref<unknown | undefined> = ref();
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

      refreshProject();
      refreshSecrets();
      refreshAllSecrets();
      refreshVariables();
      refreshAllVariables();
    };

    const projectName = computed(() => {
      return projectref.value[projectref.value.length - 1];
    });

    const projectPath = computed(() => {
      return ['', ownertype.value, ownername.value, ...projectref.value].join(
        '/'
      );
    });

    const apiProjectRef = computed(() => {
      return [ownertype.value, ownername.value, ...projectref.value].join('/');
    });

    const deleteButtonEnabled = computed(() => {
      return projectNameToDelete.value == projectName.value;
    });

    const resetErrors = () => {
      updateProjectError.value = undefined;
      deleteProjectError.value = undefined;
      updateRepoLinkedAccountError.value = undefined;
    };

    const updateProject = async () => {
      if (!project.value) return;

      resetErrors();

      try {
        await api.updateProject(
          apiProjectRef.value,
          project.value.name,
          project.value.visibility,
          project.value.passVarsToForkedPR,
          project.value.membersCanPerformRunActions
        );

        const newProjectRef = projectref.value.slice(0, -1);
        newProjectRef.push(project.value.name);

        router.push(
          projectSettingsLink(ownertype.value, ownername.value, newProjectRef)
        );
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        updateProjectError.value = e;
      }
    };

    const deleteProject = async () => {
      resetErrors();

      if (projectNameToDelete.value != projectName.value) {
        return;
      }

      try {
        await api.deleteProject(apiProjectRef.value);
        router.push(
          projectGroupLink(
            ownertype.value,
            ownername.value,
            projectref.value.slice(0, -1)
          )
        );
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        deleteProjectError.value = e;
      }
    };

    const updateRepoLinkedAccount = async () => {
      resetErrors();

      try {
        await api.projectUpdateRepoLinkedAccount(apiProjectRef.value);
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        updateRepoLinkedAccountError.value = e;
      }
    };

    const fetchProject = async () => {
      try {
        return await api.getProject(apiProjectRef.value, fetchAbort.signal);
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        appState.setGlobalError(e);
      }
    };

    const {
      state: project,
      // isReady: fetchedProject,
      execute: refreshProject,
    } = useAsyncState(
      async () => {
        return await fetchProject();
      },
      undefined,
      { immediate: false, shallow: false }
    );

    const handleDeleteSecret = () => {
      refreshSecrets();
      refreshAllSecrets();
    };

    const fetchSecrets = async () => {
      try {
        return await api.getSecrets(
          'project',
          apiProjectRef.value,
          false,
          fetchAbort.signal
        );
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        appState.setGlobalError(e);
      }
    };

    const {
      state: secrets,
      // isReady: fetchedSecrets,
      execute: refreshSecrets,
    } = useAsyncState(
      async () => {
        return await fetchSecrets();
      },
      undefined,
      { immediate: false }
    );

    const fetchAllSecrets = async () => {
      try {
        return await api.getSecrets(
          'project',
          apiProjectRef.value,
          true,
          fetchAbort.signal
        );
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        appState.setGlobalError(e);
      }
    };

    const {
      state: allSecrets,
      // isReady: fetchedAllSecrets,
      execute: refreshAllSecrets,
    } = useAsyncState(
      async () => {
        return await fetchAllSecrets();
      },
      undefined,
      { immediate: false }
    );

    const fetchVariables = async () => {
      try {
        return await api.getVariables(
          'project',
          apiProjectRef.value,
          false,
          fetchAbort.signal
        );
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        appState.setGlobalError(e);
      }
    };

    const {
      state: variables,
      // isReady: fetchedVariables,
      execute: refreshVariables,
    } = useAsyncState(
      async () => {
        return await fetchVariables();
      },
      undefined,
      { immediate: false }
    );

    const fetchAllVariables = async () => {
      try {
        return await api.getVariables(
          'project',
          apiProjectRef.value,
          true,
          fetchAbort.signal
        );
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        appState.setGlobalError(e);
      }
    };

    const {
      state: allVariables,
      // isReady: fetchedAllVariables,
      execute: refreshAllVariables,
    } = useAsyncState(
      async () => {
        return await fetchAllVariables();
      },
      undefined,
      { immediate: false }
    );

    const projectIsPrivate: Ref<boolean> = computed({
      get() {
        return project.value?.visibility == Visibility.Private;
      },

      set(isPrivate: boolean) {
        if (!project.value) return;

        if (isPrivate) {
          project.value.visibility = Visibility.Private;
        } else {
          project.value.visibility = Visibility.Public;
        }
      },
    });

    watch(
      props,
      () => {
        project.value = undefined;
        secrets.value = undefined;
        allSecrets.value = undefined;
        variables.value = undefined;
        allVariables.value = undefined;

        update();
      },
      { immediate: true }
    );

    return {
      updateProjectError: computed(() =>
        errorToString(updateProjectError.value)
      ),
      deleteProjectError: computed(() =>
        errorToString(deleteProjectError.value)
      ),
      updateRepoLinkedAccountError: computed(() =>
        errorToString(updateRepoLinkedAccountError.value)
      ),
      projectPath,
      projectName,
      project,
      secrets,
      allSecrets,
      variables,
      allVariables,
      deleteButtonEnabled,
      projectIsPrivate,
      projectNameToDelete,
      Visibility,
      membersCanPerformRunActions,

      handleDeleteSecret,
      updateProject,
      deleteProject,
      updateRepoLinkedAccount,
    };
  },
});
</script>
