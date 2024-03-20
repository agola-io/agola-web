import { flushPromises, mount } from '@vue/test-utils';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { APIInjectionKey, newAPI } from '../app/api';
import { AppStateInjectionKey, newAppState } from '../app/appstate';
import { invalidNames, validNames } from '../util/validator.test';
import projectSettings from './projectsettings.vue';

const orgHandlers = [
  http.get('/api/v1alpha/projects/org%2Forg01%2Fproj01', () => {
    return HttpResponse.json({
      id: '1',
      name: 'proj01',
      visibility: 'public',
      members_can_perform_run_actions: false,
    });
  }),

  http.put('/api/v1alpha/projects/org%2Forg01%2Fproj01', () => {
    return HttpResponse.json({
      id: '1',
      name: 'newproj01',
      visibility: 'public',
      members_can_perform_run_actions: true,
    });
  }),

  http.get('/api/v1alpha/projectgroups/org%2Forg01/projects', () => {
    return HttpResponse.json([]);
  }),

  http.get('/api/v1alpha/projects/org%2Forg01%2Fproj01/secrets', () => {
    return HttpResponse.json([]);
  }),

  http.get('/api/v1alpha/projects/org%2Forg01%2Fproj01/variables', () => {
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
const mountProjectSettings = (props: any) => {
  return mount(projectSettings, {
    global: {
      provide: {
        [APIInjectionKey as symbol]: api,
        [AppStateInjectionKey as symbol]: appState,
      },
    },
    props,
  });
};

test('get project', async () => {
  server.use(...orgHandlers);

  const wrapper = mountProjectSettings({
    ownertype: 'org',
    ownername: 'org01',
    projectref: ['proj01'],
  });

  await flushPromises();

  const projectName = wrapper.find<HTMLInputElement>(
    '[data-test="projectNameInput"]'
  );
  const projectIsPrivate = wrapper.find<HTMLInputElement>(
    '[data-test="projectIsPrivateInput"]'
  );
  expect(projectName.element.value).toBe('proj01');
  expect(projectIsPrivate.element.checked).toBe(false);
});

test.each(validNames)('update project with valid name "%s"', async (name) => {
  server.use(...orgHandlers);

  const wrapper = mountProjectSettings({
    ownertype: 'org',
    ownername: 'org01',
    projectref: ['proj01'],
  });

  await flushPromises();

  const projectName = wrapper.find<HTMLInputElement>(
    '[data-test="projectNameInput"]'
  );
  const membersCanPerformRunActions = wrapper.find<HTMLInputElement>(
    '[data-test="membersCanPerformRunActions"]'
  );
  const updateProjectButton = wrapper.find<HTMLInputElement>(
    '[data-test="updateProjectButton"]'
  );

  await projectName.setValue(name);
  await membersCanPerformRunActions.setValue(true);

  expect(updateProjectButton.attributes('disabled')).toBeUndefined();

  updateProjectButton.element.click();

  await flushPromises();

  expect(wrapper.router.push).toHaveBeenCalledTimes(1);
  expect(wrapper.router.push).toHaveBeenCalledWith({
    path: `/org/org01/projects/${name}.proj/settings`,
  });
});

test.each(invalidNames)(
  'update project with invalid name "%s"',
  async (name) => {
    server.use(...orgHandlers);

    const wrapper = mountProjectSettings({
      ownertype: 'org',
      ownername: 'org01',
      projectref: ['proj01'],
    });

    await flushPromises();

    const projectName = wrapper.find<HTMLInputElement>(
      '[data-test="projectNameInput"]'
    );
    const membersCanPerformRunActions = wrapper.find<HTMLInputElement>(
      '[data-test="membersCanPerformRunActions"]'
    );
    const updateProjectButton = wrapper.find<HTMLInputElement>(
      '[data-test="updateProjectButton"]'
    );

    await projectName.setValue(name);
    await membersCanPerformRunActions.setValue(true);

    expect(updateProjectButton.attributes('disabled')).toBeDefined();
  }
);

test('update org project membersCanPerformRunActions', async () => {
  server.use(...orgHandlers);

  const wrapper = mountProjectSettings({
    ownertype: 'org',
    ownername: 'org01',
    projectref: ['proj01'],
  });

  await flushPromises();

  const membersCanPerformRunActions = wrapper.find<HTMLInputElement>(
    '[data-test="membersCanPerformRunActions"]'
  );
  const updateProjectButton = wrapper.find<HTMLInputElement>(
    '[data-test="updateProjectButton"]'
  );
  const initialValue = membersCanPerformRunActions.element.checked;

  await membersCanPerformRunActions.setValue(!initialValue);

  updateProjectButton.element.click();

  await flushPromises();

  expect(wrapper.router.push).toHaveBeenCalledTimes(1);
  expect(wrapper.router.push).toHaveBeenCalledWith({
    path: '/org/org01/projects/proj01.proj/settings',
  });

  expect(membersCanPerformRunActions.element.checked).toBe(!initialValue);
});

test('check membersCanPerformRunActions is not shown on user projects', async () => {
  const handlers = [
    http.get('/api/v1alpha/projects/user%20%2Fuser01%2Fproj01', () => {
      return HttpResponse.json({
        id: '1',
        name: 'proj01',
        visibility: 'public',
        members_can_perform_run_actions: false,
      });
    }),

    http.put('/api/v1alpha/projects/user%20%2Fuser01%2Fproj01', () => {
      return HttpResponse.json({
        id: '1',
        name: 'newproj01',
        visibility: 'public',
        members_can_perform_run_actions: true,
      });
    }),

    http.get('/api/v1alpha/projectgroups/user%20%2Fuser01/projects', () => {
      return HttpResponse.json([]);
    }),

    http.get('/api/v1alpha/projects/user%20%2Fuser01%2Fproj01/secrets', () => {
      return HttpResponse.json([]);
    }),

    http.get(
      '/api/v1alpha/projects/user%20%2Fuser01%2Fproj01/variables',
      () => {
        return HttpResponse.json([]);
      }
    ),
  ];

  server.use(...handlers);

  const wrapper = mountProjectSettings({
    ownertype: 'user ',
    ownername: 'user01',
    projectref: ['proj01'],
  });

  await flushPromises();

  const membersCanPerformRunActions = wrapper.find<HTMLInputElement>(
    '[data-test="membersCanPerformRunActions"]'
  );

  expect(membersCanPerformRunActions.exists()).toBe(false);
});
