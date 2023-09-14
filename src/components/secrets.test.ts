import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { APIInjectionKey, newAPI } from '../app/api';
import { AppStateInjectionKey, newAppState } from '../app/appstate';
import secrets from './secrets.vue';

export const handlers = [
  http.delete('/api/v1alpha/projects/org%2Forg01%2Fproj01/secrets/vvvv', () => {
    return new HttpResponse(JSON.stringify({ success: true }), {
      status: 204,
    });
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
  wrapper = mount(secrets, {
    global: {
      provide: {
        [APIInjectionKey as symbol]: api,
        [AppStateInjectionKey as symbol]: appState,
      },
      stubs: {
        teleport: true,
      },
    },
    props: {
      ownertype: 'org',
      ownername: 'org01',
      projectref: ['proj01'],
      secrets: [
        {
          id: '9589d518-b85f-446a-9424-3d38dc1ac8ac',
          name: 'vvvv',
          parentPath: 'org/org01',
        },
        {
          id: '4548b892-b029-48dd-adee-61017dc4da65',
          name: 'gg',
          parentPath: 'org/org01',
        },
      ],
      refType: 'project',
    },
  });
});

test('should open the confirmation dialog and delete the secret', async () => {
  await flushPromises();
  const deleteSecretButton = wrapper.find('[data-test="deleteSecretButton-0"]');
  (deleteSecretButton.element as HTMLElement).click();
  await flushPromises();

  const confirmButton = wrapper.find('[id="modal-confirm"]');

  confirmButton.trigger('click');

  await flushPromises();
  const deleteSecretEvent = wrapper.emitted('secret-removed');
  expect(deleteSecretEvent).toBeTruthy();
});
