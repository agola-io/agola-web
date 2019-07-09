<template>
  <div>
    <div class="my-3 flex font-bold">
      <div class="w-2/12">Name</div>
    </div>
    <div class="flex" v-for="secret in secrets" v-bind:key="secret.id">
      <div class="w-2/12">
        <span class="name">{{secret.name}}</span>
        <div v-if="showparentpath" class="text-sm font-light">from {{secret.parent_path}}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  name: "secrets",
  props: {
    secrets: Array,
    showparentpath: Boolean
  }
};
</script>

<style scoped lang="scss">
</style>



