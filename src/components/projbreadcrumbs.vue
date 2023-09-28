<template>
  <nav class="mb-4 rounded font-sans w-full">
    <ol class="list-none flex">
      <li>
        <a>{{ ownertype }}</a>
      </li>
      <li>
        <span class="mx-2">/</span>
      </li>
      <li>
        <router-link :to="ownerLink(ownertype, ownername)">{{
          ownername
        }}</router-link>
      </li>
      <template v-if="projectref">
        <li v-for="(ref, i) in projectref" :key="i">
          <span class="mx-2">/</span>
          <router-link
            v-if="i + 1 < projectref.length"
            :to="
              projectGroupLink(ownertype, ownername, projectref.slice(0, i + 1))
            "
            >{{ ref }}</router-link
          >
          <router-link
            v-else
            :to="projectLink(ownertype, ownername, projectref.slice(0, i + 1))"
            >{{ ref }}</router-link
          >
        </li>
      </template>

      <template v-if="projectgroupref">
        <li v-for="(ref, i) in projectgroupref" :key="i">
          <span class="mx-2">/</span>
          <router-link
            :to="
              projectGroupLink(
                ownertype,
                ownername,
                projectgroupref.slice(0, i + 1)
              )
            "
            >{{ ref }}</router-link
          >
        </li>
      </template>
    </ol>
  </nav>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { ownerLink, projectGroupLink, projectLink } from '../util/link';

export default defineComponent({
  name: 'projbreadcrumbs',
  components: {},
  props: {
    ownertype: {
      type: String,
      required: true,
    },
    ownername: {
      type: String,
      required: true,
    },
    projectref: Array as PropType<Array<string>>,
    projectgroupref: Array as PropType<Array<string>>,
  },
  setup() {
    return {
      ownerLink,
      projectLink,
      projectGroupLink,
    };
  },
});
</script>
