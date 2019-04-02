<template>
  <div>
    <h4 class="title is-4">Project variables</h4>
    <vars :variables="variables"/>

    <hr>
    <h4 class="title is-4">All project variables</h4>
    <vars :variables="allvariables" :showparentpath="true"/>
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

