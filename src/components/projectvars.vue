<template>
  <div>
    <h5 class="title is-5">Local variables</h5>
    <vars v-if="allvariables.length" :variables="variables"/>
    <span v-else>No variables</span>

    <hr>
    <h5 class="title is-5">All variables</h5>
    <vars v-if="allvariables.length" :variables="allvariables" :showparentpath="true"/>
    <span v-else>No variables</span>
  </div>
</template>

<script>
import vars from "@/components/vars";

export default {
  components: { vars },
  name: "projectvars",
  props: {
    variables: Array,
    allvariables: Array
  }
};
</script>

<style scoped lang="scss">
@import "@/css/_variables.scss";
</style>

