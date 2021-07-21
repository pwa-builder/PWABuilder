/**
 * Possible stages of the preview component.
 */
export const PREVIEW_STAGES = [
  'install',
  'splashScreen',
  'name',
  'shortName',
  'themeColor',
  'shortcuts',
  'display',
  'categories',
  'shareTarget'
] as const;
export type PreviewStage = typeof PREVIEW_STAGES[number];

/**
 * Supported platforms.
 */
export type Platform = 'windows' | 'android' | 'iOS';

/**
 * The description messages on each preview screen.
 */
export type ScreenDescriptions = Partial<Partial<Record<PreviewStage, Record<Platform, string>>>>;

/**
 * Titles of each preview screen.
 */
export type ScreenTitles = Partial<Record<PreviewStage, string>>;