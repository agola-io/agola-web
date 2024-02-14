<template>
  <div>
    <div class="flex">
      <h5 class="text-2xl">{{ refTypetitle }} Secrets</h5>
      <button class="btn btn-green py-1 px-2 ml-3">
        <router-link class="block hover:text-white" :to="newSecretLink"
          >Add Secret</router-link
        >
      </button>
    </div>
    <secrets
      v-if="secrets.length"
      :secrets="secrets"
      :ownername="ownername"
      :ownertype="ownertype"
      :projectref="projectref"
      :refType="refType"
      @delete-secret="handleDeleteSecret"
    />
    <span v-else>No secrets</span>

    <hr class="my-6 border-t" />

    <h5 class="text-2xl">All secrets (local and inherited)</h5>
    <secrets
      v-if="allSecrets.length"
      :secrets="allSecrets"
      :ownername="ownername"
      :ownertype="ownertype"
      :projectref="projectref"
      :refType="refType"
      :showparentpath="true"
    />
    <span v-else>No secrets</span>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, toRefs } from 'vue';
import { SecretResponse } from '../app/api';
import { projectGroupNewSecretLink, projectNewSecretLink } from '../util/link';
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
    const newSecretLink = computed(() => {
      if (refType.value == 'project')
        return projectNewSecretLink(
          ownertype.value,
          ownername.value,
          projectref.value
        );
      if (refType.value == 'projectgroup')
        return projectGroupNewSecretLink(
          ownertype.value,
          ownername.value,
          projectref.value
        );
      return '';
    });

    const handleDeleteSecret = () => {
      emit('delete-secret');
    };

    return {
      refTypetitle,
      newSecretLink,

      handleDeleteSecret,
    };
  },
});
</script>
