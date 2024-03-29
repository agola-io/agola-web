<template>
  <div class="w-6/12">
    <h1>
      If you need more advanced options or a little help,
      <a
        class="text-blue-600"
        rel="noopener noreferrer nofollow"
        href="https://agola.io/tryit/#test-using-a-local-gitea-instance"
      >
        take a look at the documentation
      </a>
    </h1>
    <form
      class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      @submit.prevent="
        $emit('createSource', {
          admintoken,
          name,
          type,
          clientId,
          clientSecret,
          url,
          skipVerify,
          sshHostKey,
          skipSshHostKeyCheck,
        })
      "
    >
      <div class="mb-4">
        <label class="block text-sm font-bold mb-2" for="admintoken"
          >Agola Admin token</label
        >
        <input
          class="appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
          id="admintoken"
          type="password"
          placeholder="Agola Admin token"
          v-model="admintoken"
        />
      </div>
      <div class="mb-4">
        <label class="block text-sm font-bold mb-2" for="type">Type</label>
        <select
          class="border bg-white rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
          id="type"
          v-model="type"
        >
          <option value="gitea">Gitea</option>
          <option value="gitlab">GitLab</option>
          <option value="github">GitHub</option>
        </select>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-bold mb-2" for="name"
          >Source name</label
        >
        <input
          class="appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
          id="name"
          pattern="^[a-zA-Z][a-zA-Z0-9]*([-]?[a-zA-Z0-9]+)+$"
          type="text"
          placeholder="Source name (only numbers, letters and -)"
          v-model="name"
        />
      </div>
      <div class="mb-4">
        <label class="block text-sm font-bold mb-2" for="url"
          >Source API URL</label
        >
        <input
          class="appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
          id="url"
          type="text"
          placeholder="API URL"
          v-model="url"
        />
      </div>
      <div class="mb-4 flex flex-row">
        <input
          id="skip_verify"
          type="checkbox"
          class="h-6 w-6 border border-gray-300 rounded-md checked:bg-blue-600 checked:border-transparent focus:outline-none"
          v-model="skipVerify"
        />
        <label class="text-sm mt-auto font-bold mx-2" for="skip_verify"
          >Skip TLS certificate validation</label
        >
      </div>
      <div class="mb-4">
        <label class="block text-sm font-bold mb-2" for="ssh_key"
          >Source Public SSH Key</label
        >
        <input
          class="appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
          id="ssh_key"
          type="text"
          autocomplete="off"
          placeholder="Public SSH key"
          v-model="sshHostKey"
        />
      </div>
      <div class="mb-4 flex flex-row">
        <input
          id="skip_ssh_key_check"
          type="checkbox"
          class="h-6 w-6 border border-gray-300 rounded-md checked:bg-blue-600 checked:border-transparent focus:outline-none"
          v-model="skipSshHostKeyCheck"
        />
        <label class="text-sm mt-auto font-bold mx-2" for="skip_ssh_key_check"
          >Skip SSH host key check</label
        >
      </div>
      <div class="mb-4">
        <label class="block text-sm font-bold mb-2" for="client_id"
          >Source client ID</label
        >
        <input
          class="appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
          id="client_id"
          type="text"
          placeholder="Client ID"
          v-model="clientId"
        />
      </div>
      <div class="mb-4">
        <label class="block text-sm font-bold mb-2" for="client_secret"
          >Source client secret</label
        >
        <input
          class="appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
          id="client_secret"
          type="password"
          placeholder="Client secret"
          v-model="clientSecret"
        />
      </div>
      <div class="flex justify-center">
        <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          Create
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { GITHUB_API_URL, GITHUB_SSH_KEY } from '../app/api';

export default defineComponent({
  name: 'CreateSourceForm',
  emits: ['createSource'],
  setup() {
    const name = ref('');
    const admintoken = ref('');
    const url = ref('');
    const sshHostKey = ref('');
    const skipVerify = ref(false);
    const skipSshHostKeyCheck = ref(false);
    const type = ref('gitea');
    const clientId = ref('');
    const clientSecret = ref('');

    watch(type, (value) => {
      if (value === 'github') {
        url.value = GITHUB_API_URL;
        sshHostKey.value = GITHUB_SSH_KEY;
        skipVerify.value = false;
        skipSshHostKeyCheck.value = false;
      }
    });

    return {
      name,
      admintoken,
      url,
      sshHostKey,
      skipVerify,
      skipSshHostKeyCheck,
      type,
      clientId,
      clientSecret,
    };
  },
});
</script>
