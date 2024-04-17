<template>
  <div>
    <h4 class="text-xl my-3">Projects</h4>
    <div v-if="!fetchedProjects" class="ml-6 flex w-48">
      <div :class="{ spinner: !fetchedProjects }"></div>
    </div>
    <ul v-else-if="projects && projects.length > 0">
      <li
        class="mb-2 border rounded-l"
        v-for="project in projects"
        :key="project.id"
      >
        <div class="pl-4 py-4 flex items-center">
          <router-link
            class="item"
            :to="projectLink(ownertype, ownername, projectRef(project.name))"
          >
            <span class="font-bold">{{ project.name }}</span>
          </router-link>
        </div>
      </li>
    </ul>
    <div v-else class="font-bold">No projects</div>

    <hr class="my-6 border-t" />

    <h4 class="text-xl my-3">Project Groups</h4>
    <div v-if="!fetchedProjectGroups" class="ml-6 flex w-48">
      <div :class="{ spinner: !fetchedProjectGroups }"></div>
    </div>
    <ul v-else-if="projectGroups && projectGroups.length > 0">
      <li
        class="mb-2 border rounded-l"
        v-for="projectGroup in projectGroups"
        :key="projectGroup.id"
      >
        <div class="pl-4 py-4 flex items-center">
          <router-link
            class="item"
            :to="
              projectGroupLink(
                ownertype,
                ownername,
                projectRef(projectGroup.name)
              )
            "
          >
            <span class="font-bold">{{ projectGroup.name }}</span>
          </router-link>
        </div>
      </li>
    </ul>
    <div v-else class="font-bold">No project groups</div>
  </div>
</template>

<script lang="ts">
import { useAsyncState } from '@vueuse/core';
import { defineComponent, onUnmounted, PropType, toRefs, watch } from 'vue';
import { APIAbortedError, useAPI } from '../app/api';
import { useAppState } from '../app/appstate';
import { projectGroupLink, projectLink } from '../util/link';

export default defineComponent({
  components: {},
  name: 'Projects',
  props: {
    ownertype: {
      type: String,
      required: true,
    },
    ownername: {
      type: String,
      required: true,
    },
    projectgroupref: Array as PropType<Array<string>>,
  },
  setup(props) {
    const { ownertype, ownername, projectgroupref } = toRefs(props);

    const appState = useAppState();
    const api = useAPI();

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

      refreshProjects();
      refreshProjectGroups();
    };

    const projectRef = (name: string): string[] => {
      let ref: string[] = [];
      if (projectgroupref.value) {
        ref = projectgroupref.value.slice(0);
      }
      ref.push(name);
      return ref;
    };

    const fetchProjects = async (ownertype: string, ownername: string) => {
      const ref = [ownertype, ownername];
      if (projectgroupref.value) {
        ref.push(...projectgroupref.value);
      }

      try {
        return await api.getProjectGroupProjects(
          ref.join('/'),
          fetchAbort.signal
        );
      } catch (e) {
        if (e instanceof APIAbortedError) return;
        appState.setGlobalError(e);
      }
    };

    const fetchProjectGroups = async (ownertype: string, ownername: string) => {
      const ref = [ownertype, ownername];
      if (projectgroupref.value) {
        ref.push(...projectgroupref.value);
      }

      try {
        return await api.getProjectGroupSubgroups(
          ref.join('/'),
          fetchAbort.signal
        );
      } catch (e) {
        if (e instanceof APIAbortedError) return;
        appState.setGlobalError(e);
      }
    };

    const {
      state: projects,
      isReady: fetchedProjects,
      execute: refreshProjects,
    } = useAsyncState(
      async () => {
        return await fetchProjects(ownertype.value, ownername.value);
      },
      undefined,
      { immediate: false, shallow: false }
    );

    const {
      state: projectGroups,
      isReady: fetchedProjectGroups,
      execute: refreshProjectGroups,
    } = useAsyncState(
      async () => {
        return await fetchProjectGroups(ownertype.value, ownername.value);
      },
      undefined,
      { immediate: false, shallow: false }
    );

    watch(
      props,
      () => {
        projects.value = undefined;
        projectGroups.value = undefined;

        update();
      },
      { immediate: true }
    );

    return {
      fetchedProjects,
      fetchedProjectGroups,

      projects,
      projectGroups,

      projectLink,
      projectGroupLink,

      projectRef,
    };
  },
});
</script>
