<template>
  <div>
    <h5 class="text-2xl">{{ refTypetitle }} Secrets</h5>
    <secrets v-if="secrets.length" :secrets="secrets" />
    <span v-else>No secrets</span>

    <hr class="my-6 border-t" />

    <h5 class="text-2xl">All secrets (local and inherited)</h5>
    <secrets
      v-if="allSecrets.length"
      :secrets="allSecrets"
      :showparentpath="true"
    />
    <span v-else>No secrets</span>
  </div>
</template>

<script lang="ts">
import { SecretResponse } from '../app/api';
import { computed, defineComponent, PropType, toRefs } from 'vue';
import secrets from './secrets.vue';

export default defineComponent({
  components: { secrets },
  name: 'projectsecrets',
  props: {
    secrets: {
      type: Array as PropType<Array<SecretResponse>>,
      required: true,
    },
    allSecrets: {
      type: Array as PropType<Array<SecretResponse>>,
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
