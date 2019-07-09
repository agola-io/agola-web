<template>
  <div>
    <h5 class="text-2xl">{{ typetitle }} Secrets</h5>
    <secrets v-if="secrets.length" :secrets="secrets" />
    <span v-else>No secrets</span>

    <hr class="my-6 border-t" />

    <h5 class="text-2xl">All secrets (local and inherited)</h5>
    <secrets v-if="allsecrets.length" :secrets="allsecrets" :showparentpath="true" />
    <span v-else>No secrets</span>
  </div>
</template>

<script>
import secrets from "@/components/secrets";

export default {
  components: { secrets },
  name: "projectsecrets",
  props: {
    secrets: Array,
    allsecrets: Array,
    type: String
  },
  computed: {
    typetitle() {
      if (this.type == "project") return "Project";
      if (this.type == "projectgroup") return "Project group";
      return "";
    }
  }
};
</script>

<style scoped lang="scss">
</style>


