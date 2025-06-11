import { dnameInvalidCharacters } from './android-validation';

export const AppNameInputPattern = '[^\\|\\$\\@\\#\\>\\<\\)\\(\\!\\&\\%\\*]+$';
export const DnameInputPattern = `[^${dnameInvalidCharacters}]+$`;
