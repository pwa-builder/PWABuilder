/**
 * Possible stages of the preview component.
 */
 export enum PreviewStage {
  Name,
  ShortName,
  Display,
  ThemeColor,
  Install,
  SplashScreen,
  Shortcuts,
  Categories,
  ShareTarget
}

/**
 * Supported platforms.
 */
export type Platform = 'windows' | 'android' | 'iOS';