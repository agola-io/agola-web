<template>
  <div>
    <div class="my-3 flex font-bold">
      <div class="w-2/12">Name</div>
    </div>
    <div class="flex" v-for="secret in secrets" v-bind:key="secret.id">
      <div class="w-2/12">
        <span class="name">{{ secret.name }}</span>
        <div v-if="showparentpath" class="text-sm font-light">
          from {{ secret.parentPath }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { SecretResponse } from '../app/api';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  components: {},
  name: 'secrets',
  props: {
    secrets: {
      type: Array as PropType<Array<SecretResponse>>,
      required: true,
    },

    showparentpath: Boolean,
  },
});
</script>
