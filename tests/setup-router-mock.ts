import { config } from '@vue/test-utils';
import { beforeEach } from 'vitest';
import {
  createRouterMock,
  injectRouterMock,
  VueRouterMock,
} from 'vue-router-mock';

// create one router per test file
const router = createRouterMock();
beforeEach(() => {
  router.reset(); // reset the router state
  injectRouterMock(router);
});

config.plugins.VueWrapper.install(VueRouterMock);
