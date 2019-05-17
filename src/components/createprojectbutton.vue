<template>
  <div>
    <div class="field has-addons is-pulled-rigth">
      <p class="control">
        <button class="button" @click="clicked">{{ buttonValue }}</button>
      </p>
      <div class="control">
        <div
          class="dropdown is-right"
          v-click-outside="() => dropdownActive = false"
          v-bind:class="{ 'is-active': dropdownActive }"
        >
          <div class="dropdown-trigger">
            <button class="button" @click="toggleDropdown">
              <span class="icon is-small">
                <i class="mdi mdi-chevron-down"></i>
              </span>
            </button>
          </div>
          <div class="dropdown-menu" role="menu">
            <div class="dropdown-content">
              <a href="#" class="dropdown-item" @click="setButton('project')">New Project</a>
              <a href="#" class="dropdown-item" @click="setButton('projectgroup')">New Project Group</a>
            </div>
          </div>
        </div>
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
    toggleDropdown() {
      this.dropdownActive = !this.dropdownActive;
    },
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

