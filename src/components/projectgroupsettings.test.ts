import { flushPromises, mount } from '@vue/test-utils';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { APIInjectionKey, newAPI } from '../app/api';
import { AppStateInjectionKey, newAppState } from '../app/appstate';
import { invalidNames, validNames } from '../util/validator.test';
import projectGroupSettings from './projectgroupsettings.vue';

export const orgHandlers = [
  http.get('/api/v1alpha/projectgroups/org%2Forg01%2Fpg01', () => {
    return HttpResponse.json({
      id: '1',
      name: 'pg01',
      visibility: 'public',
      members_can_perform_run_actions: false,
    });
  }),

  http.put('/api/v1alpha/projectgroups/org%2Forg01%2Fpg01', () => {
    return HttpResponse.json({
      id: '1',
      name: 'newpg01',
      visibility: 'public',
      members_can_perform_run_actions: true,
    });
  }),

  http.get('/api/v1alpha/projectgroups/org%2Forg01/subgroups', () => {
    return HttpResponse.json([]);
  }),

  http.get('/api/v1alpha/projectgroups/org%2Forg01%2Fpg01/secrets', () => {
    return HttpResponse.json([]);
  }),

  http.get('/api/v1alpha/projectgroups/org%2Forg01%2Fpg01/variables', () => {
    return HttpResponse.json([]);
  }),
];

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
const mountProjectGroupSettings = (props: any) => {
  return mount(projectGroupSettings, {
    global: {
      provide: {
        [APIInjectionKey as symbol]: api,
        [AppStateInjectionKey as symbol]: appState,
      },
    },
    props,
  });
};

test('get project group', async () => {
  server.use(...orgHandlers);

  const wrapper = mountProjectGroupSettings({
    ownertype: 'org',
    ownername: 'org01',
    projectgroupref: ['pg01'],
  });

  await flushPromises();

  const projectGroupName = wrapper.find<HTMLInputElement>(
    '[data-test="projectGroupNameInput"]'
  );
  const projectGroupIsPrivate = wrapper.find<HTMLInputElement>(
    '[data-test="projectGroupIsPrivateInput"]'
  );
  expect(projectGroupName.element.value).toBe('pg01');
  expect(projectGroupIsPrivate.element.checked).toBe(false);
});

test.each(validNames)('update project with valid name "%s"', async (name) => {
  server.use(...orgHandlers);

  const wrapper = mountProjectGroupSettings({
    ownertype: 'org',
    ownername: 'org01',
    projectgroupref: ['pg01'],
  });

  await flushPromises();

  const projectGroupName = wrapper.find<HTMLInputElement>(
    '[data-test="projectGroupNameInput"]'
  );
  const updateProjectGroupButton = wrapper.find<HTMLInputElement>(
    '[data-test="updateProjectGroupButton"]'
  );

  await projectGroupName.setValue(name);

  expect(updateProjectGroupButton.attributes('disabled')).toBeUndefined();

  updateProjectGroupButton.element.click();

  await flushPromises();

  expect(wrapper.router.push).toHaveBeenCalledTimes(1);
  expect(wrapper.router.push).toHaveBeenCalledWith({
    path: `/org/org01/projectgroups/${name}.proj/settings`,
  });
});

test.each(invalidNames)(
  'update project with invalid name "%s"',
  async (name) => {
    server.use(...orgHandlers);

    const wrapper = mountProjectGroupSettings({
      ownertype: 'org',
      ownername: 'org01',
      projectgroupref: ['pg01'],
    });

    await flushPromises();

    const projectGroupName = wrapper.find<HTMLInputElement>(
      '[data-test="projectGroupNameInput"]'
    );
    const updateProjectGroupButton = wrapper.find<HTMLInputElement>(
      '[data-test="updateProjectGroupButton"]'
    );

    await projectGroupName.setValue(name);

    expect(updateProjectGroupButton.attributes('disabled')).toBeDefined();
  }
);
