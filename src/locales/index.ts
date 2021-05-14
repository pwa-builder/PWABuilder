import english from './en_US.json';
import lang from './languages.json';

export type langType = {
  code: string,
  name: string
}

function localization() {
  // TODO flesh out if we localize
  return english;
}

export const localeStrings = localization();

export const languageCodes = lang.map((it: langType) => it.code);
