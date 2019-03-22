<template>
  <div>
    <div class="columns has-text-weight-bold">
      <div class="column is-2">Name</div>
      <div class="column is-10">
        <div class="columns">
          <div class="column is-2">Secret Name</div>
          <div class="column is-2">Secret Value</div>
          <div class="column">
            <div class="columns">
              <div class="column">Conditions</div>
              <div class="column">Include</div>
              <div class="column">Exclude</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="columns" v-for="variable in variables" v-bind:key="variable.id">
      <div class="column is-2">
        <span class="name">{{variable.name}}</span>
        <div v-if="showparentpath" class="var-parent-path">from {{variable.parent_path}}</div>
      </div>
      <div class="column is-10">
        <div class="item-list" v-for="val in variable.values" v-bind:key="val.id">
          <div class="columns">
            <div class="column is-2">
              <span class="secret-name">{{val.secret_name}}</span>
              <div
                v-if="val.matching_secret_parent_path"
                class="matching-secret"
              >using secret from {{val.matching_secret_parent_path}}</div>
              <div v-else class="no-matching-secret">no matching secret</div>
            </div>
            <div class="column is-2">
              <span class="secret-var">{{val.secret_var}}</span>
            </div>
            <div class="column">
              <div v-if="val.when">
                <div v-if="val.when.branch">
                  <div class="columns">
                    <div class="column">
                      <span>branch</span>
                    </div>
                    <div class="column">
                      <div
                        class="item-list"
                        v-for="include in val.when.branch.include"
                        v-bind:key="include.match"
                      >
                        <span class="secret-name">{{include.match}}</span>
                      </div>
                    </div>
                    <div class="column">
                      <div
                        class="item-list"
                        v-for="exclude in val.when.branch.exclude"
                        v-bind:key="exclude.match"
                      >
                        <span class="secret-name">{{exclude.match}}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { apiurl, fetch } from "@/util/auth";

export default {
  components: {},
  name: "vars",
  props: {
    variables: Array,
    showparentpath: Boolean
  }
};
</script>

<style scoped lang="scss">
@import "@/css/_variables.scss";
@import "~bulma/bulma.sass";

.name {
}

.secret-name {
  font-weight: bold;
}

.var-parent-path {
  @extend .has-text-weight-light;
  @extend .is-size-7;
}

.matching-secret {
  @extend .has-text-weight-light;
  @extend .is-size-7;
}

.no-matching-secret {
  @extend .has-text-danger;
  @extend .is-size-7;
}
</style>


