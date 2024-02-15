<template>
  <div>
    <div class="flex">
      <h5 class="text-2xl">{{ refTypetitle }} Variables</h5>
      <button class="btn btn-green py-1 px-2 ml-3">
        <router-link class="block hover:text-white" :to="newVariableLink"
          >Add Variable</router-link
        >
      </button>
    </div>
    <vars
      v-if="variables"
      :variables="variables"
      @variable-deleted="handleVariableDeleted"
      :ownertype="ownertype"
      :ownername="ownername"
      :projectref="projectref"
      :refType="refType"
    />
    <span v-else>No variables</span>

    <hr class="my-6 border-t" />

    <h5 class="text-2xl">All variables (local and inherited)</h5>
    <vars
      v-if="allVariables"
      :variables="allVariables"
      :showparentpath="true"
      :ownertype="ownertype"
      :ownername="ownername"
      :projectref="projectref"
      :refType="refType"
    />
    <span v-else>No variables</span>
  </div>
</template>

<script lang="ts">
import { VariableResponse } from '../app/api';
import { computed, defineComponent, PropType, toRefs } from 'vue';
import vars from './vars.vue';
import {
  projectGroupNewVariableLink,
  projectNewVariableLink,
} from '../util/link';

export default defineComponent({
  components: { vars },
  name: 'projectvars',
  emits: ['variable-deleted'],
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
    ownertype: {
      type: String,
      required: true,
    },
    ownername: {
      type: String,
      required: true,
    },
    projectref: { type: Array as PropType<Array<string>>, required: true },
  },

  setup(props, { emit }) {
    const { refType, ownertype, ownername, projectref } = toRefs(props);

    const refTypetitle = computed(() => {
      if (refType.value == 'project') return 'Project';
      if (refType.value == 'projectgroup') return 'Project group';
      return '';
    });

    const newVariableLink = computed(() => {
      if (refType.value == 'project')
        return projectNewVariableLink(
          ownertype.value,
          ownername.value,
          projectref.value
        );
      if (refType.value == 'projectgroup')
        return projectGroupNewVariableLink(
          ownertype.value,
          ownername.value,
          projectref.value
        );
      return '';
    });

    const handleVariableDeleted = () => {
      emit('variable-deleted');
    };

    return {
      refTypetitle,
      newVariableLink,

      handleVariableDeleted,
    };
  },
});
</script>
