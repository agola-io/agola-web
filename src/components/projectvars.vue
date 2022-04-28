<template>
  <div>
    <h5 class="text-2xl">{{ typetitle }} Variables</h5>
    <vars v-if="variables.length" :variables="variables" />
    <span v-else>No variables</span>

    <hr class="my-6 border-t" />

    <h5 class="text-2xl">All variables (local and inherited)</h5>
    <vars
      v-if="allvariables.length"
      :variables="allvariables"
      :showparentpath="true"
    />
    <span v-else>No variables</span>
  </div>
</template>

<script>
import vars from './vars.vue';

export default {
  components: { vars },
  name: 'projectvars',
  props: {
    variables: Array,
    allvariables: Array,
    type: String,
  },
  computed: {
    typetitle() {
      if (this.type == 'project') return 'Project';
      if (this.type == 'projectgroup') return 'Project group';
      return '';
    },
  },
};
</script>

<style scoped lang="scss"></style>
