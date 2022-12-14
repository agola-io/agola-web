<template>
  <div></div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAppState } from '../app/appstate';
import { useAuth } from '../app/auth';

export default defineComponent({
  components: {},
  name: 'Oauth2',
  props: {},
  setup() {
    const appState = useAppState();
    const route = useRoute();
    const auth = useAuth();

    onMounted(() => {
      doOauth2();
    });

    const doOauth2 = async (): Promise<void> => {
      try {
        await auth.oauth2(route.query);
      } catch (e) {
        appState.setGlobalError(e);
      }
    };

    return {};
  },
});
</script>
