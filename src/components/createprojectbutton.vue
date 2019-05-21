<template>
  <div>
    <div class="relative">
      <div class="flex">
        <button
          @click="clicked"
          class="relative flex items-center focus:outline-none bg-green-500 hover:bg-green-600 text-white font-semibold hover:text-white py-2 px-4 border border-green-700 rounded rounded-r-none"
        >{{ buttonValue }}</button>
        <button
          v-click-outside="() => dropdownActive = false"
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
            >New Project</a>
          </li>
          <li>
            <a
              href="#"
              class="block px-4 py-2 hover:bg-blue-500 hover:text-white"
              @click="setButton('projectgroup')"
            >New Project Group</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import vClickOutside from "v-click-outside";

export default {
  components: {},
  directives: {
    clickOutside: vClickOutside.directive
  },
  name: "createprojectbutton",
  props: {},
  data() {
    return {
      dropdownActive: false,
      type: "project"
    };
  },
  computed: {
    buttonValue: function() {
      if (this.type == "project") {
        return "New Project";
      }
      return "New Project Group";
    }
  },
  methods: {
    setButton(type) {
      this.type = type;
      this.dropdownActive = false;
    },
    clicked() {
      this.$emit("click", this.type);
    }
  }
};
</script>

<style scoped lang="scss">
</style>

