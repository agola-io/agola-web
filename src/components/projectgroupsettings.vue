<template>
  <div>
    <projectvars :variables="variables" :allvariables="allvariables"/>
  </div>
</template>

<script>
import { fetchVariables } from "@/util/data.js";

import projectvars from "@/components/projectvars";

export default {
  components: { projectvars },
  name: "projectgroupsettings",
  props: {
    ownertype: String,
    ownername: String,
    projectgroupref: Array
  },
  data() {
    return {
      variables: [],
      allvariables: []
    };
  },
  created: async function() {
    this.variables = await fetchVariables(
      "projectgroup",
      [this.ownertype, this.ownername, ...this.projectgroupref].join("/"),
      false
    );
    this.allvariables = await fetchVariables(
      "projectgroup",
      [this.ownertype, this.ownername, ...this.projectgroupref].join("/"),
      true
    );
  }
};
</script>

<style scoped lang="scss">
@import "@/css/_variables.scss";
</style>

