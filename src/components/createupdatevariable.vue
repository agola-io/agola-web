<template>
  <div class="panel flex flex-col">
    <p class="panel-title">
      {{
        operationType == OperationType.Create
          ? 'New Variable'
          : 'Update Variable'
      }}
    </p>

    <form @submit.prevent="submitForm" class="p-4">
      <div class="mb-4">
        <label for="variable-name" class="block text-sm font-medium leading-6">
          Variable Name
        </label>
        <input
          id="variable-name"
          class="appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          required
          placeholder="Variable Name"
          v-model.trim="variableName"
          @input="validateVariableName"
          data-test="variableName"
        />
        <div v-if="variableNameError" class="text-red-500 text-sm">
          {{ variableNameError }}
        </div>
      </div>

      <div
        v-for="(variableValue, variableIndex) in variableValues"
        :key="variableIndex"
        class="p-4 mb-4"
      >
        <div class="grid gap-x-8 grid-cols-3 mb-4 items-center">
          <div class="col-span-1 flex flex-col">
            <label
              :for="'secret-name-input-' + variableIndex"
              class="block text-sm font-medium leading-6"
            >
              Secret Name
            </label>
            <input
              :id="'secret-name-input-' + variableIndex"
              class="appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              required
              placeholder="Secret name"
              v-model.trim="variableValue.secretName"
              @input="validateVariableSecretName(variableValue)"
              :data-test="'secretName-' + variableIndex"
            />
          </div>
          <div class="col-span-1 flex flex-col">
            <label
              :for="'secret-value-input-' + variableIndex"
              class="block text-sm font-medium leading-6"
            >
              Secret Variable
            </label>
            <input
              :id="'secret-value-input-' + variableIndex"
              class="appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              required
              placeholder="Secret Variable"
              v-model="variableValue.secretVar"
              @input="validateVariableSecretVar(variableValue)"
              :data-test="'secretVar-' + variableIndex"
            />
          </div>
          <div class="col-span-1 self-end">
            <button
              v-if="variableValues.length > 1"
              class="btn btn-gray"
              @click="removeVariableValue(variableIndex)"
              :disabled="variableValues.length === 1"
              :data-test="'removeVariableValueButton-' + variableIndex"
            >
              Remove Variable Value
            </button>
          </div>
          <div class="col-span-1 flex flex-col">
            <div
              v-if="variableValue.secretNameError"
              class="text-red-500 text-sm"
            >
              {{ variableValue.secretNameError }}
            </div>
          </div>
          <div class="col-span-1 flex flex-col">
            <div
              v-if="variableValue.secretVarError"
              class="text-red-500 text-sm"
            >
              {{ variableValue.secretVarError }}
            </div>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium leading-6">
            Conditions
          </label>
          <div
            v-for="whenType in whenTypes"
            :key="whenType"
            class="border rounded p-2 relative m-2 divide-y"
          >
            <div
              v-for="whenConditionsType in whenConditionsTypes"
              :key="whenConditionsType"
              class="even:pt-2 odd:pb-2"
            >
              <div class="flex items-center w-full">
                <div class="font-bold">
                  {{ whenType }} {{ whenConditionsType }}
                </div>
                <div class="ml-2">
                  <button
                    class="btn btn-green py-0 px-2"
                    @click.prevent="
                      addWhenCondition(
                        variableIndex,
                        whenType,
                        whenConditionsType
                      )
                    "
                    :data-test="`addWhenConditionButton-${variableIndex}_${whenType}_${whenConditionsType}`"
                  >
                    <i class="mdi mdi-plus" />
                  </button>
                </div>
              </div>
              <div
                v-if="
                  variableValue.when &&
                  variableValue.when[whenType] &&
                  variableValue.when[whenType]![whenConditionsType]
                "
              >
                <div class="flex flex-col">
                  <div
                    v-for="(whenCondition, whenConditionIndex) in variableValue
                      .when[whenType]![whenConditionsType]"
                    :key="whenConditionIndex"
                    class="grid gap-x-8 gap-y-4 grid-cols-3 my-2 space-between"
                    :data-test="`whenCondition-${variableIndex}_${whenType}_${whenConditionsType}_${whenConditionIndex}`"
                  >
                    <div class="col-span-1 flex flex-col">
                      <label class="block text-sm font-medium leading-6">
                        Condition Type
                      </label>

                      <select
                        v-model="whenCondition.type"
                        class="border p-2 rounded w-min-[228px]"
                        :data-test="`whenConditionType-${variableIndex}_${whenType}_${whenConditionsType}_${whenConditionIndex}`"
                      >
                        <option value="simple">Simple</option>
                        <option value="regexp">Regexp</option>
                      </select>
                    </div>
                    <div class="col-span-1 flex flex-col">
                      <label class="block text-sm font-medium leading-6">
                        Condition Match
                      </label>
                      <input
                        type="text"
                        v-model="whenCondition.match"
                        class="appearance-none border p-2 rounded w-min-228 border py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Match"
                        :data-test="`whenConditionMatch-${variableIndex}_${whenType}_${whenConditionsType}_${whenConditionIndex}`"
                      />
                    </div>
                    <div class="col-span-1 flex flex-col">
                      <label class="block text-sm font-medium leading-6">
                        Remove
                      </label>
                      <button
                        class="py-2 self-start"
                        @click="
                          removeWhenCondition(
                            variableIndex,
                            whenType,
                            whenConditionsType,
                            whenConditionIndex
                          )
                        "
                        title="Remove"
                        :data-test="`removeWhenConditionButton-${variableIndex}_${whenType}_${whenConditionsType}_${whenConditionIndex}`"
                      >
                        <i
                          class="mdi mdi-minus-circle-outline"
                          title="Remove"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-200 border-b-1 mt-2"></div>
        </div>
      </div>

      <button
        id="add-secret"
        class="btn btn-green"
        @click="addVariableValue"
        data-test="addVariableValueButton"
      >
        Add Variable Value
      </button>

      <button
        id="submit-save"
        type="submit"
        class="btn btn-blue ml-2"
        :class="{ 'opacity-50 cursor-not-allowed': isSaveButtonDisabled }"
        :disabled="isSaveButtonDisabled"
        data-test="variableCreateButton"
      >
        Save
      </button>
      <div
        v-if="createVariableError"
        class="text-red-500"
        data-test="serverError"
      >
        {{ createVariableError }}
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { useAsyncState } from '@vueuse/core';
import { computed, onUnmounted, PropType, Ref, ref, toRefs, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  APIAbortedError,
  VariableValue as APIVariableValue,
  When as APIWhen,
  WhenCondition as APIWhenCondition,
  WhenConditions as APIWhenConditions,
  errorToString,
  useAPI,
} from '../app/api';
import { useAppState } from '../app/appstate';
import { OperationType } from '../app/types';
import { projectGroupSettingsLink, projectSettingsLink } from '../util/link';
import { isValid, isValidName } from '../util/validator';

interface VariableValue {
  secretName: string;
  secretVar: string;
  when?: When;

  secretNameError?: string;
  secretVarError?: string;
}

interface When {
  branch?: WhenConditions;
  tag?: WhenConditions;
  ref?: WhenConditions;
}

interface WhenConditions {
  include: WhenCondition[];
  exclude: WhenCondition[];
}

interface WhenCondition {
  type: WhenConditionType;
  match: string;
}

enum WhenConditionType {
  Simple = 'simple',
  RegExp = 'regexp',
}

const whenTypes: (keyof When)[] = ['branch', 'tag', 'ref'];
const whenConditionsTypes: (keyof WhenConditions)[] = ['include', 'exclude'];

export default {
  name: 'createupdatevariable',
  props: {
    ownertype: {
      type: String,
      required: true,
    },
    ownername: {
      type: String,
      required: true,
    },
    refType: { type: String, required: true },
    refParam: { type: Array as PropType<Array<string>>, required: true },
    operationType: { type: String as PropType<OperationType>, required: true },
    variableNameParam: { type: String },
  },
  setup(props) {
    const {
      ownertype,
      ownername,
      refType,
      refParam,
      operationType,
      variableNameParam,
    } = toRefs(props);
    const router = useRouter();
    const api = useAPI();
    const appState = useAppState();
    const variableName = ref('');
    const variableValues: Ref<VariableValue[]> = ref([]);
    const variableNameError: Ref<string | undefined> = ref();

    const createVariableError: Ref<unknown | undefined> = ref();
    let fetchAbort = new AbortController();

    onUnmounted(() => {
      fetchAbort.abort();
    });

    const abortFetch = () => {
      fetchAbort.abort();
      fetchAbort = new AbortController();
    };

    const update = async () => {
      abortFetch();
      await refreshVariables();

      if (operationType.value === OperationType.Update) {
        if (!variableNameParam.value) {
          appState.setGlobalError(new Error('empty variable name'));
          return;
        }
        const curVariable = variables.value?.find(
          (variable) => variable.name == variableNameParam.value
        );
        if (!curVariable) {
          appState.setGlobalError(
            new Error(`variable "${variableNameParam.value}" does not exist`)
          );
          return;
        }

        variableName.value = curVariable.name;
        variableValues.value = curVariable.values.map((v): VariableValue => {
          return {
            ...v,
            secretNameError: '',
            secretVarError: '',
          };
        });
      }
    };

    const apiRef = computed(() => {
      return [ownertype.value, ownername.value, ...refParam.value].join('/');
    });

    const fetchVariables = async () => {
      try {
        return await api.getVariables(
          refType.value,
          apiRef.value,
          false,
          fetchAbort.signal
        );
      } catch (e) {
        if (e instanceof APIAbortedError) return;
        appState.setGlobalError(e);
      }
    };

    const { state: variables, execute: refreshVariables } = useAsyncState(
      async () => {
        return await fetchVariables();
      },
      undefined,
      { immediate: false }
    );

    const isSaveButtonDisabled = computed(() => {
      const validVariableValues = variableValues.value.every(
        (v) =>
          isValid(variableSecretNameValidator(v)) &&
          isValid(variableSecretVarValidator(v))
      );

      return !isValid(variableNameValidator()) || !validVariableValues;
    });

    const variableNameValidator = () => {
      const varNameUnique =
        variables.value &&
        !variables.value.some((variable) => {
          if (
            operationType.value == OperationType.Update &&
            variableName.value == variableNameParam.value
          )
            return false;

          return variable.name === variableName.value;
        });

      if (!variableName.value) {
        return 'Variable name is required';
      } else if (!isValidName(variableName.value)) {
        return 'Variable name can only contain alphanumeric ASCII chars and optionally some single hypens in the middle';
      } else if (!varNameUnique) {
        return 'Variable with the specified name already exists';
      }
    };

    const validateVariableName = () => {
      variableNameError.value = variableNameValidator();
    };

    const variableSecretNameValidator = (variable: VariableValue) => {
      if (!variable.secretName) {
        return 'Secret name is required.';
      } else if (!isValidName(variable.secretName)) {
        return 'Secret name cannot contain special chars or spaces';
      }
    };

    const validateVariableSecretName = (variable: VariableValue) => {
      variable.secretNameError = variableSecretNameValidator(variable);
    };

    const variableSecretVarValidator = (variable: VariableValue) => {
      if (!variable.secretVar) {
        return 'Secret variable name is required.';
      }
    };

    const validateVariableSecretVar = (variable: VariableValue) => {
      variable.secretVarError = variableSecretVarValidator(variable);
    };

    const addVariableValue = () => {
      variableValues.value.push({
        secretName: '',
        secretVar: '',
        when: undefined,
        secretNameError: undefined,
        secretVarError: undefined,
      });
    };

    const removeVariableValue = (index: number) => {
      if (variableValues.value.length > 1) {
        variableValues.value.splice(index, 1);
      }
    };

    // TODO(sgotti) Add WhenCondition reordering.

    const addWhenCondition = (
      variableIndex: number,
      whenType: keyof When,
      whenConditionsType: keyof WhenConditions
    ) => {
      if (!variableValues.value[variableIndex]) return;

      const variable = variableValues.value[variableIndex];

      if (!variable.when)
        variable.when = {
          branch: undefined,
          tag: undefined,
          ref: undefined,
        };

      if (!variable.when[whenType]) {
        variable.when[whenType] = {
          include: [],
          exclude: [],
        };
      }

      const variableWhen = variable.when[whenType];
      if (!variableWhen) return;
      variableWhen[whenConditionsType].push({
        type: WhenConditionType.Simple,
        match: '',
      });
    };

    const removeWhenCondition = (
      variableIndex: number,
      whenType: keyof When,
      whenConditionsType: keyof WhenConditions,
      whenConditionIndex: number
    ) => {
      if (!variableValues.value[variableIndex]) return;

      const variable = variableValues.value[variableIndex];

      if (!variable.when) return;

      if (!variable.when[whenType]) return;

      const variableWhen = variable.when[whenType];
      if (!variableWhen) return;
      variableWhen[whenConditionsType].splice(whenConditionIndex, 1);
    };

    const createVariable = async (
      variableName: string,
      variableValues: APIVariableValue[]
    ) => {
      try {
        if (props.refType === 'project') {
          switch (operationType.value) {
            case OperationType.Update:
              if (!variableNameParam.value) return;
              await api.updateProjectVariable(
                apiRef.value,
                variableNameParam.value,
                variableValues,
                variableName
              );
              break;
            case OperationType.Create:
              await api.createProjectVariable(
                apiRef.value,
                variableName,
                variableValues
              );
              break;
          }
          router.push(
            projectSettingsLink(
              ownertype.value,
              ownername.value,
              refParam.value
            )
          );
        }
        if (props.refType === 'projectgroup') {
          switch (operationType.value) {
            case OperationType.Update:
              if (!variableNameParam.value) return;
              await api.updateProjectGroupVariable(
                apiRef.value,
                variableNameParam.value,
                variableValues,
                variableName
              );
              break;
            case OperationType.Create:
              await api.createProjectGroupVariable(
                apiRef.value,
                variableName,
                variableValues
              );
              break;
          }
          router.push(
            projectGroupSettingsLink(
              ownertype.value,
              ownername.value,
              refParam.value
            )
          );
        }
      } catch (e) {
        if (e instanceof APIAbortedError) return;
        createVariableError.value = errorToString(e);
      }
    };

    const whenConditionToAPI = (
      whenCondition: WhenCondition
    ): APIWhenCondition => {
      const mappedWhenCondition = new APIWhenCondition();
      mappedWhenCondition.type = whenCondition.type;
      mappedWhenCondition.match = whenCondition.match;

      return mappedWhenCondition;
    };

    const whenConditionsToAPI = (
      whenConditions: WhenConditions | undefined
    ): APIWhenConditions | undefined => {
      if (!whenConditions) {
        return undefined;
      }

      const mappedWhenConditions = new APIWhenConditions();
      if (whenConditions.include) {
        mappedWhenConditions.include =
          whenConditions.include.map(whenConditionToAPI);
      }
      if (whenConditions.exclude) {
        mappedWhenConditions.exclude =
          whenConditions.exclude.map(whenConditionToAPI);
      }

      return mappedWhenConditions;
    };

    const variableValuesToAPI = (
      variableValues: VariableValue[]
    ): APIVariableValue[] => {
      return variableValues.map((v) => {
        const variableValue = new APIVariableValue();
        Object.assign(variableValue, v);

        variableValue.secretName = v.secretName;
        variableValue.secretVar = v.secretVar;
        if (v.when) {
          const when = new APIWhen();
          when.branch = whenConditionsToAPI(v.when.branch);
          when.tag = whenConditionsToAPI(v.when.tag);
          when.ref = whenConditionsToAPI(v.when.ref);

          variableValue.when = when;
        }

        return variableValue;
      });
    };

    const submitForm = async () => {
      createVariableError.value = undefined;

      const reqVariableValues = variableValuesToAPI(variableValues.value);

      await createVariable(variableName.value, reqVariableValues);
    };

    watch(
      props,
      async () => {
        variableName.value = '';
        variableValues.value = [
          {
            secretName: '',
            secretVar: '',
            when: undefined,
            secretNameError: undefined,
            secretVarError: undefined,
          },
        ];
        variableNameError.value = undefined;
        createVariableError.value = undefined;
        update();
      },
      { immediate: true }
    );

    return {
      variableName,
      variableNameError,
      createVariableError,
      isSaveButtonDisabled,

      validateVariableName,
      validateVariableSecretName,
      validateVariableSecretVar,
      addVariableValue,
      removeVariableValue,
      addWhenCondition,
      removeWhenCondition,
      variableValues,
      submitForm,

      OperationType,
      whenTypes,
      whenConditionsTypes,
    };
  },
};
</script>
