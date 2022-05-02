<template>
  <div class="w-full max-w-xs">
    <form
      class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      @submit.prevent="$emit('register', curUsername)"
    >
      <div class="mb-4">
        <label class="block text-sm font-bold mb-2" for="username"
          >Remote Username</label
        >
        <input
          class="appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
          id="username"
          type="text"
          placeholder="Username"
          :disabled="true"
          :value="remoteUsername"
        />
      </div>
      <div class="mb-4">
        <label class="block text-sm font-bold mb-2" for="username"
          >Username</label
        >
        <input
          class="appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
          id="username"
          type="text"
          placeholder="Username"
          v-model="curUsername"
        />
      </div>
      <div class="flex justify-center">
        <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          Register
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, toRefs } from 'vue';

export default defineComponent({
  name: 'RegisterForm',
  props: {
    remoteUsername: String,
    username: String,
  },
  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    register: (username: string) => true,
  },
  setup(props) {
    const { username } = toRefs(props);

    const curUsername = ref(username.value || '');

    return {
      curUsername,
    };
  },
});
</script>
