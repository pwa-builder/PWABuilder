/**
 * Possible stages of the preview component.
 */
 export enum PreviewStage {
  Install,
  SplashScreen,
  Name,
  ShortName,
  ThemeColor,
  Shortcuts,
  Display,
  Categories,
  ShareTarget
}

/**
 * Supported platforms.
 */
export type Platform = 'windows' | 'android' | 'iOS';