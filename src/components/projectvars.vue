<template>
  <div>
    <h5 class="text-2xl">Local variables</h5>
    <vars v-if="allvariables.length" :variables="variables"/>
    <span v-else>No variables</span>

    <hr class="my-6 border-t">

    <h5 class="text-2xl">All variables</h5>
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
</style>

