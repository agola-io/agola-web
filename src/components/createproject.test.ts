import { flushPromises, mount } from '@vue/test-utils';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { APIInjectionKey, newAPI } from '../app/api';
import { AppStateInjectionKey, newAppState } from '../app/appstate';
import { invalidNames, validNames } from '../util/validator.test';
import createProject from './createproject.vue';

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
const mountCreateProject = (props: any) => {
  return mount(createProject, {
    global: {
      provide: {
        [APIInjectionKey as symbol]: api,
        [AppStateInjectionKey as symbol]: appState,
      },
    },
    props,
  });
};

test('create a project in root project group', async () => {
  const handlers = [
    http.post('/api/v1alpha/projects', () => {
      return HttpResponse.json({
        name: 'proj01',
        parent_ref: 'org/org01',
        pass_vars_to_forked_pr: true,
        remote_source_name: 'gitea',
        repo_path: 'org01/repo01',
        visibility: 'private',
        members_can_perform_run_actions: true,
      });
    }),

    http.get('/api/v1alpha/projectgroups/org%2Forg01/projects', () => {
      return HttpResponse.json([]);
    }),

    http.get('/api/v1alpha/remotesources', () => {
      return HttpResponse.json([
        {
          id: '8ee07254-baa9-4df8-87e3-faed60e05848',
          name: 'gitea',
          auth_type: 'oauth2',
          registration_enabled: true,
          login_enabled: true,
        },
      ]);
    }),
    http.get(
      '/api/v1alpha/user/remoterepos/8ee07254-baa9-4df8-87e3-faed60e05848',
      () => {
        return HttpResponse.json([{ id: '1', path: 'org01/repo01' }]);
      }
    ),
  ];

  server.use(...handlers);

  const wrapper = mountCreateProject({
    ownertype: 'org',
    ownername: 'org01',
    projectgroupref: [],
  });

  await flushPromises();

  const projectName = wrapper.find<HTMLInputElement>(
    '[data-test="projectName"]'
  );
  const projectIsPrivate = wrapper.find<HTMLInputElement>(
    '[data-test="projectIsPrivate"]'
  );
  const membersCanPerformRunActions = wrapper.find<HTMLInputElement>(
    '[data-test="membersCanPerformRunActions"]'
  );
  const passVarsToForkedPR = wrapper.find<HTMLInputElement>(
    '[data-test="passVarsToForkedPR"]'
  );
  const selectedRemoteSourceIndex = wrapper.find<HTMLInputElement>(
    '[data-test="selectedRemoteSourceIndex"]'
  );
  const selectedRemoteSourceIndexButton = wrapper.find<HTMLInputElement>(
    '[data-test="selectedRemoteSourceIndexButton"]'
  );
  await projectName.setValue('proj01');
  await projectIsPrivate.setValue(true);
  await membersCanPerformRunActions.setValue(true);
  await selectedRemoteSourceIndex.setValue('0');
  await passVarsToForkedPR.setValue(true);
  await selectedRemoteSourceIndexButton.trigger('click');

  await flushPromises();
  const selectedRepo = wrapper.find<HTMLInputElement>(
    '[data-test="selectedRepo-0"]'
  );
  await selectedRepo.setValue(true);
  await selectedRepo.trigger('click');
  const createProjectButton = wrapper.find('[data-test="createProjectButton"]');
  expect(createProjectButton.attributes('disabled')).toBeUndefined();

  createProjectButton.trigger('click');

  await flushPromises();
  expect(wrapper.router.push).toHaveBeenCalledTimes(1);
  expect(wrapper.router.push).toHaveBeenCalledWith({
    path: '/org/org01/projects/proj01.proj',
  });
});

test('create a project in project group', async () => {
  const handlers = [
    http.post('/api/v1alpha/projects', () => {
      return HttpResponse.json({
        name: 'proj01',
        parent_ref: 'org/org01',
        pass_vars_to_forked_pr: true,
        remote_source_name: 'gitea',
        repo_path: 'org01/repo01',
        visibility: 'private',
        members_can_perform_run_actions: true,
      });
    }),

    http.get('/api/v1alpha/projectgroups/org%2Forg01%2Fpg01/projects', () => {
      return HttpResponse.json([]);
    }),

    http.get('/api/v1alpha/remotesources', () => {
      return HttpResponse.json([
        {
          id: '8ee07254-baa9-4df8-87e3-faed60e05848',
          name: 'gitea',
          auth_type: 'oauth2',
          registration_enabled: true,
          login_enabled: true,
        },
      ]);
    }),
    http.get(
      '/api/v1alpha/user/remoterepos/8ee07254-baa9-4df8-87e3-faed60e05848',
      () => {
        return HttpResponse.json([{ id: '1', path: 'org01/repo01' }]);
      }
    ),
  ];

  server.use(...handlers);

  const wrapper = mountCreateProject({
    ownertype: 'org',
    ownername: 'org01',
    projectgroupref: ['pg01'],
  });

  await flushPromises();

  const projectName = wrapper.find<HTMLInputElement>(
    '[data-test="projectName"]'
  );
  const projectIsPrivate = wrapper.find<HTMLInputElement>(
    '[data-test="projectIsPrivate"]'
  );
  const membersCanPerformRunActions = wrapper.find<HTMLInputElement>(
    '[data-test="membersCanPerformRunActions"]'
  );
  const passVarsToForkedPR = wrapper.find<HTMLInputElement>(
    '[data-test="passVarsToForkedPR"]'
  );
  const selectedRemoteSourceIndex = wrapper.find<HTMLInputElement>(
    '[data-test="selectedRemoteSourceIndex"]'
  );
  const selectedRemoteSourceIndexButton = wrapper.find<HTMLInputElement>(
    '[data-test="selectedRemoteSourceIndexButton"]'
  );
  await projectName.setValue('proj01');
  await projectIsPrivate.setValue(true);
  await membersCanPerformRunActions.setValue(true);
  await selectedRemoteSourceIndex.setValue('0');
  await passVarsToForkedPR.setValue(true);
  await selectedRemoteSourceIndexButton.trigger('click');

  await flushPromises();
  const selectedRepo = wrapper.find<HTMLInputElement>(
    '[data-test="selectedRepo-0"]'
  );
  await selectedRepo.setValue(true);
  await selectedRepo.trigger('click');
  const createProjectButton = wrapper.find('[data-test="createProjectButton"]');
  expect(createProjectButton.attributes('disabled')).toBeUndefined();

  createProjectButton.trigger('click');

  await flushPromises();
  expect(wrapper.router.push).toHaveBeenCalledTimes(1);
  expect(wrapper.router.push).toHaveBeenCalledWith({
    path: '/org/org01/projects/pg01/proj01.proj',
  });
});

test.each(validNames)('create a project with valid name "%s"', async (name) => {
  const handlers = [
    http.post('/api/v1alpha/projects', () => {
      return HttpResponse.json({
        name: 'proj01',
        parent_ref: 'org/org01',
        pass_vars_to_forked_pr: true,
        remote_source_name: 'gitea',
        repo_path: 'org01/repo01',
        visibility: 'private',
        members_can_perform_run_actions: true,
      });
    }),

    http.get('/api/v1alpha/projectgroups/org%2Forg01%2Fpg01/projects', () => {
      return HttpResponse.json([]);
    }),

    http.get('/api/v1alpha/remotesources', () => {
      return HttpResponse.json([
        {
          id: '8ee07254-baa9-4df8-87e3-faed60e05848',
          name: 'gitea',
          auth_type: 'oauth2',
          registration_enabled: true,
          login_enabled: true,
        },
      ]);
    }),
    http.get(
      '/api/v1alpha/user/remoterepos/8ee07254-baa9-4df8-87e3-faed60e05848',
      () => {
        return HttpResponse.json([{ id: '1', path: 'org01/repo01' }]);
      }
    ),
  ];

  server.use(...handlers);

  const wrapper = mountCreateProject({
    ownertype: 'org',
    ownername: 'org01',
    projectgroupref: ['pg01'],
  });

  await flushPromises();

  const projectName = wrapper.find<HTMLInputElement>(
    '[data-test="projectName"]'
  );
  const selectedRemoteSourceIndex = wrapper.find<HTMLInputElement>(
    '[data-test="selectedRemoteSourceIndex"]'
  );
  const selectedRemoteSourceIndexButton = wrapper.find<HTMLInputElement>(
    '[data-test="selectedRemoteSourceIndexButton"]'
  );

  await projectName.setValue(name);

  await selectedRemoteSourceIndex.setValue('0');
  await selectedRemoteSourceIndexButton.trigger('click');

  await flushPromises();

  const selectedRepo = wrapper.find<HTMLInputElement>(
    '[data-test="selectedRepo-0"]'
  );
  await selectedRepo.setValue(true);
  await selectedRepo.trigger('click');
  const createProjectButton = wrapper.find('[data-test="createProjectButton"]');

  expect(createProjectButton.attributes('disabled')).toBeUndefined();

  createProjectButton.trigger('click');

  await flushPromises();
  expect(wrapper.router.push).toHaveBeenCalledTimes(1);
  expect(wrapper.router.push).toHaveBeenCalledWith({
    path: `/org/org01/projects/pg01/${name}.proj`,
  });
});

test.each(invalidNames)(
  'create a project with invalid name "%s"',
  async (name) => {
    const handlers = [
      http.post('/api/v1alpha/projects', () => {
        return HttpResponse.json({
          name: 'proj01',
          parent_ref: 'org/org01',
          pass_vars_to_forked_pr: true,
          remote_source_name: 'gitea',
          repo_path: 'org01/repo01',
          visibility: 'private',
          members_can_perform_run_actions: true,
        });
      }),

      http.get('/api/v1alpha/projectgroups/org%2Forg01%2Fpg01/projects', () => {
        return HttpResponse.json([]);
      }),

      http.get('/api/v1alpha/remotesources', () => {
        return HttpResponse.json([
          {
            id: '8ee07254-baa9-4df8-87e3-faed60e05848',
            name: 'gitea',
            auth_type: 'oauth2',
            registration_enabled: true,
            login_enabled: true,
          },
        ]);
      }),
      http.get(
        '/api/v1alpha/user/remoterepos/8ee07254-baa9-4df8-87e3-faed60e05848',
        () => {
          return HttpResponse.json([{ id: '1', path: 'org01/repo01' }]);
        }
      ),
    ];

    server.use(...handlers);

    const wrapper = mountCreateProject({
      ownertype: 'org',
      ownername: 'org01',
      projectgroupref: ['pg01'],
    });

    await flushPromises();

    const projectName = wrapper.find<HTMLInputElement>(
      '[data-test="projectName"]'
    );
    const selectedRemoteSourceIndex = wrapper.find<HTMLInputElement>(
      '[data-test="selectedRemoteSourceIndex"]'
    );
    const selectedRemoteSourceIndexButton = wrapper.find<HTMLInputElement>(
      '[data-test="selectedRemoteSourceIndexButton"]'
    );

    await projectName.setValue(name);

    await selectedRemoteSourceIndex.setValue('0');
    await selectedRemoteSourceIndexButton.trigger('click');

    await flushPromises();

    const selectedRepo = wrapper.find<HTMLInputElement>(
      '[data-test="selectedRepo-0"]'
    );
    await selectedRepo.setValue(true);
    await selectedRepo.trigger('click');
    const createProjectButton = wrapper.find(
      '[data-test="createProjectButton"]'
    );

    expect(createProjectButton.attributes('disabled')).toBeDefined();
  }
);
