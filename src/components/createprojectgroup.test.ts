import { flushPromises, mount } from '@vue/test-utils';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { APIInjectionKey, newAPI } from '../app/api';
import { AppStateInjectionKey, newAppState } from '../app/appstate';
import { invalidNames, validNames } from '../util/validator.test';
import createProjectGroup from './createprojectgroup.vue';

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
const mountCreateProjectGroup = (props: any) => {
  return mount(createProjectGroup, {
    global: {
      provide: {
        [APIInjectionKey as symbol]: api,
        [AppStateInjectionKey as symbol]: appState,
      },
    },
    props,
  });
};

test('create a project group in root project group', async () => {
  const handlers = [
    http.post('/api/v1alpha/projectgroups', () => {
      return HttpResponse.json({
        name: 'pg01',
        parent_ref: 'org/org01',
        visibility: 'private',
      });
    }),

    http.get('/api/v1alpha/projectgroups/org%2Forg01/subgroups', () => {
      return HttpResponse.json([]);
    }),
  ];

  server.use(...handlers);

  const wrapper = mountCreateProjectGroup({
    ownertype: 'org',
    ownername: 'org01',
    projectgroupref: [],
  });

  await flushPromises();

  const projectGroupName = wrapper.find<HTMLInputElement>(
    '[data-test="projectGroupName"]'
  );
  const projectGroupIsPrivate = wrapper.find<HTMLInputElement>(
    '[data-test="projectGroupIsPrivate"]'
  );

  await projectGroupName.setValue('pg01');
  await projectGroupIsPrivate.setValue(true);

  await flushPromises();

  const createProjectGroupButton = wrapper.find(
    '[data-test="createProjectGroupButton"]'
  );
  expect(createProjectGroupButton.attributes('disabled')).toBeUndefined();

  createProjectGroupButton.trigger('click');

  await flushPromises();
  expect(wrapper.router.push).toHaveBeenCalledTimes(1);
  expect(wrapper.router.push).toHaveBeenCalledWith({
    path: '/org/org01/projectgroups/pg01.proj',
  });
});

test('create a project group in project group', async () => {
  const handlers = [
    http.post('/api/v1alpha/projectgroups', () => {
      return HttpResponse.json({
        name: 'pg01',
        parent_ref: 'org/org01/pg01',
        visibility: 'private',
      });
    }),

    http.get('/api/v1alpha/projectgroups/org%2Forg01%2Fpg01/subgroups', () => {
      return HttpResponse.json([]);
    }),
  ];

  server.use(...handlers);

  const wrapper = mountCreateProjectGroup({
    ownertype: 'org',
    ownername: 'org01',
    projectgroupref: ['pg01'],
  });

  await flushPromises();

  const projectGroupName = wrapper.find<HTMLInputElement>(
    '[data-test="projectGroupName"]'
  );
  const projectGroupIsPrivate = wrapper.find<HTMLInputElement>(
    '[data-test="projectGroupIsPrivate"]'
  );
  await projectGroupName.setValue('pg01-01');
  await projectGroupIsPrivate.setValue(true);

  await flushPromises();

  const createProjectGroupButton = wrapper.find(
    '[data-test="createProjectGroupButton"]'
  );
  expect(createProjectGroupButton.attributes('disabled')).toBeUndefined();

  createProjectGroupButton.trigger('click');

  await flushPromises();
  expect(wrapper.router.push).toHaveBeenCalledTimes(1);
  expect(wrapper.router.push).toHaveBeenCalledWith({
    path: '/org/org01/projectgroups/pg01/pg01-01.proj',
  });
});

test.each(validNames)(
  'create a project group with valid name "%s"',
  async (name) => {
    const handlers = [
      http.post('/api/v1alpha/projectgroups', () => {
        return HttpResponse.json({
          name: 'pg01',
          parent_ref: 'org/org01/pg01',
          visibility: 'private',
        });
      }),

      http.get(
        '/api/v1alpha/projectgroups/org%2Forg01%2Fpg01/subgroups',
        () => {
          return HttpResponse.json([]);
        }
      ),
    ];

    server.use(...handlers);

    const wrapper = mountCreateProjectGroup({
      ownertype: 'org',
      ownername: 'org01',
      projectgroupref: ['pg01'],
    });

    await flushPromises();

    const projectGroupName = wrapper.find<HTMLInputElement>(
      '[data-test="projectGroupName"]'
    );

    await projectGroupName.setValue(name);

    await flushPromises();

    const createProjectGroupButton = wrapper.find(
      '[data-test="createProjectGroupButton"]'
    );

    expect(createProjectGroupButton.attributes('disabled')).toBeUndefined();

    createProjectGroupButton.trigger('click');

    await flushPromises();
    expect(wrapper.router.push).toHaveBeenCalledTimes(1);
    expect(wrapper.router.push).toHaveBeenCalledWith({
      path: `/org/org01/projectgroups/pg01/${name}.proj`,
    });
  }
);

test.each(invalidNames)(
  'create a project group with invalid name "%s"',
  async (name) => {
    const handlers = [
      http.post('/api/v1alpha/projectgroups', () => {
        return HttpResponse.json({
          name: 'pg01',
          parent_ref: 'org/org01/pg01',
          visibility: 'private',
        });
      }),

      http.get(
        '/api/v1alpha/projectgroups/org%2Forg01%2Fpg01/subgroups',
        () => {
          return HttpResponse.json([]);
        }
      ),
    ];

    server.use(...handlers);

    const wrapper = mountCreateProjectGroup({
      ownertype: 'org',
      ownername: 'org01',
      projectgroupref: ['pg01'],
    });

    await flushPromises();

    const projectGroupName = wrapper.find<HTMLInputElement>(
      '[data-test="projectGroupName"]'
    );

    await projectGroupName.setValue(name);

    await flushPromises();

    const createProjectGroupButton = wrapper.find(
      '[data-test="createProjectGroupButton"]'
    );

    expect(createProjectGroupButton.attributes('disabled')).toBeDefined();
  }
);
