import { flushPromises, mount } from '@vue/test-utils';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { APIInjectionKey, newAPI } from '../app/api';
import { AppStateInjectionKey, newAppState } from '../app/appstate';
import { OperationType } from '../app/types';
import createupdatesecret from './createupdatesecret.vue';

const server = setupServer();

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Close server after all tests
afterAll(() => server.close());

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers());

let api = newAPI();
let appState = newAppState();

beforeEach(async () => {
  api = newAPI();
  appState = newAppState();
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mountCreateupdatesecret = (props: any) => {
  return mount(createupdatesecret, {
    global: {
      provide: {
        [APIInjectionKey as symbol]: api,
        [AppStateInjectionKey as symbol]: appState,
      },
    },
    props,
  });
};

test('create secret', async () => {
  const handlers = [
    http.get('/api/v1alpha/projects/org%2Forg01%2Fproj01/secrets', () => {
      return HttpResponse.json([
        {
          id: '9589d518-b85f-446a-9424-3d38dc1ac8aa',
          name: 'secret01',
          parent_path: 'org/org01',
        },
      ]);
    }),

    http.post('/api/v1alpha/projects/org%2Forg01%2Fproj01/secrets', () => {
      return HttpResponse.json({
        id: '9589d518-b85f-446a-9424-3d38dc1ac8aa',
        name: 'secret01',
        parent_path: 'org/org01',
      });
    }),
  ];

  server.use(...handlers);

  const wrapper = mountCreateupdatesecret({
    ownertype: 'org',
    ownername: 'org01',
    refType: 'project',
    refParam: ['proj01'],
    operationType: 'create',
  });

  await flushPromises();

  const secretName = wrapper.find<HTMLInputElement>(
    '[data-test="secretNameInput"]'
  );
  const secretKey = wrapper.find<HTMLInputElement>(
    '[data-test="secretPairKeyInput-0"]'
  );
  const secretValue = wrapper.find<HTMLInputElement>(
    '[data-test="secretPairValueInput-0"]'
  );

  secretName.setValue('newsecret01');
  secretKey.setValue('newsecret01key01');
  secretValue.setValue('newsecret01value01');

  wrapper.find('form').trigger('submit.prevent');

  await flushPromises();

  expect(wrapper.router.push).toHaveBeenCalledTimes(1);
  expect(wrapper.router.push).toHaveBeenCalledWith({
    path: '/org/org01/projects/proj01.proj/settings',
  });
});

test('update secret', async () => {
  const handlers = [
    http.get('/api/v1alpha/projects/org%2Forg01%2Fproj01/secrets', () => {
      return HttpResponse.json([
        {
          id: '9589d518-b85f-446a-9424-3d38dc1ac8aa',
          name: 'secret01',
          parent_path: 'org/org01',
        },
      ]);
    }),

    http.put(
      '/api/v1alpha/projects/org%2Forg01%2Fproj01/secrets/secret01',
      () => {
        return HttpResponse.json({
          id: '9589d518-b85f-446a-9424-3d38dc1ac8aa',
          name: 'secret01',
          parent_path: 'org/org01',
        });
      }
    ),
  ];

  server.use(...handlers);

  const wrapper = mountCreateupdatesecret({
    ownertype: 'org',
    ownername: 'org01',
    refType: 'project',
    refParam: ['proj01'],
    operationType: 'update',
    secretNameParam: 'secret01',
  });

  await flushPromises();
  await wrapper.setProps({});

  await flushPromises();

  const secretName = wrapper.find<HTMLInputElement>(
    '[data-test="secretNameInput"]'
  );
  const secretKey = wrapper.find<HTMLInputElement>(
    '[data-test="secretPairKeyInput-0"]'
  );
  const secretValue = wrapper.find<HTMLInputElement>(
    '[data-test="secretPairValueInput-0"]'
  );

  await flushPromises();
  expect(secretName.element.value).toBe('secret01');
  expect(secretKey.element.value).toBe('');
  expect(secretValue.element.value).toBe('');

  await secretName.setValue('secret01newname');
  await secretKey.setValue('secret01key02');
  await secretValue.setValue('secret01value02');

  await flushPromises();

  await wrapper.find('form').trigger('submit.prevent');

  await flushPromises();

  expect(wrapper.router.push).toHaveBeenCalledTimes(1);
  expect(wrapper.router.push).toHaveBeenCalledWith({
    path: '/org/org01/projects/proj01.proj/settings',
  });
});

test('invalid entries', async () => {
  const handlers = [
    http.get('/api/v1alpha/projects/org%2Forg01%2Fproj01/secrets', () => {
      return HttpResponse.json([
        {
          id: '9589d518-b85f-446a-9424-3d38dc1ac8aa',
          name: 'secret01',
          parent_path: 'org/org01',
        },
      ]);
    }),
  ];

  server.use(...handlers);

  const wrapper = mountCreateupdatesecret({
    ownertype: 'org',
    ownername: 'org01',
    refType: 'project',
    refParam: ['proj01'],
    operationType: 'create',
  });

  await flushPromises();

  const secretName = wrapper.find<HTMLInputElement>(
    '[data-test="secretNameInput"]'
  );
  const secretKey = wrapper.find<HTMLInputElement>(
    '[data-test="secretPairKeyInput-0"]'
  );
  const secretValue = wrapper.find<HTMLInputElement>(
    '[data-test="secretPairValueInput-0"]'
  );

  secretName.setValue('');
  secretKey.setValue('');
  secretValue.setValue('');
  expect(wrapper.router.push).not.toHaveBeenCalled();
  const createButton = wrapper.find('[data-test="secretCreateButton"]');
  expect(createButton.attributes('disabled')).toBeDefined();
});

test('reset component in create mode on prop change', async () => {
  const handlers = [
    http.get('/api/v1alpha/projects/org%2Forg01%2Fproj01/secrets', () => {
      return HttpResponse.json([
        {
          id: '9589d518-b85f-446a-9424-3d38dc1ac8aa',
          name: 'org01secret01',
          parent_path: 'org/org01',
        },
      ]);
    }),
    http.get('/api/v1alpha/projects/org%2Forg02%2Fproj01/secrets', () => {
      return HttpResponse.json([
        {
          id: '9589d518-b85f-446a-9424-3d38dc1ac8aa',
          name: 'org02secret01',
          parent_path: 'org/org02',
        },
      ]);
    }),
  ];

  server.use(...handlers);

  const wrapper = mountCreateupdatesecret({
    ownertype: 'org',
    ownername: 'org01',
    refType: 'project',
    refParam: ['proj01'],
    operationType: 'create',
  });

  await flushPromises();
  const secretName = wrapper.find<HTMLInputElement>(
    '[data-test="secretNameInput"]'
  );
  const secretKey = wrapper.find<HTMLInputElement>(
    '[data-test="secretPairKeyInput-0"]'
  );
  const secretValue = wrapper.find<HTMLInputElement>(
    '[data-test="secretPairValueInput-0"]'
  );

  await secretName.setValue('secret01');
  await secretKey.setValue('secret01key01');
  await secretValue.setValue('secret01value01');

  await wrapper.setProps({
    ownertype: 'org',
    ownername: 'org02',
  });
  await flushPromises();
  expect(secretName.element.value).toBe('');
  expect(secretKey.element.value).toBe('');
  expect(secretValue.element.value).toBe('');
});

test('reset component in update mode on prop change', async () => {
  const handlers = [
    http.get('/api/v1alpha/projects/org%2Forg01%2Fproj01/secrets', () => {
      return HttpResponse.json([
        {
          id: '9589d518-b85f-446a-9424-3d38dc1ac8aa',
          name: 'org01secret01',
          parent_path: 'org/org01',
        },
      ]);
    }),
    http.get('/api/v1alpha/projects/org%2Forg02%2Fproj01/secrets', () => {
      return HttpResponse.json([
        {
          id: '9589d518-b85f-446a-9424-3d38dc1ac8aa',
          name: 'org02secret01',
          parent_path: 'org/org02',
        },
      ]);
    }),
  ];

  server.use(...handlers);

  const wrapper = mountCreateupdatesecret({
    ownertype: 'org',
    ownername: 'org01',
    refType: 'project',
    refParam: ['proj01'],
    operationType: 'update',
    secretNameParam: 'secret01',
  });

  await flushPromises();
  const secretName = wrapper.find<HTMLInputElement>(
    '[data-test="secretNameInput"]'
  );
  const secretKey = wrapper.find<HTMLInputElement>(
    '[data-test="secretPairKeyInput-0"]'
  );
  const secretValue = wrapper.find<HTMLInputElement>(
    '[data-test="secretPairValueInput-0"]'
  );

  await secretName.setValue('secret01newname');
  await secretKey.setValue('secret01key01');
  await secretValue.setValue('secret01value01');

  await wrapper.setProps({
    ownertype: 'org',
    ownername: 'org02',
    secretNameParam: 'org02secret01',
  });
  await flushPromises();

  expect(secretName.element.value).toBe('org02secret01');
  expect(secretKey.element.value).toBe('');
  expect(secretValue.element.value).toBe('');
});

test('reset component in create mode on prop change to update mode', async () => {
  const handlers = [
    http.get('/api/v1alpha/projects/org%2Forg01%2Fproj01/secrets', () => {
      return HttpResponse.json([
        {
          id: '9589d518-b85f-446a-9424-3d38dc1ac8aa',
          name: 'org01secret01',
          parent_path: 'org/org01',
        },
      ]);
    }),
    http.get('/api/v1alpha/projects/org%2Forg02%2Fproj01/secrets', () => {
      return HttpResponse.json([
        {
          id: '9589d518-b85f-446a-9424-3d38dc1ac8aa',
          name: 'org02secret01',
          parent_path: 'org/org02',
        },
      ]);
    }),
  ];

  server.use(...handlers);

  const wrapper = mountCreateupdatesecret({
    ownertype: 'org',
    ownername: 'org01',
    refType: 'project',
    refParam: ['proj01'],
    operationType: 'create',
  });

  await flushPromises();
  const secretName = wrapper.find<HTMLInputElement>(
    '[data-test="secretNameInput"]'
  );
  const secretKey = wrapper.find<HTMLInputElement>(
    '[data-test="secretPairKeyInput-0"]'
  );
  const secretValue = wrapper.find<HTMLInputElement>(
    '[data-test="secretPairValueInput-0"]'
  );

  await secretName.setValue('secret01');
  await secretKey.setValue('secret01key01');
  await secretValue.setValue('secret01value01');

  await wrapper.setProps({
    ownertype: 'org',
    ownername: 'org02',
    operationType: OperationType.Update,
    secretNameParam: 'org02secret01',
  });

  await flushPromises();

  expect(secretName.element.value).toBe('org02secret01');
  expect(secretKey.element.value).toBe('');
  expect(secretValue.element.value).toBe('');
});

test('reset component in update mode on prop change to create mode', async () => {
  const handlers = [
    http.get('/api/v1alpha/projects/org%2Forg01%2Fproj01/secrets', () => {
      return HttpResponse.json([
        {
          id: '9589d518-b85f-446a-9424-3d38dc1ac8aa',
          name: 'org01secret01',
          parent_path: 'org/org01',
        },
      ]);
    }),
    http.get('/api/v1alpha/projects/org%2Forg02%2Fproj01/secrets', () => {
      return HttpResponse.json([
        {
          id: '9589d518-b85f-446a-9424-3d38dc1ac8aa',
          name: 'org02secret01',
          parent_path: 'org/org02',
        },
      ]);
    }),
  ];

  server.use(...handlers);

  const wrapper = mountCreateupdatesecret({
    ownertype: 'org',
    ownername: 'org01',
    refType: 'project',
    refParam: ['proj01'],
    operationType: 'update',
    secretNameParam: 'secret01',
  });

  await flushPromises();
  const secretName = wrapper.find<HTMLInputElement>(
    '[data-test="secretNameInput"]'
  );
  const secretKey = wrapper.find<HTMLInputElement>(
    '[data-test="secretPairKeyInput-0"]'
  );
  const secretValue = wrapper.find<HTMLInputElement>(
    '[data-test="secretPairValueInput-0"]'
  );

  await secretName.setValue('secret01newname');
  await secretKey.setValue('secret01key01');
  await secretValue.setValue('secret01value01');

  await wrapper.setProps({
    ownertype: 'org',
    ownername: 'org02',
    operationType: OperationType.Create,
    secretNameParam: '',
  });
  await flushPromises();

  expect(secretName.element.value).toBe('');
  expect(secretKey.element.value).toBe('');
  expect(secretValue.element.value).toBe('');
});

test("don't reset component when props are updated with the current values", async () => {
  const handlers = [
    http.get('/api/v1alpha/projects/org%2Forg01%2Fproj01/secrets', () => {
      return HttpResponse.json([
        {
          id: '9589d518-b85f-446a-9424-3d38dc1ac8aa',
          name: 'org01secret01',
          parent_path: 'org/org01',
        },
      ]);
    }),
  ];

  server.use(...handlers);

  const wrapper = mountCreateupdatesecret({
    ownertype: 'org',
    ownername: 'org01',
    refType: 'project',
    refParam: ['proj01'],
    operationType: 'create',
  });

  await flushPromises();
  const secretName = wrapper.find<HTMLInputElement>(
    '[data-test="secretNameInput"]'
  );
  const secretPairKey = wrapper.find<HTMLInputElement>(
    '[data-test="secretPairKeyInput-0"]'
  );
  const secretPairValue = wrapper.find<HTMLInputElement>(
    '[data-test="secretPairValueInput-0"]'
  );

  await secretName.setValue('newsecname');
  await secretPairKey.setValue('secret01key01');
  await secretPairValue.setValue('secret01value01');

  const initialSecretNameValue = secretName.element.value;
  const initialSecretPairKeyValue = secretPairKey.element.value;
  const initialSecretPairValueValue = secretPairValue.element.value;

  await wrapper.setProps(wrapper.props());

  await flushPromises();
  expect(secretName.element.value).toBe(initialSecretNameValue);
  expect(secretPairKey.element.value).toBe(initialSecretPairKeyValue);
  expect(secretPairValue.element.value).toBe(initialSecretPairValueValue);
});

test('add and remove secret key values', async () => {
  const handlers = [
    http.get('/api/v1alpha/projects/org%2Forg01%2Fproj01/secrets', () => {
      return HttpResponse.json([
        {
          id: '9589d518-b85f-446a-9424-3d38dc1ac8aa',
          name: 'org01secret01',
          parent_path: 'org/org01',
        },
      ]);
    }),
  ];

  server.use(...handlers);

  const wrapper = mountCreateupdatesecret({
    ownertype: 'org',
    ownername: 'org01',
    refType: 'project',
    refParam: ['proj01'],
    operationType: 'create',
  });

  await flushPromises();

  const addSecretPairButton = wrapper.find('[data-test="addSecretPairButton"]');

  addSecretPairButton.trigger('click');
  addSecretPairButton.trigger('click');
  await flushPromises();

  let secretPairKeyInputs = wrapper.findAll<HTMLInputElement>(
    '[data-test^="secretPairKeyInput-"]'
  );

  expect(secretPairKeyInputs.length).toBe(3);

  const newSecretPairKeyInput = secretPairKeyInputs[1];
  newSecretPairKeyInput.setValue('newkey');

  const removeKeyButton = wrapper.findAll(
    '[data-test^="removeSecretPairButton-"]'
  )[1];
  removeKeyButton.trigger('click');

  await flushPromises();
  secretPairKeyInputs = wrapper.findAll<HTMLInputElement>(
    '[data-test^="secretPairKeyInput-"]'
  );
  expect(secretPairKeyInputs.length).toBe(2);

  expect(secretPairKeyInputs[0].element.value).toBe('');
  expect(secretPairKeyInputs[1].element.value).toBe('');
});

test('error response from the server is correctly displayed', async () => {
  const handlers = [
    http.get('/api/v1alpha/projects/org%2Forg01%2Fproj01/secrets', () => {
      return HttpResponse.json([
        {
          id: '9589d518-b85f-446a-9424-3d38dc1ac8aa',
          name: 'secret01',
          parent_path: 'org/org01',
        },
      ]);
    }),
    http.post('/api/v1alpha/projects/org%2Forg01%2Fproj01/secrets', () => {
      return new HttpResponse(
        JSON.stringify([{ code: 'projectGroupDoesNotExist' }]),
        {
          status: 400,
        }
      );
    }),
  ];

  server.use(...handlers);

  const wrapper = mountCreateupdatesecret({
    ownertype: 'org',
    ownername: 'org01',
    refType: 'project',
    refParam: ['proj01'],
    operationType: 'create',
  });

  await flushPromises();

  const secretName = wrapper.find<HTMLInputElement>(
    '[data-test="secretNameInput"]'
  );
  const secretKey = wrapper.find<HTMLInputElement>(
    '[data-test="secretPairKeyInput-0"]'
  );
  const secretValue = wrapper.find<HTMLInputElement>(
    '[data-test="secretPairValueInput-0"]'
  );

  await secretName.setValue('secret01');
  await secretKey.setValue('secret01key01');
  await secretValue.setValue('secret01value01');

  wrapper.find('form').trigger('submit.prevent');

  await flushPromises();

  expect(wrapper.router.push).not.toHaveBeenCalled();

  const serverError = wrapper.find('[data-test="serverError"]');
  expect(serverError.text()).toBe('Project group does not exist');
});
