import { languages } from './languages.js';

export type langType = {
    code: string;
    name: string;
};

export type langCodes = {
    formatted: string;
    code: string;
};

export const languageCodes: Array<langCodes> = languages.map((it: langType) => {
    return { formatted: it.name, code: it.code };
});