import { DOMWrapper, flushPromises, mount } from '@vue/test-utils';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { APIInjectionKey, newAPI } from '../app/api';
import { AppStateInjectionKey, newAppState } from '../app/appstate';
import delay from './delay.vue';
import runs from './runs.vue';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const allRuns: any[] = [];

const RUNS_COUNT = 100;
const GET_RUNS_LIMIT = 20;

interface Cursor {
  startIndex: number;
  subGroup: string | undefined;
}

for (let i = 1; i <= RUNS_COUNT; i++) {
  const run = {
    number: i,
    name: `run ${i}`,
    annotations: {
      commit_sha: 'abcdef123',
    },

    // fields below Run's properties. They're used just to filter.
    subGroup: 'branch',
  };
  const c = i % 2;

  if (c == 1) {
    run.subGroup = 'pr';
  }

  allRuns.push(run);
}

const handlers = [
  http.get('/api/v1alpha/projects/org%2Forg01%2Fproj01/runs', ({ request }) => {
    const url = new URL(request.url);
    const cursor: Cursor = JSON.parse(url.searchParams.get('cursor') || '{}');

    let subGroup = url.searchParams.get('subgroup') || undefined;
    if (cursor.subGroup) {
      subGroup = cursor.subGroup;
    }

    let filteredRuns = [...allRuns];
    if (subGroup) {
      filteredRuns = filteredRuns.filter((r) => r.subGroup == subGroup);
    }

    let startIndex = 0;
    if (cursor.startIndex) {
      startIndex = cursor.startIndex;
    }

    const endIndex = startIndex + GET_RUNS_LIMIT;

    const outRuns = [...filteredRuns].reverse().slice(startIndex, endIndex);

    const headers: HeadersInit = {};
    if (endIndex < filteredRuns.length) {
      const cursor: Cursor = {
        startIndex: endIndex,
        subGroup: subGroup,
      };

      headers['X-Agola-Cursor'] = JSON.stringify(cursor);
    }

    return HttpResponse.json(outRuns, {
      headers,
    });
  }),
];

const server = setupServer(...handlers);

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
const mountRuns = (props: any) => {
  return mount(runs, {
    global: {
      provide: {
        [APIInjectionKey as symbol]: api,
        [AppStateInjectionKey as symbol]: appState,
      },
      components: {
        delay,
      },
    },
    props,
  });
};

type filterFn = (value: number, idx: number) => boolean;

const genArrayRange = (
  start: number,
  count: number,
  filter?: filterFn
): number[] => {
  return [...Array(count).keys()]
    .map((i) => i + start)
    .filter((v, idx) => (filter ? filter(v, idx) : true));
};

const checkExpectedRunNumberValues = (
  runNumbers: DOMWrapper<HTMLInputElement>[],
  expectedRunNumbers: number[]
) => {
  const runNumbersValues = runNumbers.map((r) => r.element.textContent);

  const expectedRunNumbersValues: string[] = [];
  expectedRunNumbers.forEach((n) => expectedRunNumbersValues.push(`#${n}`));

  expect(runNumbersValues).toEqual(expectedRunNumbersValues);
};

test('runs list', async () => {
  const wrapper = mountRuns({
    ownertype: 'org',
    ownername: 'org01',
    projectref: ['proj01'],
  });

  await flushPromises();

  let runNumbers = wrapper.findAll<HTMLInputElement>('[data-test="runNumber"]');

  expect(runNumbers.length).toBe(40);

  checkExpectedRunNumberValues(runNumbers, genArrayRange(61, 40).reverse());

  // trigger load more

  const loadMoreRunsButton = wrapper.find('[data-test="loadMoreRunsButton"]');
  loadMoreRunsButton.trigger('click');

  await flushPromises();

  runNumbers = wrapper.findAll<HTMLInputElement>('[data-test="runNumber"]');

  expect(runNumbers.length).toBe(80);

  checkExpectedRunNumberValues(runNumbers, genArrayRange(21, 80).reverse());
});

test('runs list query = branches', async () => {
  const wrapper = mountRuns({
    ownertype: 'org',
    ownername: 'org01',
    projectref: ['proj01'],
    query: 'branches',
  });

  await flushPromises();

  let runNumbers = wrapper.findAll<HTMLInputElement>('[data-test="runNumber"]');

  expect(runNumbers.length).toBe(40);

  checkExpectedRunNumberValues(
    runNumbers,
    genArrayRange(21, 80, (v: number) => v % 2 == 0).reverse()
  );

  // trigger load more

  const loadMoreRunsButton = wrapper.find('[data-test="loadMoreRunsButton"]');
  loadMoreRunsButton.trigger('click');

  await flushPromises();

  runNumbers = wrapper.findAll<HTMLInputElement>('[data-test="runNumber"]');

  expect(runNumbers.length).toBe(50);

  checkExpectedRunNumberValues(
    runNumbers,
    genArrayRange(1, 100, (v: number) => v % 2 == 0).reverse()
  );
});

test('runs list query = pullrequests', async () => {
  const wrapper = mountRuns({
    ownertype: 'org',
    ownername: 'org01',
    projectref: ['proj01'],
    query: 'pullrequests',
  });

  await flushPromises();

  let runNumbers = wrapper.findAll<HTMLInputElement>('[data-test="runNumber"]');

  expect(runNumbers.length).toBe(40);

  checkExpectedRunNumberValues(
    runNumbers,
    genArrayRange(21, 80, (v: number) => v % 2 == 1).reverse()
  );

  // trigger load more

  const loadMoreRunsButton = wrapper.find('[data-test="loadMoreRunsButton"]');
  loadMoreRunsButton.trigger('click');

  await flushPromises();

  runNumbers = wrapper.findAll<HTMLInputElement>('[data-test="runNumber"]');

  expect(runNumbers.length).toBe(50);

  checkExpectedRunNumberValues(
    runNumbers,
    genArrayRange(1, 100, (v: number) => v % 2 == 1).reverse()
  );
});
