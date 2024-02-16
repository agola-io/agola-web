import { flushPromises, mount } from '@vue/test-utils';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { APIInjectionKey, newAPI } from '../app/api';
import { AppStateInjectionKey, newAppState } from '../app/appstate';
import projects from './projects.vue';

const server = setupServer();

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

//  Close server after all tests
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
const mountProjects = (props: any) => {
  return mount(projects, {
    global: {
      provide: {
        [APIInjectionKey as symbol]: api,
        [AppStateInjectionKey as symbol]: appState,
      },
    },
    props,
  });
};

test('get and order projects', async () => {
  const handlers = [
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
        {
          id: '17b6f071-8b3b-4fb7-b702-1029d25d6e22',
          name: 'newproj01',
          path: 'org/org01/proj01',
          parent_path: 'org/org01',
          visibility: 'private',
          global_visibility: 'private',
          default_branch: 'master',
        },
        {
          id: '17b6f071-8b3b-4fb7-b702-1029d25d6e26',
          name: 'zetanewproj01',
          path: 'org/org01/proj01',
          parent_path: 'org/org01',
          visibility: 'private',
          global_visibility: 'private',
          default_branch: 'master',
        },
      ]);
    }),
  ];

  await flushPromises();
  server.use(...handlers);

  const wrapper = mountProjects({
    ownertype: 'org',
    ownername: 'org01',
    projectgroupref: ['proj01'],
  });

  await flushPromises();
  const projectsSection = wrapper.find<HTMLInputElement>(
    '[data-test="projectsSection"]'
  );
  const projectNames = projectsSection
    .findAll('[data-test="projectsItem"]')
    .map((projectItem) => projectItem.text());
  const isSorted = projectNames.every(
    (name, index, array) => index === 0 || name >= array[index - 1]
  );

  expect(isSorted).toBe(true);
});

test('get and order projectsgroups', async () => {
  const handlers = [
    http.get(
      '/api/v1alpha/projectgroups/org%2Forg01%2Fproj01/subgroups',
      () => {
        return HttpResponse.json([
          {
            id: '63c0f894-a9b5-4b55-ac01-c0966f12ba89',
            name: 'proj01',
            path: 'org/org01/proj01',
            parent_path: 'org/org01',
            visibility: 'private',
            global_visibility: 'private',
          },
          {
            id: '63c0f894-a9b5-4b55-ac01-c0966f12ba86',
            name: 'newproj01',
            path: 'org/org01/proj01',
            parent_path: 'org/org01',
            visibility: 'private',
            global_visibility: 'private',
          },
          {
            id: '63c0f894-a9b5-4b55-ac01-c0966f12ba84',
            name: 'zetaproj01',
            path: 'org/org01/proj01',
            parent_path: 'org/org01',
            visibility: 'private',
            global_visibility: 'private',
          },
        ]);
      }
    ),
  ];
  await flushPromises();
  server.use(...handlers);

  const wrapper = mountProjects({
    ownertype: 'org',
    ownername: 'org01',
    projectgroupref: ['proj01'],
  });
  await flushPromises();

  const projectsSection = wrapper.find<HTMLInputElement>(
    '[data-test="projectsGroupSection"]'
  );
  const projectGroupNames = projectsSection
    .findAll('[data-test="projectsGroupItem"]')
    .map((projectGroupItem) => projectGroupItem.text());
  const isSorted = projectGroupNames.every(
    (name, index, array) => index === 0 || name >= array[index - 1]
  );

  expect(isSorted).toBe(true);
});
