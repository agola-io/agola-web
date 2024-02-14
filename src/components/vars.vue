<template>
  <div>
    <!-- Header -->
    <div class="w-full grid grid-cols-6 font-bold bg-gray-200 my-3 p-2 rounded">
      <div class="col-span-1">Name</div>
      <div class="col-span-1">Secret Name</div>
      <div class="col-span-1">Secret Value</div>
      <div class="col-span-3 grid grid-cols-3">
        <div class="col-span-1">Conditions</div>
        <div class="col-span-1">Include</div>
        <div class="col-span-1">Exclude</div>
      </div>
    </div>
    <div class="flex flex-col" v-for="variable in variables" :key="variable.id">
      <div
        class="w-full grid grid-cols-6 my-2 px-2 rounded gap-4 group hover:bg-gray-100 transition duration-300 ease-in-out"
        :key="variable.id + '-header'"
      >
        <div class="col-span-1">
          <span class="name text-ellipsis overflow-hidden">{{
            variable.name
          }}</span>
          <div
            v-if="showparentpath"
            class="text-sm font-light text-gray-500 text-ellipsis overflow-hidden"
          >
            from {{ variable.parentPath }}
          </div>
        </div>
        <div class="col-span-1">
          <span class="text-ellipsis overflow-hidden">{{
            variable.values[0].secretName
          }}</span>
          <div
            v-if="variable.values[0].matchingSecretParentPath"
            class="text-sm text-green-600 text-ellipsis overflow-hidden"
          >
            <span class="mdi mdi-check-circle"></span> using secret from
            {{ variable.values[0].matchingSecretParentPath }}
          </div>
          <div v-else class="text-sm text-red-600">
            <span class="mdi mdi-alert-circle"></span> no matching secret
          </div>
        </div>
        <div class="col-span-1">
          <span>{{ variable.values[0].secretVar }}</span>
        </div>
        <div class="col-span-3">
          <div v-if="variable.values[0].when">
            <div
              v-for="(whenCondition, condIndex) in getWhenConditions(
                variable.values[0].when
              )"
              :key="condIndex"
            >
              <div
                v-if="whenCondition.cond"
                class="grid grid-cols-3 gap-4 text-ellipsis overflow-hidden"
              >
                <span class="text-ellipsis overflow-hidden">{{
                  whenCondition.condType
                }}</span>
                <div class="col-span-1">
                  <div
                    v-for="(include, includeIndex) in whenCondition.cond
                      .include"
                    :key="includeIndex"
                  >
                    <div class="text-ellipsis overflow-hidden">
                      {{ include.match }}
                    </div>
                  </div>
                </div>
                <div class="col-span-1 text-ellipsis overflow-hidden">
                  <div
                    v-for="(exclude, excludeIndex) in whenCondition.cond
                      .exclude"
                    :key="excludeIndex"
                  >
                    <div class="text-ellipsis overflow-hidden">
                      {{ exclude.match }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-for="(val, i) in variable.values.slice(1)"
        class="w-full grid grid-cols-6 my-2 px-2 rounded gap-4 group hover:bg-gray-100 transition duration-300 ease-in-out"
        :key="i"
      >
        <div class="col-span-1"></div>
        <div class="col-span-1">
          <span class="text-ellipsis overflow-hidden">{{
            val.secretName
          }}</span>
          <div
            v-if="val.matchingSecretParentPath"
            class="text-sm text-green-600 text-ellipsis overflow-hidden"
          >
            <span class="mdi mdi-check-circle"></span> using secret from
            {{ val.matchingSecretParentPath }}
          </div>
          <div v-else class="text-sm text-red-600">
            <span class="mdi mdi-alert-circle"></span> no matching secret
          </div>
        </div>
        <div class="col-span-1">
          <span>{{ val.secretVar }}</span>
        </div>
        <div class="col-span-3">
          <div v-if="val.when">
            <div
              v-for="(whenCondition, condIndex) in getWhenConditions(val.when)"
              :key="condIndex"
            >
              <div
                v-if="whenCondition.cond"
                class="grid grid-cols-3 gap-4 text-ellipsis overflow-hidden"
              >
                <span class="text-ellipsis overflow-hidden">{{
                  whenCondition.condType
                }}</span>
                <div class="col-span-1">
                  <div
                    v-for="(include, includeIndex) in whenCondition.cond
                      .include"
                    :key="includeIndex"
                  >
                    <div class="text-ellipsis overflow-hidden">
                      {{ include.match }}
                    </div>
                  </div>
                </div>
                <div class="col-span-1 text-ellipsis overflow-hidden">
                  <div
                    v-for="(exclude, excludeIndex) in whenCondition.cond
                      .exclude"
                    :key="excludeIndex"
                  >
                    <div class="text-ellipsis overflow-hidden">
                      {{ exclude.match }}
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
