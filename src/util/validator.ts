import { UUID } from 'uuidjs';

export function isValid(validatorResult: string | undefined): boolean {
  return !validatorResult;
}

const minNameCharacters = 1;
const maxNameCharacters = 40;

function charsCount(s: string): number {
  return [...s].length;
}

const singleCharNameRegexp = /^[a-zA-Z0-9]$/;
const nameRegExp = /^[a-zA-Z][a-zA-Z0-9]*([-]?[a-zA-Z0-9]+)+$/;

export function isValidName(name: string): boolean {
  const c = charsCount(name);

  // also handle uuid in hash format (without dashes)
  if (c == 32) {
    name = name.slice(0, 20) + '-' + name.slice(20);
    name = name.slice(0, 16) + '-' + name.slice(16);
    name = name.slice(0, 12) + '-' + name.slice(12);
    name = name.slice(0, 8) + '-' + name.slice(8);
  }

  const uuid = UUID.parse(name);
  if (uuid) return false;

  if (c < minNameCharacters || c > maxNameCharacters) {
    return false;
  }

  if (c == 1) {
    return singleCharNameRegexp.test(name);
  }

  return nameRegExp.test(name);
}
