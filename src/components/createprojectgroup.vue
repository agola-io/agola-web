<template>
  <div>
    <h4 class="mb-4 text-xl font-bold">Create Project Group</h4>

    <input
      class="mb-4 appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
      type="text"
      placeholder="Project Group Name"
      v-model.trim="projectGroupName"
      @input="validateProjectGroupName"
      data-test="projectGroupName"
    />
    <div v-if="projectGroupNameError" class="text-red-500 text-sm">
      {{ projectGroupNameError }}
    </div>
    <div class="mb-4">
      <label>
        <input
          type="checkbox"
          v-model="projectGroupIsPrivate"
          data-test="projectGroupIsPrivate"
        />
        Private
      </label>
    </div>

    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      :class="{
        'opacity-50 cursor-not-allowed': isSaveButtonDisabled,
        spinner: createProjectGroupLoading,
      }"
      :disabled="isSaveButtonDisabled"
      @click="createProjectGroup()"
      data-test="createProjectGroupButton"
    >
      Create ProjectGroup
    </button>
    <div
      v-if="createProjectGroupError"
      class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <span class="block sm:inline">{{ createProjectGroupError }}</span>
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
import { ApiError, errorToString, useAPI } from '../app/api';
import { useAppState } from '../app/appstate';
import { projectGroupLink } from '../util/link';
import { isValid, isValidName } from '../util/validator';

export default defineComponent({
  components: {},
  name: 'createprojectgroup',
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
    const api = useAPI();
    const appState = useAppState();

    const projectGroupName = ref('');
    const projectGroupIsPrivate = ref(false);

    const projectGroupNameError: Ref<string | undefined> = ref();

    const createProjectGroupError: Ref<unknown | undefined> = ref();

    const createProjectGroupLoading = ref(false);

    let fetchAbort = new AbortController();

    onUnmounted(() => {
      fetchAbort.abort();
    });

    const abortFetch = () => {
      fetchAbort.abort();
      fetchAbort = new AbortController();
    };

    const update = async () => {
      abortFetch();

      await refreshProjectGroups();
    };

    const apiParentProjectGroupRef = computed(() => {
      return [ownertype.value, ownername.value, ...projectgroupref.value].join(
        '/'
      );
    });

    const fetchProjectGroups = async () => {
      try {
        return await api.getProjectGroupSubgroups(
          apiParentProjectGroupRef.value,
          fetchAbort.signal
        );
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        appState.setGlobalError(e);
      }
    };

    const { state: projectGroups, execute: refreshProjectGroups } =
      useAsyncState(
        async () => {
          return await fetchProjectGroups();
        },
        undefined,
        { immediate: false, shallow: false }
      );

    const isSaveButtonDisabled = computed(() => {
      return !isValid(projectGroupNameValidator());
    });

    const projectGroupNameValidator = () => {
      const projectGroupNameUnique =
        projectGroups.value &&
        !projectGroups.value.some((projectGroup) => {
          return projectGroup.name === projectGroupName.value;
        });

      if (!projectGroupName.value) {
        return 'Project Group name is required';
      } else if (!isValidName(projectGroupName.value)) {
        return 'Project Group name can only contain alphanumeric ASCII chars and optionally some single hypens in the middle';
      } else if (!projectGroupNameUnique) {
        return 'Project Group with the specified name already exists';
      }
    };

    const validateProjectGroupName = () => {
      projectGroupNameError.value = projectGroupNameValidator();
    };

    const resetErrors = () => {
      createProjectGroupError.value = undefined;
    };

    const createProjectGroup = async () => {
      createProjectGroupLoading.value = true;
      resetErrors();

      let visibility = 'public';
      if (projectGroupIsPrivate.value) {
        visibility = 'private';
      }

      try {
        await api.createProjectGroup(
          apiParentProjectGroupRef.value,
          projectGroupName.value,
          visibility
        );

        let newProjectgroupref = [projectGroupName.value];
        newProjectgroupref = projectgroupref.value.concat(
          projectGroupName.value
        );
        router.push(
          projectGroupLink(ownertype.value, ownername.value, newProjectgroupref)
        );
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        createProjectGroupError.value = e;
      } finally {
        createProjectGroupLoading.value = false;
      }
    };

    watch(
      props,
      async () => {
        projectGroupName.value = '';
        projectGroupNameError.value = undefined;
        createProjectGroupError.value = undefined;
        update();
      },
      { immediate: true }
    );

    return {
      projectGroupName,
      projectGroupNameError,
      projectGroupIsPrivate,

      createProjectGroupError: computed(() =>
        errorToString(createProjectGroupError.value)
      ),
      isSaveButtonDisabled,

      validateProjectGroupName,
      createProjectGroupLoading,

      createProjectGroup,
    };
  },
});
</script>
