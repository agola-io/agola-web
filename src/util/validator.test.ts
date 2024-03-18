import { expect, test } from 'vitest';
import { isValidName } from './validator';

test.each([
  // good names
  ['0', true],
  ['a', true],
  ['Z', true],
  ['bar', true],
  ['foo-bar', true],
  ['foo-bar-baz', true],
  ['foo1', true],
  ['foo-1', true],
  ['foo-1-bar', true],
  ['f12oo-bar33', true],
  ['cba7b810-9dad-11d1-80b4-00c04fd430c', true],
  ['cba7b810-9dad-11d1-80b4000c04fd430c8', true],
  ['cba7b8109dad11d180b400c04fd430c89', true],
  ['cba7b8109dad11d180b400c04fd430c', true],

  // bad names
  ['', false],
  ['-', false],
  ['È', false],
  ['Èà', false],
  ['foo bar', false],
  [' foo bar', false],
  ['foo bar ', false],
  ['-bar', false],
  ['bar-', false],
  ['-foo-bar', false],
  ['foo-bar-', false],
  ['foo--bar', false],
  ['foo.bar', false],
  ['foo_bar', false],
  ['foo#bar', false],
  ['1foobar', false],
  ['cba7b810-9dad-11d1-80b4-00c04fd430c8', false], // uuid
  ['{cba7b810-9dad-11d1-80b4-00c04fd430c8}', false], // uuid
  ['urn:uuid:cba7b810-9dad-11d1-80b4-00c04fd430c8', false], // uuid
  ['cba7b8109dad11d180b400c04fd430c8', false], // uuid
  ['abcdefghijklmnopqrstuvwxyz0123456789abcde', false], // 41 ascii chars length
])('%s is valid name -> %s', (name, expected) => {
  expect(isValidName(name)).toBe(expected);
});
