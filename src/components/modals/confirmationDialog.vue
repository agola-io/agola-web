<template>
  <baseModal :show="show" @dismiss="emitResult(false)">
    <slot>
      <div class="p-4">
        <div class="p-4 text-lg font-bold text-gray-800">
          <slot name="title"> Please confirm </slot>
        </div>
        <div class="p-4 text-sm">
          <slot name="body"> Are you sure? </slot>
        </div>

        <div class="p-4 flex justify-end gap-2">
          <slot name="actions">
            <button
              id="modal-cancel"
              type="button"
              class="btn btn-gray font-bold py-2 px-4 rounded"
              @click="emitResult(false)"
            >
              Cancel
            </button>

            <button
              id="modal-confirm"
              type="button"
              class="btn btn-blue font-bold py-2 px-4 rounded"
              @click="emitResult(true)"
            >
              Confirm
            </button>
          </slot>
        </div>
      </div>
    </slot>
  </baseModal>
</template>
<script setup lang="ts">
import baseModal from './baseModal.vue';
defineProps<{
  show: boolean;
}>();
const emit = defineEmits<{
  (e: 'result', value: boolean): void;
}>();
function emitResult(value: boolean) {
  emit('result', value);
}
</script>
