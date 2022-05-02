<template>
  <div>
    <nav class="mb-4 rounded font-sans w-full">
      <ol class="list-none flex">
        <li>
          <a>org</a>
        </li>
        <li>
          <span class="mx-2">/</span>
        </li>
        <li>
          <router-link :to="ownerLink('org', orgname)">{{
            orgname
          }}</router-link>
        </li>
      </ol>
    </nav>

    <div class="mb-8 flex justify-between">
      <span class="text-3xl">{{ orgname }}</span>
      <createprojectbutton v-on:click="goToCreate($event)" />
    </div>

    <div class="flex justify-between">
      <ul class="flex-grow tab">
        <li
          class="tab-element"
          :class="[
            {
              'tab-element-selected':
                $route.name === 'org projects' || $route.name === 'org',
            },
          ]"
        >
          <router-link :to="ownerProjectsLink('org', orgname)">
            <i class="mr-1 mdi mdi-home" />
            <span>Projects</span>
          </router-link>
        </li>
        <li
          class="tab-element"
          :class="[{ 'tab-element-selected': $route.name === 'org members' }]"
        >
          <router-link :to="orgMembersLink(orgname)">
            <i class="mr-1 mdi mdi-account-group" />
            <span>Members</span>
          </router-link>
        </li>
        <li
          v-if="$route.name?.toString().endsWith('org project group settings')"
          class="tab-element"
          :class="[
            {
              'tab-element-selected': $route.name
                ?.toString()
                .endsWith('org project group settings'),
            },
          ]"
        >
          <router-link :to="projectGroupSettingsLink('org', orgname, [])">
            <i class="mr-1 mdi mdi-cog" />
            <span>Root Project Group Settings</span>
          </router-link>
        </li>
        <li
          v-if="$route.name?.toString().endsWith('org settings')"
          class="tab-element"
          :class="[
            {
              'tab-element-selected': $route.name
                ?.toString()
                .endsWith('org settings'),
            },
          ]"
        >
          <router-link :to="ownerSettingsLink('org', orgname)">
            <i class="mr-1 mdi mdi-cog" />
            <span>Organization Settings</span>
          </router-link>
        </li>
      </ul>
      <ul class="flex tab">
        <li>
          <div class="relative">
            <div
              class="flex -mt-3"
              v-click-outside="() => (dropdownActive = false)"
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
                    :to="projectGroupSettingsLink('org', orgname, [])"
                  >
                    <i class="mr-1 mdi mdi-cog" />
                    <span>Root Project Group Settings</span>
                  </router-link>
                </li>
                <!-- <li>
                  <router-link
                    class="block px-4 py-2 hover:bg-blue-500 hover:text-white"
                    :to="ownerSettingsLink('org', orgname)"
                  >
                    <i class="mr-1 mdi mdi-cog" />
                    <span>Organization Settings</span>
                  </router-link>
                </li> -->
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
import vClickOutside from 'click-outside-vue3';

import {
  ownerLink,
  ownerProjectsLink,
  ownerSettingsLink,
  orgMembersLink,
  projectGroupCreateProjectGroupLink,
  projectGroupCreateProjectLink,
  projectGroupSettingsLink,
} from '../util/link';

import createprojectbutton from '../components/createprojectbutton.vue';
import { useRouter } from 'vue-router';
import { defineComponent, ref, toRefs } from 'vue';

export default defineComponent({
  name: 'Org',
  components: { createprojectbutton },
  directives: {
    clickOutside: vClickOutside.directive,
  },
  props: {
    orgname: { type: String, required: true },
  },
  setup(props) {
    const { orgname } = toRefs(props);
    const router = useRouter();

    const dropdownActive = ref(false);

    const goToCreate = (type: string) => {
      if (type == 'project') {
        router.push(projectGroupCreateProjectLink('org', orgname.value, []));
        return;
      }
      router.push(projectGroupCreateProjectGroupLink('org', orgname.value, []));
    };

    return {
      dropdownActive,

      ownerLink,
      ownerProjectsLink,
      ownerSettingsLink,
      orgMembersLink,
      projectGroupCreateProjectGroupLink,
      projectGroupCreateProjectLink,
      projectGroupSettingsLink,

      goToCreate,
    };
  },
});
</script>
