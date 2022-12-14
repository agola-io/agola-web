<template>
  <div>
    <h5 class="text-2xl">{{ refTypetitle }} Variables</h5>
    <vars v-if="variables" :variables="variables" />
    <span v-else>No variables</span>

    <hr class="my-6 border-t" />

    <h5 class="text-2xl">All variables (local and inherited)</h5>
    <vars
      v-if="allVariables"
      :variables="allVariables"
      :showparentpath="true"
    />
    <span v-else>No variables</span>
  </div>
</template>

<script lang="ts">
import { VariableResponse } from '../app/api';
import { computed, defineComponent, PropType, toRefs } from 'vue';
import vars from './vars.vue';

export default defineComponent({
  components: { vars },
  name: 'projectvars',
  props: {
    variables: {
      type: Array as PropType<Array<VariableResponse>>,
      required: true,
    },
    allVariables: {
      type: Array as PropType<Array<VariableResponse>>,
      required: true,
    },
    refType: { type: String, required: true },
  },

  setup(props) {
    const { refType } = toRefs(props);

    const refTypetitle = computed(() => {
      if (refType.value == 'project') return 'Project';
      if (refType.value == 'projectgroup') return 'Project group';
      return '';
    });

    return {
      refTypetitle,
    };
  },
});
</script>
