<template>
  <div class="mb-2 border-solid border-gray-300 rounded border shadow-sm">
    <div v-if="remoterepos.length > 0">
      <label
        class="block px-4 py-2 border-b"
        v-for="(repo, index) in remoterepos"
        v-bind:key="repo.id"
        @click="select(index)"
      >
        <input type="radio" :checked="selectedrepo == index" />
        {{ repo.path }}
      </label>
    </div>
    <div v-else class="block px-4 py-2 border-b">No remote repositories</div>
  </div>
</template>

<script>
export default {
  components: {},
  name: 'remoterepos',
  props: {
    remoterepos: Array,
  },
  emits: ['reposelected'],
  data() {
    return {
      selectedrepo: null,
    };
  },
  methods: {
    select(index) {
      this.selectedrepo = index;
      this.$emit('reposelected', this.remoterepos[index].path);
    },
  },
};
</script>

<style scoped lang="scss"></style>
