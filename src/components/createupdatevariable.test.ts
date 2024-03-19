import { flushPromises, mount } from '@vue/test-utils';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { APIInjectionKey, newAPI } from '../app/api';
import { AppStateInjectionKey, newAppState } from '../app/appstate';
import { OperationType } from '../app/types';
import createupdatevariable from './createupdatevariable.vue';

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
const mountCreateupdatevariable = (props: any) => {
  return mount(createupdatevariable, {
    global: {
      provide: {
        [APIInjectionKey as symbol]: api,
        [AppStateInjectionKey as symbol]: appState,
      },
    },
    props,
  });
};

test('create variable', async () => {
  const handlers = [
    http.get('/api/v1alpha/projects/org%2Forg01%2Fproj01/variables', () => {
      return HttpResponse.json([
        {
          id: '4ac38e9d-2b7e-47b5-a19e-e57e0bb216eb',
          name: 'variable01',
          values: [
            {
              secret_name: 'secret01',
              secret_var: 'secretvariable01',
              matching_secret_parent_path: 'org/org01',
              when: {},
            },
          ],
          parent_path: 'org/org01',
        },
      ]);
    }),
    http.post('/api/v1alpha/projects/org%2Forg01%2Fproj01/variables', () => {
      return HttpResponse.json({
        id: 'c733ea84-9a15-473b-b8c6-cf5b6c8a68fb',
        name: 'variable01',
        values: [
          {
            secret_name: 'secret01',
            secret_var: 'secretvariable01',
            matching_secret_parent_path: 'org/org01',
            when: {},
          },
        ],
        parent_path: 'org/org01',
      });
    }),
  ];
  server.use(...handlers);

  const wrapper = mountCreateupdatevariable({
    ownertype: 'org',
    ownername: 'org01',
    refType: 'project',
    refParam: ['proj01'],
    operationType: 'create',
  });
  await flushPromises();

  const variableName = wrapper.find<HTMLInputElement>(
    '[data-test="variableName"]'
  );
  const secretName = wrapper.find<HTMLInputElement>(
    '[data-test="secretName-0"]'
  );
  const secretVar = wrapper.find<HTMLInputElement>('[data-test="secretVar-0"]');

  await variableName.setValue('newvariable01');
  await secretName.setValue('newsecret01');
  await secretVar.setValue('newsecret01value01');

  wrapper.find('form').trigger('submit.prevent');

  await flushPromises();
  expect(wrapper.router.push).toHaveBeenCalledTimes(1);
  expect(wrapper.router.push).toHaveBeenCalledWith({
    path: '/org/org01/projects/proj01.proj/settings',
  });
});

test('update variable', async () => {
  const handlers = [
    http.get('/api/v1alpha/projects/org%2Forg01%2Fproj01/variables', () => {
      return HttpResponse.json([
        {
          id: '4ac38e9d-2b7e-47b5-a19e-e57e0bb216eb',
          name: 'variable01',
          values: [
            {
              secret_name: 'secret01',
              secret_var: 'secretvariable01',
              matching_secret_parent_path: 'org/org01',
              when: {},
            },
          ],
          parent_path: 'org/org01',
        },
      ]);
    }),
    http.put(
      '/api/v1alpha/projects/org%2Forg01%2Fproj01/variables/variable01',
      () => {
        return HttpResponse.json({
          id: '4ac38e9d-2b7e-47b5-a19e-e57e0bb216ebmm',
          name: 'variable01',
          values: [
            {
              secret_name: 'secret01',
              secret_var: 'secretvariable01',
              matching_secret_parent_path: 'org/org01',
              when: {},
            },
          ],
          parent_path: 'org/org01',
        });
      }
    ),
  ];

  server.use(...handlers);
  const wrapper = mountCreateupdatevariable({
    ownertype: 'org',
    ownername: 'org01',
    refType: 'project',
    refParam: ['proj01'],
    operationType: 'update',
    variableNameParam: 'variable01',
  });

  await flushPromises();
  await wrapper.setProps({});

  await flushPromises();

  const variableName = wrapper.find<HTMLInputElement>(
    '[data-test="variableName"]'
  );
  const secretName = wrapper.find<HTMLInputElement>(
    '[data-test="secretName-0"]'
  );
  const secretVar = wrapper.find<HTMLInputElement>('[data-test="secretVar-0"]');
  await flushPromises();
  expect(variableName.element.value).toBe('variable01');
  expect(secretName.element.value).toBe('secret01');
  expect(secretVar.element.value).toBe('secretvariable01');
  await variableName.setValue('variable01newname');
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
    http.get('/api/v1alpha/projects/org%2Forg01%2Fproj01/variables', () => {
      return HttpResponse.json([
        {
          id: '4ac38e9d-2b7e-47b5-a19e-e57e0bb216eb',
          name: 'variable01',
          values: [
            {
              secret_name: 'secret01',
              secret_var: 'secretvariable01',
              matching_secret_parent_path: 'org/org01',
              when: {},
            },
          ],
          parent_path: 'org/org01',
        },
      ]);
    }),
  ];

  server.use(...handlers);

  const wrapper = mountCreateupdatevariable({
    ownertype: 'org',
    ownername: 'org01',
    refType: 'project',
    refParam: ['proj01'],
    operationType: 'create',
  });

  const variableName = wrapper.find<HTMLInputElement>(
    '[data-test="variableName"]'
  );
  const secretName = wrapper.find<HTMLInputElement>(
    '[data-test="secretName-0"]'
  );
  const secretVar = wrapper.find<HTMLInputElement>('[data-test="secretVar-0"]');

  await variableName.setValue('');
  await secretName.setValue('');
  await secretVar.setValue('');
  expect(wrapper.router.push).not.toHaveBeenCalled();
  const createButton = wrapper.find('[data-test="variableCreateButton"]');
  expect(createButton.attributes('disabled')).toBeDefined();
});

test('reset component in create mode on prop change', async () => {
  const handlers = [
    http.get('/api/v1alpha/projects/org%2Forg01%2Fproj01/variables', () => {
      return HttpResponse.json([
        {
          id: '4ac38e9d-2b7e-47b5-a19e-e57e0bb216eb',
          name: 'org01variable01',
          values: [
            {
              secret_name: 'secret01',
              secret_var: 'secretvariable01',
              matching_secret_parent_path: 'org/org01',
              when: {},
            },
          ],
          parent_path: 'org/org01',
        },
      ]);
    }),
    http.get('/api/v1alpha/projects/org%2Forg02%2Fproj01/variables', () => {
      return HttpResponse.json([
        {
          id: '4ac38e9d-2b7e-47b5-a19e-e57e0bb216eb',
          name: 'org02variable01',
          values: [
            {
              secret_name: 'secret01',
              secret_var: 'secretvariable01',
              matching_secret_parent_path: 'org/org02',
              when: {},
            },
          ],
          parent_path: 'org/org02',
        },
      ]);
    }),
  ];

  server.use(...handlers);

  const wrapper = mountCreateupdatevariable({
    ownertype: 'org',
    ownername: 'org01',
    refType: 'project',
    refParam: ['proj01'],
    operationType: 'create',
  });

  await flushPromises();
  const variableName = wrapper.find<HTMLInputElement>(
    '[data-test="variableName"]'
  );
  const secretName = wrapper.find<HTMLInputElement>(
    '[data-test="secretName-0"]'
  );
  const secretVar = wrapper.find<HTMLInputElement>('[data-test="secretVar-0"]');
  await variableName.setValue('variable01');
  await secretName.setValue('secret01');
  await secretVar.setValue('secret01value01');

  await wrapper.setProps({
    ownertype: 'org',
    ownername: 'org02',
  });
  await flushPromises();
  expect(variableName.element.value).toBe('');
  expect(secretName.element.value).toBe('');
  expect(secretVar.element.value).toBe('');
});

test('reset component in update mode on prop change', async () => {
  const handlers = [
    http.get('/api/v1alpha/projects/org%2Forg01%2Fproj01/variables', () => {
      return HttpResponse.json([
        {
          id: '4ac38e9d-2b7e-47b5-a19e-e57e0bb216eb',
          name: 'org01variable01',
          values: [
            {
              secret_name: 'secret01',
              secret_var: 'secretvariable01',
              matching_secret_parent_path: 'org/org01',
              when: {},
            },
          ],
          parent_path: 'org/org01',
        },
      ]);
    }),
    http.get('/api/v1alpha/projects/org%2Forg02%2Fproj01/variables', () => {
      return HttpResponse.json([
        {
          id: '4ac38e9d-2b7e-47b5-a19e-e57e0bb216eb',
          name: 'org02variable01',
          values: [
            {
              secret_name: 'secret01',
              secret_var: 'secretvariable01',
              matching_secret_parent_path: 'org/org02',
              when: {},
            },
          ],
          parent_path: 'org/org02',
        },
      ]);
    }),
  ];

  server.use(...handlers);

  const wrapper = mountCreateupdatevariable({
    ownertype: 'org',
    ownername: 'org01',
    refType: 'project',
    refParam: ['proj01'],
    operationType: 'update',
    variableNameParam: 'variable01',
  });

  await flushPromises();
  const variableName = wrapper.find<HTMLInputElement>(
    '[data-test="variableName"]'
  );
  const secretName = wrapper.find<HTMLInputElement>(
    '[data-test="secretName-0"]'
  );
  const secretVar = wrapper.find<HTMLInputElement>('[data-test="secretVar-0"]');
  await variableName.setValue('variable01newname');
  await secretName.setValue('secret01');
  await secretVar.setValue('secret01value01');

  await wrapper.setProps({
    ownertype: 'org',
    ownername: 'org02',
    variableNameParam: 'org02variable01',
  });
  await flushPromises();
  expect(variableName.element.value).toBe('org02variable01');
});

test('reset component in create mode on prop change to update mode', async () => {
  const handlers = [
    http.get('/api/v1alpha/projects/org%2Forg01%2Fproj01/variables', () => {
      return HttpResponse.json([
        {
          id: '4ac38e9d-2b7e-47b5-a19e-e57e0bb216eb',
          name: 'org01variable01',
          values: [
            {
              secret_name: 'secret01',
              secret_var: 'secretvariable01',
              matching_secret_parent_path: 'org/org01',
              when: {},
            },
          ],
          parent_path: 'org/org01',
        },
      ]);
    }),
    http.get('/api/v1alpha/projects/org%2Forg02%2Fproj01/variables', () => {
      return HttpResponse.json([
        {
          id: '4ac38e9d-2b7e-47b5-a19e-e57e0bb216eb',
          name: 'org02variable01',
          values: [
            {
              secret_name: 'secret01',
              secret_var: 'secretvariable01',
              matching_secret_parent_path: 'org/org02',
              when: {},
            },
          ],
          parent_path: 'org/org02',
        },
      ]);
    }),
  ];

  server.use(...handlers);

  const wrapper = mountCreateupdatevariable({
    ownertype: 'org',
    ownername: 'org01',
    refType: 'project',
    refParam: ['proj01'],
    operationType: 'create',
  });

  await flushPromises();
  const variableName = wrapper.find<HTMLInputElement>(
    '[data-test="variableName"]'
  );
  const secretName = wrapper.find<HTMLInputElement>(
    '[data-test="secretName-0"]'
  );
  const secretVar = wrapper.find<HTMLInputElement>('[data-test="secretVar-0"]');
  await variableName.setValue('variable01');
  await secretName.setValue('secret01');
  await secretVar.setValue('secret01value01');

  await wrapper.setProps({
    ownertype: 'org',
    ownername: 'org02',
    operationType: OperationType.Update,
    variableNameParam: 'org02variable01',
  });

  await flushPromises();
  expect(variableName.element.value).toBe('org02variable01');
});

test('reset component in update mode on prop change to create mode', async () => {
  const handlers = [
    http.get('/api/v1alpha/projects/org%2Forg01%2Fproj01/variables', () => {
      return HttpResponse.json([
        {
          id: '4ac38e9d-2b7e-47b5-a19e-e57e0bb216eb',
          name: 'org01variable01',
          values: [
            {
              secret_name: 'secret01',
              secret_var: 'secretvariable01',
              matching_secret_parent_path: 'org/org01',
              when: {},
            },
          ],
          parent_path: 'org/org01',
        },
      ]);
    }),
    http.get('/api/v1alpha/projects/org%2Forg02%2Fproj01/variables', () => {
      return HttpResponse.json([
        {
          id: '4ac38e9d-2b7e-47b5-a19e-e57e0bb216eb',
          name: 'org02variable01',
          values: [
            {
              secret_name: 'secret01',
              secret_var: 'secretvariable01',
              matching_secret_parent_path: 'org/org02',
              when: {},
            },
          ],
          parent_path: 'org/org02',
        },
      ]);
    }),
  ];

  server.use(...handlers);

  const wrapper = mountCreateupdatevariable({
    ownertype: 'org',
    ownername: 'org01',
    refType: 'project',
    refParam: ['proj01'],
    operationType: 'update',
    variableNameParam: 'variable01',
  });

  await flushPromises();
  const variableName = wrapper.find<HTMLInputElement>(
    '[data-test="variableName"]'
  );
  const secretName = wrapper.find<HTMLInputElement>(
    '[data-test="secretName-0"]'
  );
  const secretVar = wrapper.find<HTMLInputElement>('[data-test="secretVar-0"]');
  await variableName.setValue('variable01newname');
  await secretName.setValue('secret01');
  await secretVar.setValue('secret01value01');

  await wrapper.setProps({
    ownertype: 'org',
    ownername: 'org02',
    operationType: OperationType.Create,
    variableNameParam: '',
  });

  await flushPromises();
  expect(variableName.element.value).toBe('');
  expect(secretName.element.value).toBe('');
  expect(secretVar.element.value).toBe('');
});

test("don't reset component when props are updated with the current values", async () => {
  const handlers = [
    http.get('/api/v1alpha/projects/org%2Forg01%2Fproj01/variables', () => {
      return HttpResponse.json([
        {
          id: '4ac38e9d-2b7e-47b5-a19e-e57e0bb216eb',
          name: 'org01variable01',
          values: [
            {
              secret_name: 'secret01',
              secret_var: 'secretvariable01',
              matching_secret_parent_path: 'org/org01',
              when: {},
            },
          ],
          parent_path: 'org/org01',
        },
      ]);
    }),
  ];
  server.use(...handlers);

  const wrapper = mountCreateupdatevariable({
    ownertype: 'org',
    ownername: 'org01',
    refType: 'project',
    refParam: ['proj01'],
    operationType: 'create',
  });

  const variableName = wrapper.find<HTMLInputElement>(
    '[data-test="variableName"]'
  );
  const secretName = wrapper.find<HTMLInputElement>(
    '[data-test="secretName-0"]'
  );
  const secretVar = wrapper.find<HTMLInputElement>('[data-test="secretVar-0"]');

  await variableName.setValue('newvarname');
  await secretName.setValue('secret01');
  await secretVar.setValue('ecret01value01');

  const initialVariableNameValue = variableName.element.value;
  const initialSecretNameValue = secretName.element.value;
  const initialSecretVarValue = secretVar.element.value;

  await wrapper.setProps(wrapper.props());

  await flushPromises();
  expect(variableName.element.value).toBe(initialVariableNameValue);
  expect(secretName.element.value).toBe(initialSecretNameValue);
  expect(secretVar.element.value).toBe(initialSecretVarValue);
});

test('add and remove variable value', async () => {
  const handlers = [
    http.get('/api/v1alpha/projects/org%2Forg01%2Fproj01/variables', () => {
      return HttpResponse.json([
        {
          id: '4ac38e9d-2b7e-47b5-a19e-e57e0bb216eb',
          name: 'variable01',
          values: [
            {
              secret_name: 'secret01',
              secret_var: 'secretvariable01',
              matching_secret_parent_path: 'org/org01',
              when: {},
            },
          ],
          parent_path: 'org/org01',
        },
      ]);
    }),
  ];

  server.use(...handlers);
  const wrapper = mountCreateupdatevariable({
    ownertype: 'org',
    ownername: 'org01',
    refType: 'project',
    refParam: ['proj01'],
    operationType: 'update',
    variableNameParam: 'variable01',
  });

  await flushPromises();
  const addVariableValueButton = wrapper.find(
    '[data-test="addVariableValueButton"]'
  );

  await addVariableValueButton.trigger('click');
  await addVariableValueButton.trigger('click');

  await flushPromises();

  let secretNameInputs = wrapper.findAll<HTMLInputElement>(
    '[data-test^="secretName-"]'
  );

  expect(secretNameInputs.length).toBe(3);
  expect(secretNameInputs[0].element.value).toBe('secret01');

  await secretNameInputs[1].setValue('secret02');
  await secretNameInputs[2].setValue('secret03');
  await flushPromises();

  const removeVariableValueButton = wrapper.findAll(
    '[data-test^="removeVariableValueButton-"]'
  )[1];
  await removeVariableValueButton.trigger('click');

  await flushPromises();
  secretNameInputs = wrapper.findAll<HTMLInputElement>(
    '[data-test^="secretName-"]'
  );

  expect(secretNameInputs.length).toBe(2);
  expect(secretNameInputs[0].element.value).toBe('secret01');
  expect(secretNameInputs[1].element.value).toBe('secret03');
});

test('add and remove variable value when conditions', async () => {
  const handlers = [
    http.get('/api/v1alpha/projects/org%2Forg01%2Fproj01/variables', () => {
      return HttpResponse.json([
        {
          id: '4ac38e9d-2b7e-47b5-a19e-e57e0bb216eb',
          name: 'variable01',
          values: [
            {
              secret_name: 'secret01',
              secret_var: 'secretvariable01',
              matching_secret_parent_path: 'org/org01',
              when: {
                branch: {
                  include: [{ type: 'simple', match: 'master' }],
                },
              },
            },
            {
              secret_name: 'secret02',
              secret_var: 'secretvariable02',
              matching_secret_parent_path: 'org/org01',
              when: {},
            },
          ],
          parent_path: 'org/org01',
        },
      ]);
    }),
  ];

  server.use(...handlers);
  const wrapper = mountCreateupdatevariable({
    ownertype: 'org',
    ownername: 'org01',
    refType: 'project',
    refParam: ['proj01'],
    operationType: 'update',
    variableNameParam: 'variable01',
  });

  await flushPromises();
  const addWhenConditionButton = wrapper.find(
    '[data-test="addWhenConditionButton-0_branch_include"]'
  );

  await addWhenConditionButton.trigger('click');
  await addWhenConditionButton.trigger('click');

  await flushPromises();

  let VariableValue1WhenConditions = wrapper.findAll<HTMLInputElement>(
    '[data-test^="whenCondition-0_branch_include"]'
  );

  expect(VariableValue1WhenConditions.length).toBe(3);
  expect(
    VariableValue1WhenConditions[0].find<HTMLSelectElement>(
      '[data-test^="whenConditionType-"]'
    ).element.selectedOptions[0].value
  ).toBe('simple');

  await VariableValue1WhenConditions[1]
    .find('[data-test^="whenConditionType-"]')
    .setValue('simple');
  await VariableValue1WhenConditions[2]
    .find('[data-test^="whenConditionType-"]')
    .setValue('regexp');
  await flushPromises();

  const removeWhenConditionButton = wrapper.find(
    '[data-test="removeWhenConditionButton-0_branch_include_1"]'
  );
  await removeWhenConditionButton.trigger('click');

  await flushPromises();

  VariableValue1WhenConditions = wrapper.findAll<HTMLInputElement>(
    '[data-test^="whenCondition-0_branch_include"]'
  );

  expect(VariableValue1WhenConditions.length).toBe(2);
  expect(
    VariableValue1WhenConditions[0].find<HTMLSelectElement>(
      '[data-test^="whenConditionType-"]'
    ).element.selectedOptions[0].value
  ).toBe('simple');
  expect(
    VariableValue1WhenConditions[1].find<HTMLSelectElement>(
      '[data-test^="whenConditionType-"]'
    ).element.selectedOptions[0].value
  ).toBe('regexp');
});

test('error response from the server is correctly displayed', async () => {
  const handlers = [
    http.get('/api/v1alpha/projects/org%2Forg01%2Fproj01/variables', () => {
      return HttpResponse.json([
        {
          id: '4ac38e9d-2b7e-47b5-a19e-e57e0bb216eb',
          name: 'variable01',
          values: [
            {
              secret_name: 'secret01',
              secret_var: 'secretvariable01',
              matching_secret_parent_path: 'org/org01',
              when: {},
            },
          ],
          parent_path: 'org/org01',
        },
      ]);
    }),
    http.post('/api/v1alpha/projects/org%2Forg01%2Fproj01/variables', () => {
      return new HttpResponse(JSON.stringify({ message: 'Server Error' }), {
        status: 500,
      });
    }),
  ];

  server.use(...handlers);

  const wrapper = mountCreateupdatevariable({
    ownertype: 'org',
    ownername: 'org01',
    refType: 'project',
    refParam: ['proj01'],
    operationType: 'create',
  });

  await flushPromises();

  const variableName = wrapper.find<HTMLInputElement>(
    '[data-test="variableName"]'
  );
  const secretName = wrapper.find<HTMLInputElement>(
    '[data-test="secretName-0"]'
  );
  const secretVar = wrapper.find<HTMLInputElement>('[data-test="secretVar-0"]');

  await variableName.setValue('variable01');
  await secretName.setValue('secret01');
  await secretVar.setValue('secretvariable01');

  wrapper.find('form').trigger('submit.prevent');

  await flushPromises();

  expect(wrapper.router.push).not.toHaveBeenCalled();

  const serverError = wrapper.find('[data-test="serverError"]');
  expect(serverError.text()).toContain('An error occurred');
});
