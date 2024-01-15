<template>
  <div class="mb-2 border-solid border-gray-300 rounded border shadow-sm">
    <div v-if="remoterepos">
      <label
        class="block px-4 py-2 border-b"
        v-for="(repo, index) in remoterepos"
        :key="repo.id"
        @click="select(index)"
      >
        <input
          type="radio"
          :checked="selectedRepo == index"
          :data-test="'selectedRepo-' + index"
        />
        {{ repo.path }}
      </label>
    </div>
    <div v-else class="block px-4 py-2 border-b">No remote repositories</div>
  </div>
</template>

<script lang="ts">
import { RemoteRepoResponse } from '../app/api';
import { defineComponent, PropType, ref, toRefs } from 'vue';

export default defineComponent({
  components: {},
  name: 'remoterepos',
  props: {
    remoterepos: {
      type: Array as PropType<Array<RemoteRepoResponse>>,
      required: true,
    },
  },
  emits: ['reposelected'],
  setup(props, { emit }) {
    const { remoterepos } = toRefs(props);

    const selectedRepo = ref(0);
    const select = (index: number) => {
      selectedRepo.value = index;
      emit('reposelected', remoterepos.value[index].path);
    };

    return {
      selectedRepo,

      select,
    };
  },
});
</script>
