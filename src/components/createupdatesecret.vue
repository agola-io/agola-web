<template>
  <div class="panel">
    <p class="panel-title">
      {{
        operationType == OperationType.Create ? 'New Secret' : 'Update Secret'
      }}
    </p>
    <form @submit.prevent="submitForm" class="p-4">
      <div class="mt-4">
        <label for="secret-name" class="block text-sm font-medium leading-6">
          Secret Name
        </label>
        <input
          id="secret-name"
          class="appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          required
          placeholder="Secret name"
          v-model.trim="secretName"
          @input="validateSecretName"
          data-test="secretNameInput"
        />
        <div v-if="secretNameError" class="text-red-500 text-sm">
          {{ secretNameError }}
        </div>
      </div>

      <div v-for="(pair, index) in secretvalues" :key="index">
        <div class="flex items-center mt-4">
          <div class="flex flex-col">
            <label
              :for="'secret-name-input-' + index"
              class="block text-sm font-medium leading-6"
            >
              Key
            </label>
            <input
              :id="'secret-name-input-' + index"
              class="appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              required
              placeholder="Key"
              v-model.trim="pair.key"
              @input="validateSecretPairKey(index)"
              :data-test="'secretPairKeyInput-' + index"
            />
          </div>
          <div class="col-span-1 flex flex-col ml-2">
            <label
              :for="'secret-value-input-' + index"
              class="block text-sm font-medium leading-6"
            >
              Value
            </label>
            <textarea
              :id="'secret-value-input-' + index"
              class="appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              rows="1"
              placeholder="Value"
              v-model="pair.value"
              :data-test="'secretPairValueInput-' + index"
            />
          </div>
          <div class="col-span-1 self-end ml-2">
            <button
              class="btn btn-gray"
              v-if="secretvalues.length > 1"
              @click="removeKeyValuePair(index)"
              :disabled="secretvalues.length === 1"
              :data-test="'removeSecretPairButton-' + index"
            >
              Remove
            </button>
          </div>
        </div>
        <div v-if="pair.error" class="text-red-500 text-sm">
          {{ pair.error }}
        </div>
      </div>
      <div class="flex mt-4">
        <button
          id="secret-name-add-key"
          class="btn btn-green"
          @click="addKeyValuePair"
          data-test="addSecretPairButton"
        >
          Add Key-Value Pair
        </button>
        <button
          id="submit-save"
          class="btn btn-blue ml-2"
          :class="{ 'opacity-50 cursor-not-allowed': isSaveButtonDisabled }"
          type="submit"
          :disabled="isSaveButtonDisabled"
          data-test="secretCreateButton"
        >
          Save
        </button>
      </div>
      <div
        v-if="createSecretError"
        class="text-red-500"
        data-test="serverError"
      >
        {{ createSecretError }}
      </div>
    </form>
  </div>
</template>
<script lang="ts">
import { useAsyncState } from '@vueuse/core';
import { OperationType } from '../app/types';
import { computed, onUnmounted, PropType, Ref, ref, toRefs, watch } from 'vue';
import { useRouter } from 'vue-router';
import { APIAbortedError, errorToString, useAPI } from '../app/api';
import { useAppState } from '../app/appstate';
import { projectGroupSettingsLink, projectSettingsLink } from '../util/link';
import { isValid, isValidName } from '../util/validator';

interface SecretValues {
  key: string;
  value: string;
  error: string | undefined;
}

export default {
  name: 'createupdatesecret',
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
    secretNameParam: { type: String },
  },
  setup(props) {
    const {
      ownertype,
      ownername,
      refType,
      refParam,
      operationType,
      secretNameParam,
    } = toRefs(props);
    const router = useRouter();
    const api = useAPI();
    const appState = useAppState();
    const secretName = ref('');
    const secretvalues = ref<SecretValues[]>([
      { key: '', value: '', error: '' },
    ]);
    const createSecretError: Ref<unknown | undefined> = ref();
    const secretNameError: Ref<string | undefined> = ref();
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
      await refreshSecrets();

      if (operationType.value === OperationType.Update) {
        if (!secretNameParam.value) {
          appState.setGlobalError(new Error('empty secret name'));
          return;
        }
        const curSecret = secrets.value?.find(
          (secret) => secret.name == secretNameParam.value
        );
        if (!curSecret) {
          appState.setGlobalError(
            new Error(`secret "${secretNameParam.value}" does not exist`)
          );
          return;
        }

        secretName.value = curSecret.name;
      }
    };

    const apiRef = computed(() => {
      return [ownertype.value, ownername.value, ...refParam.value].join('/');
    });

    const fetchSecrets = async () => {
      try {
        return await api.getSecrets(
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

    const { state: secrets, execute: refreshSecrets } = useAsyncState(
      async () => {
        return await fetchSecrets();
      },
      undefined,
      { immediate: false }
    );

    const isSaveButtonDisabled = computed(() => {
      const validKeys = secretvalues.value.every((_, idx) =>
        isValid(secretPairKeyValidator(idx))
      );

      const hasAtLeastOneKeyValuePair = secretvalues.value.some(
        (pair) => !!pair.key
      );

      return (
        !isValid(secretNameValidator()) ||
        !validKeys ||
        !hasAtLeastOneKeyValuePair
      );
    });

    const addKeyValuePair = () =>
      secretvalues.value.push({ key: '', value: '', error: '' });

    const removeKeyValuePair = (index: number) => {
      if (secretvalues.value.length > 1) {
        secretvalues.value.splice(index, 1);
      }
    };

    const secretNameValidator = () => {
      const secretNameUnique =
        secrets.value &&
        !secrets.value.some((secret) => {
          if (
            operationType.value === OperationType.Update &&
            secretName.value == secretNameParam.value
          )
            return false;

          return secret.name === secretName.value;
        });

      if (!secretName.value) {
        return 'Secret name is required';
      } else if (!isValidName(secretName.value)) {
        return 'Secret name can only contain alphanumeric ASCII chars and optionally some single hypens in the middle';
      } else if (!secretNameUnique) {
        return 'Secret with the specified name already exists';
      }
    };

    const validateSecretName = () => {
      secretNameError.value = secretNameValidator();
    };

    const secretPairKeyValidator = (index: number) => {
      const key = secretvalues.value[index].key;
      const duplicateIndex = secretvalues.value.findIndex(
        (pair, i) => i !== index && pair.key === key
      );

      if (!key) {
        return 'Key is required';
      } else if (duplicateIndex !== -1) {
        return 'Duplicate key';
      }
    };

    const validateSecretPairKey = (index: number) => {
      secretvalues.value[index].error = secretPairKeyValidator(index);
    };

    const submitForm = async () => {
      createSecretError.value = undefined;

      const transformedSecretValues: Record<string, string> = {};

      secretvalues.value.forEach((element) => {
        transformedSecretValues[element.key] = element.value;
      });

      try {
        if (props.refType === 'project') {
          switch (operationType.value) {
            case OperationType.Update:
              if (!secretNameParam.value) return;
              await api.updateProjectSecret(
                apiRef.value,
                secretNameParam.value,
                transformedSecretValues,
                secretName.value
              );
              break;
            case OperationType.Create:
              await api.createProjectSecret(
                apiRef.value,
                secretName.value,
                transformedSecretValues
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
              if (!secretNameParam.value) return;
              await api.updateProjectGroupSecret(
                apiRef.value,
                secretNameParam.value,
                transformedSecretValues,
                secretName.value
              );
              break;
            case OperationType.Create:
              await api.createProjectGroupSecret(
                apiRef.value,
                secretName.value,
                transformedSecretValues
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
        createSecretError.value = errorToString(e);
      }
    };

    watch(
      props,
      () => {
        secrets.value = undefined;
        secretName.value = '';
        secretvalues.value = [{ key: '', value: '', error: '' }];
        createSecretError.value = undefined;
        secretNameError.value = undefined;
        update();
      },
      { immediate: true }
    );

    return {
      secretName,
      secretvalues,
      secretNameError,
      isSaveButtonDisabled,
      createSecretError,

      addKeyValuePair,
      removeKeyValuePair,
      submitForm,
      validateSecretName,
      validateSecretPairKey,

      OperationType,
    };
  },
};
</script>
