<template>
  <div>
    <div
      v-if="error"
      class="mb-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <span class="block sm:inline">{{ error }}</span>
    </div>
    <div>
      <div>
        <div class="flex justify-center items-center w-max">
          <CreateSourceForm v-on:createSource="createSource($event)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CreateSourceForm from '../components/createsourceform.vue';
import { createRemoteSource } from '../util/data';
import router from '../router';

export default {
  name: 'CreateSource',
  components: {
    CreateSourceForm,
  },
  data: function () {
    return {
      error: null,
    };
  },
  methods: {
    async createSource({
      token,
      name,
      type,
      clientId,
      clientSecret,
      url,
      skipVerify,
      sshHostKey,
      skipSshHostKeyCheck,
    }) {
      const res = await createRemoteSource(
        token,
        type,
        name,
        clientId,
        clientSecret,
        url,
        'oauth2',
        skipVerify,
        sshHostKey,
        skipSshHostKeyCheck,
        true,
        true,
        undefined
      );
      if (res.error) this.$store.dispatch('setError', res.error);
      else router.push({ name: 'login' });
    },
  },
  mounted: function () {
    this.$store.dispatch('setError', null);
  },
};
</script>
