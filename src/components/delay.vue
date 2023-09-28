<script lang="ts">
import { useTimeoutFn } from '@vueuse/shared';
import { defineComponent, ref, toRefs } from 'vue';

export default defineComponent({
  name: 'delay',
  props: {
    timeout: {
      type: Number,
      default: 0,
    },
  },
  setup(props, { slots }) {
    const { timeout } = toRefs(props);
    const show = ref(false);

    useTimeoutFn(() => (show.value = true), timeout.value);

    return () => (show.value && slots.default ? slots.default(props) : []);
  },
});
</script>
