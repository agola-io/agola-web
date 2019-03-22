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
  name: "projectsettings",
  props: {
    ownertype: String,
    ownername: String,
    projectname: String
  },
  data() {
    return {
      variables: [],
      allvariables: []
    };
  },
  created: async function() {
    this.variables = await fetchVariables(
      this.ownertype,
      this.ownername,
      this.projectname
    );
    this.allvariables = await fetchVariables(
      this.ownertype,
      this.ownername,
      this.projectname,
      true
    );
    console.log("variables", this.variables);
  }
};
</script>

<style scoped lang="scss">
@import "@/css/_variables.scss";
</style>
