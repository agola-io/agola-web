<template>
  <div>
    <h4 class="mb-4 text-xl font-bold">Create Project Group</h4>

    <input
      class="mb-4 appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
      type="text"
      placeholder="Project Group Name"
      v-model="projectGroupName"
    />
    <div class="mb-4">
      <label>
        <input type="checkbox" v-model="projectGroupIsPrivate" />
        Private
      </label>
    </div>

    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      v-bind:class="{ spinner: createProjectGroupLoading }"
      :disabled="!createProjectGroupButtonEnabled"
      @click="createProjectGroup()"
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
import { computed, defineComponent, PropType, ref, Ref, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import { ApiError, useAPI } from '../app/api';
import { projectGroupLink } from '../util/link';

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

    const projectGroupName = ref('');
    const projectGroupIsPrivate = ref(false);

    const createProjectGroupError: Ref<unknown | undefined> = ref();

    const createProjectGroupLoading = ref(false);

    const resetErrors = () => {
      createProjectGroupError.value = undefined;
    };

    const createProjectGroup = async () => {
      createProjectGroupLoading.value = true;
      resetErrors();

      let refArray = [ownertype.value, ownername.value];
      if (projectgroupref) {
        refArray = [...refArray, ...projectgroupref.value];
      }
      let parentref = refArray.join('/');

      let visibility = 'public';
      if (projectGroupIsPrivate.value) {
        visibility = 'private';
      }

      try {
        await api.createProjectGroup(
          parentref,
          projectGroupName.value,
          visibility
        );

        let newProjectgroupref = [projectGroupName.value];
        if (projectgroupref.value) {
          newProjectgroupref = projectgroupref.value.concat(
            projectGroupName.value
          );
        }
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

    const createProjectGroupButtonEnabled = computed(() => {
      return projectGroupName.value;
    });

    return {
      createProjectGroupError,
      projectGroupName,
      projectGroupIsPrivate,
      createProjectGroupButtonEnabled,
      createProjectGroupLoading,

      createProjectGroup,
    };
  },
});
</script>
