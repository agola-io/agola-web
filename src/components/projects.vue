<template>
  <div>
    <h4 class="text-xl my-3">Projects</h4>
    <div v-if="!fetchedProjects" class="ml-6 flex w-48">
      <div :class="{ spinner: !fetchedProjects }"></div>
    </div>
    <ul v-else-if="projects && projects.length > 0" data-test="projectsSection">
      <li
        :id="'projectItemId-' + index"
        class="mb-2 border rounded-l"
        v-for="(project, index) in projects"
        :key="project.id"
        :data-test="project.id"
      >
        <div class="pl-4 py-4 flex items-center justify-between">
          <router-link
            class="item"
            :to="projectLink(ownertype, ownername, projectRef(project.name))"
          >
            <span class="font-bold">{{ project.name }}</span>
          </router-link>
          <span
            class="px-4 cursor-pointer"
            @click="toggleFavorite(project)"
            :data-test="'projectItem-' + index"
          >
            <i
              :class="{
                'mdi mdi-star': project.isfavourite,
                'mdi mdi-star-outline': !project.isfavourite,
              }"
              :style="{
                color: project.isfavourite ? 'darkorange' : '',
                borderColor: project.isfavourite ? 'darkorange' : '',
              }"
              :data-test="'projectStarIcon-' + index"
            ></i>
          </span>
        </div>
      </li>
    </ul>
    <div v-else class="font-bold">No projects</div>

    <hr class="my-6 border-t" />

    <h4 class="text-xl my-3">Project Groups</h4>
    <div v-if="!fetchedProjectGroups" class="ml-6 flex w-48">
      <div :class="{ spinner: !fetchedProjectGroups }"></div>
    </div>
    <ul
      v-else-if="projectGroups && projectGroups.length > 0"
      data-test="projectsGroupSection"
    >
      <li
        :id="'projectGroupItemId-' + index"
        class="mb-2 border rounded-l"
        v-for="(projectGroup, index) in projectGroups"
        :key="projectGroup.id"
        :data-test="projectGroup.id"
      >
        <div class="pl-4 py-4 flex items-center justify-between">
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
          <span
            class="px-4 cursor-pointer"
            @click="toggleFavorite(projectGroup)"
            :data-test="'projectGroupItem-' + index"
          >
            <i
              :class="{
                'mdi mdi-star': projectGroup.isfavourite,
                'mdi mdi-star-outline': !projectGroup.isfavourite,
              }"
              :style="{
                color: projectGroup.isfavourite ? 'darkorange' : '',
                borderColor: projectGroup.isfavourite ? 'darkorange' : '',
              }"
              :data-test="'projectGroupStarIcon-' + index"
            ></i>
          </span>
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
  onMounted,
  onUnmounted,
  PropType,
  toRefs,
  watch,
} from 'vue';
import { ApiError, useAPI } from '../app/api';
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

    onMounted(() => {
      updateFavoritesFromLocalStorage();
    });

    const abortFetch = () => {
      fetchAbort.abort();
      fetchAbort = new AbortController();
    };

    const update = async () => {
      abortFetch();
      await refreshProjects();
      await refreshProjectGroups();
      updateFavoritesFromLocalStorage();
      reorderList();
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

    const toggleFavorite = (item: any) => {
      item.isfavourite = !item.isfavourite;
      const storedFavorites = localStorage.getItem('favorites');
      const favorites = storedFavorites ? JSON.parse(storedFavorites) : {};

      favorites[item.id] = item.isfavourite;
      localStorage.setItem('favorites', JSON.stringify(favorites));

      reorderList();
    };

    const reorderList = () => {
      if (projects.value) {
        projects.value.sort((a, b) => {
          if (a.isfavourite && !b.isfavourite) {
            return -1;
          } else if (!a.isfavourite && b.isfavourite) {
            return 1;
          } else {
            return 0;
          }
        });
      }

      if (projectGroups.value) {
        projectGroups.value.sort((a, b) => {
          if (a.isfavourite && !b.isfavourite) {
            return -1;
          } else if (!a.isfavourite && b.isfavourite) {
            return 1;
          } else {
            return 0;
          }
        });
      }
    };

    const updateFavoritesFromLocalStorage = () => {
      const storedFavoritesString = localStorage.getItem('favorites');
      const storedFavorites = storedFavoritesString
        ? JSON.parse(storedFavoritesString)
        : {};

      if (projects.value) {
        projects.value.forEach((project) => {
          project.isfavourite = storedFavorites[project.id] ?? false;
        });
      }

      if (projectGroups.value) {
        projectGroups.value.forEach((projectGroup) => {
          projectGroup.isfavourite = storedFavorites[projectGroup.id] ?? false;
        });
      }
    };

    return {
      fetchedProjects,
      fetchedProjectGroups,
      projects,
      projectGroups,

      projectLink,
      projectGroupLink,
      toggleFavorite,
      projectRef,
    };
  },
});
</script>
