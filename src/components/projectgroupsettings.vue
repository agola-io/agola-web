<template>
  <div v-if="projectGroup">
    <div class="panel">
      <p class="panel-title">Project Group Settings</p>
      <div class="p-4">
        <div v-if="!isRootProjectGroup" class="mb-4">
          <label class="block font-bold mb-2">Project Group Name</label>
          <div class="control">
            <input
              class="appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="Project Group Name"
              v-model="projectGroup.name"
            />
          </div>
        </div>
        <div class="mb-4">
          <label>
            <input type="checkbox" v-model="projectGroupIsPrivate" />
            Private
          </label>
        </div>
        <button class="btn btn-blue" @click="updateProjectGroup()">
          Update
        </button>

        <div
          v-if="updateProjectGroupError"
          class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span class="block sm:inline">{{ updateProjectGroupError }}</span>
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
          :projectref="projectgroupref"
          @secret-deleted="handleSecretDeleted"
          refType="projectgroup"
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
          :ownertype="ownertype"
          :ownername="ownername"
          :projectref="projectgroupref"
          @variable-deleted="handleVariableDeleted"
          refType="projectgroup"
        />
      </div>
    </div>

    <div v-if="!isRootProjectGroup" class="panel">
      <p class="panel-title">Danger Zone</p>
      <div class="p-4">
        <h4 class="mb-4 title text-xl">Delete This Project Group</h4>
        <div
          class="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded"
          role="alert"
        >
          <p>
            This operation
            <strong>CANNOT</strong> be undone. This operation will remove
            <strong>{{ projectGroupPath }}</strong>
          </p>
        </div>
        <label class="block mb-2">
          Please type the project group name for confirmation:
          <span class="text-red-500 font-bold">{{ projectGroupName }}</span>
        </label>
        <div class="mb-4">
          <input
            class="appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
            v-model="projectGroupNameToDelete"
            type="email"
            placeholder="Project Group name to delete"
          />
        </div>
        <button
          class="btn btn-red"
          @click="deleteProjectGroup()"
          :disabled="!deleteButtonEnabled"
        >
          Delete Project Group
        </button>
      </div>
    </div>
    <div
      v-if="deleteProjectGroupError"
      class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <span class="block sm:inline">{{ deleteProjectGroupError }}</span>
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
import { ApiError, errorToString, useAPI, Visibility } from '../app/api';
import { useAppState } from '../app/appstate';
import { projectGroupLink, projectGroupSettingsLink } from '../util/link';
import projectsecrets from './projectsecrets.vue';
import projectvars from './projectvars.vue';

export default defineComponent({
  components: { projectsecrets, projectvars },
  name: 'projectgroupsettings',
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

    const projectGroupNameToDelete = ref('');
    const updateProjectGroupError: Ref<unknown | undefined> = ref();
    const deleteProjectGroupError: Ref<unknown | undefined> = ref();

    onUnmounted(() => {
      fetchAbort.abort();
    });

    const abortFetch = () => {
      fetchAbort.abort();
      fetchAbort = new AbortController();
    };

    const update = async () => {
      abortFetch();

      refreshProjectGroup();
      refreshSecrets();
      refreshAllSecrets();
      refreshVariables();
      refreshAllVariables();
    };

    const projectGroupName = computed(() => {
      return projectgroupref.value[projectgroupref.value.length - 1];
    });

    const projectGroupPath = computed(() => {
      return [
        '',
        ownertype.value,
        ownername.value,
        ...projectgroupref.value,
      ].join('/');
    });

    const apiProjectGroupRef = computed(() => {
      return [ownertype.value, ownername.value, ...projectgroupref.value].join(
        '/'
      );
    });

    const deleteButtonEnabled = computed(() => {
      return projectGroupNameToDelete.value == projectGroupName.value;
    });

    const resetErrors = () => {
      updateProjectGroupError.value = undefined;
      deleteProjectGroupError.value = undefined;
    };

    const handleSecretDeleted = () => {
      refreshSecrets();
      refreshAllSecrets();
    };

    const handleVariableDeleted = () => {
      refreshVariables();
      refreshAllVariables();
    };

    const isRootProjectGroup = computed(() => {
      return projectgroupref.value.length == 0;
    });

    const updateProjectGroup = async () => {
      if (!projectGroup.value) return;

      resetErrors();

      try {
        await api.updateProjectGroup(
          apiProjectGroupRef.value,
          projectGroup.value.name,
          projectGroup.value.visibility
        );

        const newProjectGroupRef = projectgroupref.value.slice(0, -1);
        newProjectGroupRef.push(projectGroup.value.name);

        router.push(
          projectGroupSettingsLink(
            ownertype.value,
            ownername.value,
            newProjectGroupRef
          )
        );
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        updateProjectGroupError.value = e;
      }
    };

    const deleteProjectGroup = async () => {
      resetErrors();

      if (projectGroupNameToDelete.value != projectGroupName.value) {
        return;
      }

      try {
        await api.deleteProjectGroup(apiProjectGroupRef.value);
        router.push(
          projectGroupLink(
            ownertype.value,
            ownername.value,
            projectgroupref.value.slice(0, -1)
          )
        );
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        deleteProjectGroupError.value = e;
      }
    };

    const fetchProjectGroup = async () => {
      try {
        return await api.getProjectGroup(
          apiProjectGroupRef.value,
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
      state: projectGroup,
      // isReady: fetchedProjectGroup,
      execute: refreshProjectGroup,
    } = useAsyncState(
      async () => {
        return await fetchProjectGroup();
      },
      undefined,
      { immediate: false, shallow: false }
    );

    const fetchSecrets = async () => {
      try {
        return await api.getSecrets(
          'projectgroup',
          apiProjectGroupRef.value,
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
          'projectgroup',
          apiProjectGroupRef.value,
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
          'projectgroup',
          apiProjectGroupRef.value,
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
          'projectgroup',
          apiProjectGroupRef.value,
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

    const projectGroupIsPrivate: Ref<boolean> = computed({
      get() {
        return projectGroup.value?.visibility == Visibility.Private;
      },

      set(isPrivate: boolean) {
        if (!projectGroup.value) return;

        if (isPrivate) {
          projectGroup.value.visibility = Visibility.Private;
        } else {
          projectGroup.value.visibility = Visibility.Public;
        }
      },
    });

    watch(
      props,
      () => {
        projectGroup.value = undefined;
        secrets.value = undefined;
        allSecrets.value = undefined;
        variables.value = undefined;
        allVariables.value = undefined;

        update();
      },
      { immediate: true }
    );

    return {
      updateProjectGroupError: computed(() =>
        errorToString(updateProjectGroupError.value)
      ),
      deleteProjectGroupError: computed(() =>
        errorToString(deleteProjectGroupError.value)
      ),
      projectGroupPath,
      projectGroupName,
      projectGroup,
      isRootProjectGroup,
      secrets,
      allSecrets,
      variables,
      allVariables,
      deleteButtonEnabled,

      projectGroupIsPrivate,
      projectGroupNameToDelete,
      Visibility,
      handleSecretDeleted,
      handleVariableDeleted,
      updateProjectGroup,
      deleteProjectGroup,
    };
  },
});
</script>
