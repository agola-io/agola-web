<template>
  <div class="w-full max-w-xs">
    <form
      class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      @submit.prevent="$emit('login', username, password)"
    >
      <div class="mb-4">
        <label class="block text-sm font-bold mb-2" for="username"
          >Username</label
        >
        <input
          class="appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
          id="username"
          type="text"
          placeholder="Username"
          v-model="username"
        />
      </div>
      <div class="mb-6">
        <label class="block text-sm font-bold mb-2" for="password"
          >Password</label
        >
        <input
          class="appearance-none border rounded w-full py-2 px-3 mb-3 leading-tight focus:outline-none focus:shadow-outline"
          id="password"
          type="password"
          placeholder="******************"
          v-model="password"
        />
      </div>
      <div class="flex justify-center">
        <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          {{ action }} with {{ name }}
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'LoginForm',
  props: {
    action: String,
    name: String,
  },
  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    login: (username: string, password: string) => true,
  },
  setup() {
    const username = ref('');
    const password = ref('');
    return {
      username,
      password,
    };
  },
});
</script>
