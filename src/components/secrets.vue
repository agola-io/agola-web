<template>
  <div>
    <div class="my-3 flex font-bold">
      <div class="w-2/12">Name</div>
    </div>
    <div
      class="flex hover:bg-gray-100 transition duration-300 ease-in-out pl-2"
      v-for="(secret, index) in secrets"
      :key="secret.id"
    >
      <div class="w-11/12 flex justify-between py-2 border-gray-200">
        <div class="flex flex-col">
          <span class="name">{{ secret.name }}</span>
          <div v-if="showparentpath" class="text-sm font-light">
            from {{ secret.parentPath }}
          </div>
        </div>
        <div
          v-if="!showparentpath"
          class="col-span-1 flex items-center justify-end space-x-2"
        >
          <button
            type="button"
            class="bg-transparent group-hover:bg-blue-100 transition duration-300 ease-in-out"
            @click="openDeleteSecretDialog(secret)"
            :data-test="'deleteSecretButton-' + index"
          >
            <span class="mdi mdi-delete"></span>
          </button>
          <button
            type="button"
            class="bg-transparent group-hover:bg-blue-100 transition duration-300 ease-in-out"
            @click="gotoSecretUpdate(secret.name)"
            :data-test="'updateSecretButton-' + index"
          >
            <span class="mdi mdi-pencil"></span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <confirmationDialog
    v-if="showDeleteSecretDialog"
    :show="showDeleteSecretDialog"
    @result="handleDeleteSecretDialogResult"
  >
    <template v-slot:title>Delete secret</template>
    <template v-slot:body>{{ modalDescription }}</template>
  </confirmationDialog>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, Ref, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import { ApiError, errorToString, SecretResponse, useAPI } from '../app/api';
import { useAppState } from '../app/appstate';
import {
  projectGroupUpdateSecretLink,
  projectUpdateSecretLink,
} from '../util/link';
import confirmationDialog from './modals/confirmationDialog.vue';

export default defineComponent({
  components: { confirmationDialog },
  name: 'secrets',
  emits: ['secret-deleted'],
  props: {
    secrets: {
      type: Array as PropType<Array<SecretResponse>>,
      required: true,
    },
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
    showparentpath: Boolean,
  },
  setup(props, { emit }) {
    const { ownertype, ownername, projectref, refType } = toRefs(props);
    const api = useAPI();
    const appState = useAppState();
    const router = useRouter();
    const confirmationMessage = ref('');
    const showDeleteSecretDialog = ref(false);
    const secretNameToDelete = ref<SecretResponse>({
      id: '',
      name: '',
      parentPath: '',
    });

    const deleteSecretError: Ref<unknown | undefined> = ref();

    const apiRef = computed(() => {
      if (projectref.value) {
        return [ownertype.value, ownername.value, ...projectref.value].join(
          '/'
        );
      }

      return '';
    });

    const modalDescription = computed(() => {
      return `Are you sure you want to delete the secret
        '${secretNameToDelete.value.name}'?`;
    });

    const handleDeleteSecretDialogResult = async (value: boolean) => {
      showDeleteSecretDialog.value = false;
      if (value) {
        await deleteSecret(secretNameToDelete.value);
        emit('secret-deleted', secretNameToDelete.value);
      }
    };

    const openDeleteSecretDialog = (secretToDelete: SecretResponse) => {
      showDeleteSecretDialog.value = true;
      secretNameToDelete.value = secretToDelete;
    };

    const closeDeleteSecretDialog = () => {
      showDeleteSecretDialog.value = false;
    };

    const deleteSecret = async (secretNameToDelete: SecretResponse) => {
      try {
        if (refType.value === 'project') {
          await api.deleteProjectSecret(secretNameToDelete.name, apiRef.value);
        } else {
          await api.deleteProjectGroupSecret(
            secretNameToDelete.name,
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

    const gotoSecretUpdate = (secretToUpdate: string) => {
      if (refType.value == 'project')
        router.push(
          projectUpdateSecretLink(
            ownertype.value,
            ownername.value,
            projectref.value,
            secretToUpdate
          )
        );
      if (refType.value == 'projectgroup')
        router.push(
          projectGroupUpdateSecretLink(
            ownertype.value,
            ownername.value,
            projectref.value,
            secretToUpdate
          )
        );
    };

    return {
      deleteSecretError: computed(() => errorToString(deleteSecretError.value)),
      modalDescription,
      showDeleteSecretDialog,
      confirmationMessage,

      gotoSecretUpdate,
      openDeleteSecretDialog,
      closeDeleteSecretDialog,
      handleDeleteSecretDialogResult,
    };
  },
});
</script>
