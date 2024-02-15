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
      <div class="w-1/12 flex justify-center items-center">Actions</div>
    </div>
    <div
      v-for="variable in variables"
      :key="variable.id"
      class="line-container my-2 rounded hover:bg-gray-100"
    >
      <div class="flex items-center p-2">
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
        <div class="w-1/12 flex justify-center items-center">
          <span
            class="mdi mdi-pencil rounded-full p-1 mr-1"
            v-if="!showparentpath"
            @click="gotoVariableUpdate(variable.name)"
            style="cursor: pointer"
          ></span>
          <span
            class="mdi mdi-delete rounded-full p-1"
            v-if="!showparentpath"
            @click="openDeleteVariableDialog(variable.name)"
            style="cursor: pointer"
          ></span>
        </div>
      </div>
    </div>

    <confirmationDialog
      v-if="showDeleteVariableDialog"
      :show="showDeleteVariableDialog"
      @result="handleDeleteVariableDialogResult"
    >
      <template v-slot:title>Delete variable</template>
      <template v-slot:body>{{ modalDescription }}</template>
    </confirmationDialog>
  </div>
</template>

<script lang="ts">
import {
  ApiError,
  VariableResponse,
  When,
  WhenConditions,
  errorToString,
  useAPI,
} from '../app/api';
import { computed, defineComponent, PropType, ref, Ref, toRefs } from 'vue';
import { useAppState } from '../app/appstate';
import confirmationDialog from './modals/confirmationDialog.vue';
import {
  projectGroupUpdateVariableLink,
  projectUpdateVariableLink,
} from '../util/link';
import { useRouter } from 'vue-router';

interface FlatWhenConditions {
  condType: string;
  cond: WhenConditions | undefined;
}

const whenTypes: (keyof When)[] = ['branch', 'tag', 'ref'];

export default defineComponent({
  components: { confirmationDialog },
  name: 'vars',
  emits: ['variable-deleted'],
  props: {
    variables: {
      type: Array as PropType<Array<VariableResponse>>,
      required: true,
    },
    showparentpath: Boolean,
    refType: { type: String, required: true },
    ownertype: {
      type: String,
      required: true,
    },
    ownername: {
      type: String,
      required: true,
    },
    projectref: { type: Array as PropType<Array<string>>, required: true },
  },
  setup(props, { emit }) {
    const { ownertype, ownername, projectref, refType } = toRefs(props);
    const api = useAPI();
    const router = useRouter();
    const appState = useAppState();
    const confirmationMessage = ref('');
    const showDeleteVariableDialog = ref(false);
    const variableNameToDelete = ref('');
    const deleteVariableError: Ref<unknown | undefined> = ref();
    const apiRef = computed(() => {
      if (projectref.value) {
        return [ownertype.value, ownername.value, ...projectref.value].join(
          '/'
        );
      }
      return '';
    });

    const getWhenConditions = (when: When) => {
      const wc: FlatWhenConditions[] = [];
      for (const type of whenTypes) {
        wc.push({
          condType: type,
          cond: when[type],
        });
      }
      return wc;
    };

    const modalDescription = computed(() => {
      return `Are you sure you want to delete the variable
        '${variableNameToDelete.value}'?`;
    });

    const handleDeleteVariableDialogResult = async (value: boolean) => {
      showDeleteVariableDialog.value = false;
      if (value) {
        await deleteVariable(variableNameToDelete);
        emit('variable-deleted', variableNameToDelete.value);
      }
    };

    const openDeleteVariableDialog = (variableName: string) => {
      showDeleteVariableDialog.value = true;
      variableNameToDelete.value = variableName;
    };

    const closeDeleteVariableDialog = () => {
      showDeleteVariableDialog.value = false;
    };

    const deleteVariable = async (variableName: Ref<string>) => {
      try {
        if (refType.value === 'project') {
          await api.deleteProjectVariable(variableName.value, apiRef.value);
        } else {
          await api.deleteProjectGroupVariable(
            variableName.value,
            apiRef.value
          );
        }
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        appState.setGlobalError(e);
      }
    };

    const gotoVariableUpdate = (variableName: string) => {
      if (refType.value == 'project')
        router.push(
          projectUpdateVariableLink(
            ownertype.value,
            ownername.value,
            projectref.value,
            variableName
          )
        );
      if (refType.value == 'projectgroup')
        router.push(
          projectGroupUpdateVariableLink(
            ownertype.value,
            ownername.value,
            projectref.value,
            variableName
          )
        );
    };

    return {
      getWhenConditions,
      deleteVariableError: computed(() =>
        errorToString(deleteVariableError.value)
      ),
      modalDescription,
      showDeleteVariableDialog,
      confirmationMessage,

      gotoVariableUpdate,
      openDeleteVariableDialog,
      closeDeleteVariableDialog,
      handleDeleteVariableDialogResult,
    };
  },
});
</script>
