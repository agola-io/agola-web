<template>
  <div>
    <projbreadcrumbs
      :ownertype="ownertype"
      :ownername="ownername"
      :projectgroupref="projectgroupref"
    />

    <div class="mb-8 flex justify-between">
      <span class="text-3xl">{{ projectGroupName }}</span>
      <createprojectbutton @click="goToCreate($event)" />
    </div>

    <div class="flex justify-between">
      <ul class="flex-grow tab">
        <li
          class="tab-element"
          :class="[
            {
              'tab-element-selected':
                $route.name?.toString() == 'project group project' ||
                $route.name?.toString().endsWith('project group'),
            },
          ]"
        >
          <router-link
            :to="
              projectGroupProjectsLink(ownertype, ownername, projectgroupref)
            "
          >
            <i class="mdi mdi-home" />
            <span>Projects</span>
          </router-link>
        </li>
        <li
          v-if="$route.name?.toString().endsWith('project group settings')"
          class="tab-element"
          :class="[
            {
              'tab-element-selected': $route.name
                ?.toString()
                .endsWith('project group settings'),
            },
          ]"
        >
          <router-link
            :to="
              projectGroupSettingsLink(ownertype, ownername, projectgroupref)
            "
          >
            <i class="mdi mdi-cog" />
            <span>Project Group Settings</span>
          </router-link>
        </li>
      </ul>
      <ul class="flex tab">
        <li>
          <div class="relative">
            <div
              class="flex -mt-3"
              v-on-click-outside="() => (dropdownActive = false)"
              @click="dropdownActive = !dropdownActive"
            >
              <button
                class="relative flex items-center focus:outline-none bg-transparent hover:bg-gray-300 text-dark font-semibold hover:text-dark py-1 px-4 border border-gray-500 rounded"
              >
                <i class="mr-4 mdi mdi-cog" />
                <i class="mdi mdi-chevron-down"></i>
              </button>
            </div>
            <div
              v-if="dropdownActive"
              class="z-10 origin-top-right absolute right-0 mt-2 w-64 bg-white rounded-lg border shadow-md py-2"
            >
              <ul>
                <li>
                  <router-link
                    class="block px-4 py-2 hover:bg-blue-500 hover:text-white"
                    :to="
                      projectGroupSettingsLink(
                        ownertype,
                        ownername,
                        projectgroupref
                      )
                    "
                  >
                    <i class="mdi mdi-cog" />
                    <span>Project Group Settings</span>
                  </router-link>
                </li>
              </ul>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <router-view class="mt-8"></router-view>
  </div>
</template>

<script lang="ts">
import { vOnClickOutside } from '@vueuse/components';

import {
  projectGroupProjectsLink,
  projectGroupSettingsLink,
  projectGroupCreateProjectGroupLink,
  projectGroupCreateProjectLink,
} from '../util/link';

import projbreadcrumbs from '../components/projbreadcrumbs.vue';
import createprojectbutton from '../components/createprojectbutton.vue';
import { computed, defineComponent, PropType, ref, toRefs } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'ProjectGroup',
  components: { projbreadcrumbs, createprojectbutton },
  directives: {
    onClickOutside: vOnClickOutside,
  },
  props: {
    ownertype: { type: String, required: true },
    ownername: { type: String, required: true },
    projectgroupref: { type: Array as PropType<Array<string>>, required: true },
  },
  setup(props) {
    const { ownertype, ownername, projectgroupref } = toRefs(props);

    const router = useRouter();

    const dropdownActive = ref(false);

    const projectGroupName = computed(() => {
      if (projectgroupref.value.length == 0) {
        return 'Root Project Group';
      }
      return projectgroupref.value[projectgroupref.value.length - 1];
    });

    const goToCreate = (type: string) => {
      if (type == 'project') {
        router.push(
          projectGroupCreateProjectLink(
            ownertype.value,
            ownername.value,
            projectgroupref.value
          )
        );
        return;
      }
      router.push(
        projectGroupCreateProjectGroupLink(
          ownertype.value,
          ownername.value,
          projectgroupref.value
        )
      );
    };

    return {
      dropdownActive,
      projectGroupName,

      projectGroupProjectsLink,
      projectGroupSettingsLink,
      projectGroupCreateProjectGroupLink,
      projectGroupCreateProjectLink,

      goToCreate,
    };
  },
});
</script>
