import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { APIInjectionKey, newAPI } from '../app/api';
import { AppStateInjectionKey, newAppState } from '../app/appstate';
import projects from './projects.vue';

export const handlers = [
  http.get('/api/v1alpha/projectgroups/org%2Forg01%2Fproj01/projects', () => {
    return HttpResponse.json([
      {
        id: '17b6f071-8b3b-4fb7-b702-1029d25d6e20',
        name: 'proj01',
        path: 'org/org01/proj01',
        parent_path: 'org/org01',
        visibility: 'private',
        global_visibility: 'private',
        default_branch: 'master',
      },
    ]);
  }),

  http.get('/api/v1alpha/projectgroups/org%2Forg01%2Fproj01/subgroups', () => {
    return HttpResponse.json([
      {
        id: '63c0f894-a9b5-4b55-ac01-c0966f12ba89',
        name: 'proj01',
        path: 'org/org01/proj01',
        parent_path: 'org/org01',
        visibility: 'private',
        global_visibility: 'private',
      },
    ]);
  }),
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
  wrapper = mount(projects, {
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
test('toggleFavorite project method updates isfavourite and saves to localStorage', async () => {
  await flushPromises();
  localStorage.setItem('favorites', JSON.stringify({}));
  await wrapper.vm.$nextTick();
  const projectItem = wrapper.find<HTMLInputElement>(
    '[data-test="projectItem-0"]'
  );
  const projectStartIcon = wrapper.find<HTMLInputElement>(
    '[data-test="projectStarIcon-0"]'
  );
  const projectItemId = wrapper.find<HTMLInputElement>(
    '[id="projectItemId-0"]'
  );
  await wrapper.vm.$nextTick();
  expect(projectStartIcon.classes()).toContain('mdi-star-outline');
  projectItem.trigger('click');
  await flushPromises();
  expect(projectStartIcon.classes()).toContain('mdi-star');
  console.log('projectItemId', projectItemId);
  const storedFavorites = JSON.parse(localStorage.getItem('favorites') || '{}');
  const projectId = projectItemId.element.getAttribute('data-test');
  expect(storedFavorites[projectId as string]).toBe(true);
});

test('toggleFavorite projectGroups method updates isfavourite and saves to localStorage', async () => {
  await flushPromises();
  localStorage.setItem('favorites', JSON.stringify({}));
  await wrapper.vm.$nextTick();
  console.log('wrPPER', wrapper.html());
  const projectItem = wrapper.find<HTMLInputElement>(
    '[data-test="projectGroupItem-0"]'
  );
  const projectStartIcon = wrapper.find<HTMLInputElement>(
    '[data-test="projectGroupStarIcon-0"]'
  );
  const projectItemId = wrapper.find<HTMLInputElement>(
    '[id="projectGroupItemId-0"]'
  );
  await wrapper.vm.$nextTick();
  expect(projectStartIcon.classes()).toContain('mdi-star-outline');
  projectItem.trigger('click');
  await flushPromises();
  expect(projectStartIcon.classes()).toContain('mdi-star');
  console.log('projectGroupItemId', projectItemId);
  const storedFavorites = JSON.parse(localStorage.getItem('favorites') || '{}');
  const projectId = projectItemId.element.getAttribute('data-test');
  expect(storedFavorites[projectId as string]).toBe(true);
});
