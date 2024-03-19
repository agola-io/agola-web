import { expect, test } from 'vitest';
import { isValidName } from './validator';

export const validNames = [
  '0',
  'a',
  'Z',
  'bar',
  'foo-bar',
  'foo-bar-baz',
  'foo1',
  'foo-1',
  'foo-1-bar',
  'f12oo-bar33',
  'cba7b810-9dad-11d1-80b4-00c04fd430c',
  'cba7b810-9dad-11d1-80b4000c04fd430c8',
  'cba7b8109dad11d180b400c04fd430c89',
  'cba7b8109dad11d180b400c04fd430c',
];

export const invalidNames = [
  '',
  '-',
  'È',
  'Èà',
  'foo bar',
  ' foo bar',
  'foo bar ',
  '-bar',
  'bar-',
  '-foo-bar',
  'foo-bar-',
  'foo--bar',
  'foo.bar',
  'foo_bar',
  'foo#bar',
  '1foobar',
  'cba7b810-9dad-11d1-80b4-00c04fd430c8', // uuid
  '{cba7b810-9dad-11d1-80b4-00c04fd430c8}', // uuid
  'urn:uuid:cba7b810-9dad-11d1-80b4-00c04fd430c8', // uuid
  'cba7b8109dad11d180b400c04fd430c8', // uuid
  'abcdefghijklmnopqrstuvwxyz0123456789abcde', // 41 ascii chars length
];

test.each(validNames)('"%s" is valid name', (name) => {
  expect(isValidName(name)).toBe(true);
});

test.each(invalidNames)('"%s" is invalid name', (name) => {
  expect(isValidName(name)).toBe(false);
});
