<template>
  <div>
    <div class="org-title">
      <span class="org-name">{{orgname}}</span>
    </div>
    <div class="tabs">
      <ul>
        <li :class="[{ 'is-active': currentTab === 'projects' }]">
          <a @click="currentTab = 'projects'">Projects</a>
        </li>
      </ul>
    </div>
    <projects v-if="currentTab == 'projects'" ownertype="org" :ownername="orgname"/>
  </div>
</template>


<script>
import projects from "@/components/projects.vue";

export default {
  name: "Org",
  components: { projects },
  props: {
    orgname: String,
    currentTab: {
      type: String,
      default: "projects"
    }
  }
};
</script>

<style scoped lang="scss">
@import "@/css/_variables.scss";

.org-title {
  display: flex;
  align-items: center;
  padding-left: 5px;
  margin-bottom: 25px;
  .org-name {
    padding-left: 5px;
    font-size: 1.5rem;
    padding-right: 1rem;
  }
}
</style>