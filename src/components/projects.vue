<template>
  <div>
    <div class="flex justify-between mb-4 items-center">
      <h4 class="text-xl my-3">Projects</h4>
      <button @click="toggleSortProjects" class="flex items-center relative">
        <i
          class="mdi mdi-sort-alphabetical-variant"
          style="font-size: 24px"
        ></i>
        <i
          v-if="sortOrderProjects === SortOrder.ASC"
          class="absolute right-0 top-2/3 transform -translate-y-1/2 -mt-1.5 ml-1 mdi mdi-arrow-up mr-6"
        ></i>
        <i
          v-if="sortOrderProjects === SortOrder.DESC"
          class="absolute right-0 top-2/3 transform -translate-y-1/2 -mt-1.5 ml-1 mdi mdi-arrow-down mr-6"
        ></i>
      </button>
    </div>
    <div v-if="!fetchedProjects" class="ml-6 flex w-48">
      <div :class="{ spinner: !fetchedProjects }"></div>
    </div>
    <ul
      v-else-if="sortedProjects && sortedProjects.length > 0"
      data-test="projectsSection"
    >
      <li
        class="mb-2 border rounded-l"
        v-for="project in sortedProjects"
        :key="project.id"
      >
        <div class="pl-4 py-4 flex items-center">
          <router-link
            class="item"
            :to="projectLink(ownertype, ownername, projectRef(project.name))"
          >
            <span class="font-bold" data-test="projectsItem">{{
              project.name
            }}</span>
          </router-link>
          <i class="mdi mdi-your-icon-class"></i>
        </div>
      </li>
    </ul>
    <div v-else class="font-bold">No projects</div>

    <hr class="my-6 border-t" />

    <!-- Project Groups Section -->
    <div class="flex justify-between mb-4">
      <h4 class="text-xl my-3">Project Groups</h4>
      <button
        @click="toggleSortProjectGroups"
        class="flex items-center relative"
      >
        <i
          class="mdi mdi-sort-alphabetical-variant"
          style="font-size: 24px"
        ></i>
        <i
          v-if="sortOrderProjectGroups === SortOrder.ASC"
          class="absolute right-0 top-2/3 transform -translate-y-1/2 -mt-1.5 ml-1 mdi mdi-arrow-up mr-6"
        ></i>
        <i
          v-if="sortOrderProjectGroups === SortOrder.DESC"
          class="absolute right-0 top-2/3 transform -translate-y-1/2 -mt-1.5 ml-1 mdi mdi-arrow-down mr-6"
        ></i>
      </button>
    </div>
    <div v-if="!fetchedProjectGroups" class="ml-6 flex w-48">
      <div :class="{ spinner: !fetchedProjectGroups }"></div>
    </div>
    <ul
      v-else-if="sortedProjectGroups && sortedProjectGroups.length > 0"
      data-test="projectsGroupSection"
    >
      <li
        class="mb-2 border rounded-l"
        v-for="projectGroup in sortedProjectGroups"
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
            <span class="font-bold" data-test="projectsGroupItem">{{
              projectGroup.name
            }}</span>
          </router-link>
          <i class="mdi mdi-your-icon-class"></i>
        </div>
      </li>
    </ul>
    <div v-else class="font-bold">No project groups</div>
  </div>
</template>

<script lang="ts">
import { useAsyncState } from '@vueuse/core';
import {
  defineComponent,
  onUnmounted,
  PropType,
  toRefs,
  watch,
  ref,
  computed,
} from 'vue';
import { ApiError, useAPI } from '../app/api';
import { useAppState } from '../app/appstate';
import { projectGroupLink, projectLink } from '../util/link';

enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

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

    const sortOrderProjects = ref<SortOrder>(SortOrder.ASC);
    const sortOrderProjectGroups = ref<SortOrder>(SortOrder.ASC);

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
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
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
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        appState.setGlobalError(e);
      }
    };

    const toggleSortProjects = () => {
      sortOrderProjects.value =
        sortOrderProjects.value === SortOrder.ASC
          ? SortOrder.DESC
          : SortOrder.ASC;
    };

    const toggleSortProjectGroups = () => {
      sortOrderProjectGroups.value =
        sortOrderProjectGroups.value === SortOrder.ASC
          ? SortOrder.DESC
          : SortOrder.ASC;
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

    const sortedProjects = computed(() => {
      const items = projects.value || [];
      return sortItems(items, sortOrderProjects.value) as {
        id: string;
        name: string;
      }[];
    });

    const sortedProjectGroups = computed(() => {
      const items = projectGroups.value || [];
      return sortItems(items, sortOrderProjectGroups.value) as {
        id: string;
        name: string;
      }[];
    });

    const sortItems = (items: { name: string }[], sortOrder: SortOrder) => {
      const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));
      return sortOrder === SortOrder.ASC ? sorted : sorted.reverse();
    };

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
      sortOrderProjects,
      sortedProjects,
      sortOrderProjectGroups,
      sortedProjectGroups,
      SortOrder,

      projectLink,
      projectGroupLink,
      projectRef,
      toggleSortProjects,
      toggleSortProjectGroups,
    };
  },
});
</script>
