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
    <div class="flex" v-for="variable in variables" :key="variable.id">
      <div class="w-2/12">
        <span class="name">{{ variable.name }}</span>
        <div v-if="showparentpath" class="text-sm font-light">
          from {{ variable.parentPath }}
        </div>
      </div>
      <div class="w-10/12">
        <div class="flex" v-for="(val, i) in variable.values" :key="i">
          <div class="w-2/12">
            <span>{{ val.secretName }}</span>
            <div v-if="val.matchingSecretParentPath" class="text-sm">
              using secret from {{ val.matchingSecretParentPath }}
            </div>
            <div v-else class="text-sm text-red-600">no matching secret</div>
          </div>
          <div class="w-2/12">
            <span>{{ val.secretVar }}</span>
          </div>
          <div class="w-8/12">
            <div v-if="val.when">
              <div
                v-for="whenCondition in getWhenConditions(val.when)"
                :key="whenCondition.condType"
              >
                <div v-if="whenCondition.cond">
                  <div class="flex">
                    <div class="w-1/3">
                      <span>{{ whenCondition.condType }}</span>
                    </div>
                    <div class="w-1/3">
                      <div
                        v-for="include in whenCondition.cond.include"
                        :key="include.match"
                      >
                        <div>{{ include.match }}</div>
                      </div>
                    </div>
                    <div class="w-1/3">
                      <div
                        v-for="exclude in whenCondition.cond.exclude"
                        :key="exclude.match"
                      >
                        <div>{{ exclude.match }}</div>
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

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { VariableResponse, When, WhenConditions } from '../app/api';

interface FlatWhenConditions {
  condType: string;
  cond: WhenConditions | undefined;
}

const whenCondTypes: (keyof When)[] = ['branch', 'tag', 'ref'];

export default defineComponent({
  components: {},
  name: 'vars',
  props: {
    variables: {
      type: Array as PropType<Array<VariableResponse>>,
      required: true,
    },
    showparentpath: Boolean,
  },
  setup() {
    const getWhenConditions = (when: When) => {
      const wc: FlatWhenConditions[] = [];
      for (const type of whenCondTypes) {
        wc.push({
          condType: type,
          cond: when[type],
        });
      }
      return wc;
    };

    return {
      getWhenConditions,
    };
  },
});
</script>
