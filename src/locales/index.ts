import english from './en_US.json';
import lang from './languages.json';

export type langType = {
  code: string,
  name: string
}

export type langCodes = {
  formatted: string,
  code: string
}

function localization() {
  // TODO flesh out if we localize
  return english;
}

export const localeStrings = localization();

export const languageCodes: Array<langCodes> = lang.map((it: langType) => {
  return { formatted: it.name, code: it.code };
});
