<template>
  <div>
    <div class="relative">
      <div class="flex">
        <button
          @click="clicked"
          class="relative flex items-center focus:outline-none bg-green-500 hover:bg-green-600 text-white font-semibold hover:text-white py-2 px-4 border border-green-700 rounded rounded-r-none"
        >
          {{ buttonValue }}
        </button>
        <button
          v-on-click-outside="() => (dropdownActive = false)"
          @click="dropdownActive = !dropdownActive"
          class="relative flex items-center focus:outline-none bg-green-500 hover:bg-green-600 text-white font-semibold hover:text-white py-2 px-4 border border-l-0 border-green-700 rounded rounded-l-none"
        >
          <i class="mdi mdi-chevron-down"></i>
        </button>
      </div>
      <div
        v-if="dropdownActive"
        class="z-10 origin-top-right absolute right-0 mt-2 w-64 bg-white rounded-lg border shadow-md py-2"
      >
        <ul>
          <li>
            <a
              href="#"
              class="block px-4 py-2 hover:bg-blue-500 hover:text-white"
              @click="setButton('project')"
              >New Project</a
            >
          </li>
          <li>
            <a
              href="#"
              class="block px-4 py-2 hover:bg-blue-500 hover:text-white"
              @click="setButton('projectgroup')"
              >New Project Group</a
            >
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import { computed, defineComponent, ref } from 'vue';

export default defineComponent({
  directives: {
    onClickOutside: vOnClickOutside,
  },
  name: 'createprojectbutton',
  emits: ['click'],
  setup(_, { emit }) {
    const dropdownActive = ref(false);
    const buttonType = ref('project');

    const buttonValue = computed(() => {
      if (buttonType.value == 'project') {
        return 'New Project';
      }
      return 'New Project Group';
    });

    const setButton = (t: string) => {
      buttonType.value = t;
      dropdownActive.value = false;
    };

    const clicked = () => {
      emit('click', buttonType.value);
    };

    return {
      dropdownActive,
      buttonValue,

      setButton,
      clicked,
    };
  },
});
</script>
