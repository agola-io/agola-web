<template>
  <div>
    <div class="my-3 flex font-bold">
      <div class="w-2/12">Name</div>
      <div class="w-10/12">
        <div class="flex">
          <div class="w-2/12">Secret Name</div>
          <div class="w-2/12">Secret Value</div>
          <div class="w-8/12">
            <div class="flex">
              <div class="w-1/3 mr-2">Conditions</div>
              <div class="w-1/3 mr-2">Include</div>
              <div class="w-1/3 mr-2">Exclude</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex" v-for="variable in variables" v-bind:key="variable.id">
      <div class="w-2/12">
        <span class="name">{{variable.name}}</span>
        <div v-if="showparentpath" class="text-sm font-light">from {{variable.parent_path}}</div>
      </div>
      <div class="w-10/12">
        <div class="flex" v-for="val in variable.values" v-bind:key="val.id">
          <div class="w-2/12">
            <span>{{val.secret_name}}</span>
            <div
              v-if="val.matching_secret_parent_path"
              class="text-sm"
            >using secret from {{val.matching_secret_parent_path}}</div>
            <div v-else class="text-sm text-red-600">no matching secret</div>
          </div>
          <div class="w-2/12">
            <span>{{val.secret_var}}</span>
          </div>
          <div class="w-8/12">
            <div v-if="val.when">
              <div v-for="type in ['branch', 'tag', 'ref']" v-bind:key="type">
                <div v-if="val.when[type]">
                  <div class="flex">
                    <div class="w-1/3">
                      <span>{{ type }}</span>
                    </div>
                    <div class="w-1/3">
                      <div v-for="include in val.when[type].include" v-bind:key="include.match">
                        <div>{{include.match}}</div>
                      </div>
                    </div>
                    <div class="w-1/3">
                      <div v-for="exclude in val.when[type].exclude" v-bind:key="exclude.match">
                        <div>{{exclude.match}}</div>
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
</style>


