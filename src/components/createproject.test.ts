import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { APIInjectionKey, newAPI } from '../app/api';
import { AppStateInjectionKey, newAppState } from '../app/appstate';
import createproject from './createproject.vue';
export const handlers = [
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

const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

//  Close server after all tests
afterAll(() => server.close());

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers());

let wrapper: VueWrapper;

beforeEach(async () => {
  const api = newAPI();
  const appState = newAppState();
  wrapper = mount(createproject, {
    global: {
      provide: {
        [APIInjectionKey as symbol]: api,
        [AppStateInjectionKey as symbol]: appState,
      },
    },
    props: {
      ownertype: 'org',
      ownername: 'org01',
      projectgroupref: ['proj01'],
    },
  });
});

test('create a project', async () => {
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
  expect(createProjectButton.attributes('disabled')).toBeFalsy();

  createProjectButton.trigger('click');

  await flushPromises();
  expect(wrapper.router.push).toHaveBeenCalledTimes(1);
  expect(wrapper.router.push).toHaveBeenCalledWith({
    path: '/org/org01/projects/proj01/proj01.proj',
  });
});
