<template>
  <div />
</template>

<script lang="ts">
import { useAuth } from '../app/auth';
import { defineComponent, onMounted } from 'vue';

export default defineComponent({
  name: 'Logout',

  setup() {
    const auth = useAuth();

    onMounted(() => {
      auth.logout();
    });

    return {};
  },
});
</script>
