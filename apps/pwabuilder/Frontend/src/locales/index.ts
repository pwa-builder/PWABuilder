import english from './en_US.json';
import lang from './languages.json';

export type langType = {
  code: string;
  name: string;
};

export type langCodes = {
  formatted: string;
  code: string;
};

function localization() {
  // TODO flesh out if we localize
  return english;
}

export const localeStrings = localization();

const localeCache: { [name: string]: string | undefined } = {};

// use dot notation
export function locale(key: string): string {
  if (localeCache[key]) {
    return localeCache[key] as string;
  }

  const steps = key.split('.');
  const length = steps.length;

  let value: any | string = localeStrings;
  for (let i = 0; i < length; i++) {
    value = value[steps[i] as any];
  }

  if (typeof value !== 'string') {
    return 'NO LOCALIZATION FOUND';
  }

  localeCache[key] = value;
  return value;
}

export const languageCodes: Array<langCodes> = lang.map((it: langType) => {
  return { formatted: it.name, code: it.code };
});
