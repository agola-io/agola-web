<template>
  <Teleport to="#modals">
    <UseFocusTrap :options="options">
      <div tabindex="0" class="fixed inset-0 bg-gray-900 bg-opacity-40">
        <div
          class="fixed inset-0 flex items-center justify-center w-auto m-auto max-w-[500px]"
        >
          <div class="p-4 bg-white text-black rounded-md w-full">
            <slot></slot>
          </div>
        </div></div
    ></UseFocusTrap>
  </Teleport>
</template>
<script setup lang="ts">
import { UseFocusTrap } from '@vueuse/integrations/useFocusTrap/component';
import { UseFocusTrapOptions } from '@vueuse/integrations';
const options: UseFocusTrapOptions = {
  immediate: true,
  onDeactivate: () => {
    emit('dismiss', false);
  },
};

if (import.meta.env.TEST) {
  options.tabbableOptions = {
    displayCheck: 'none',
  };
}

const emit = defineEmits<{
  (e: 'dismiss', value: boolean): void;
}>();
</script>
