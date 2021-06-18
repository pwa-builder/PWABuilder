// iOS package generation options

import { Manifest } from "./interfaces";

export interface iosOptions {
  name: string,
  url: string,
  imageUrl: string,
  splashColor: string,
  progressBarColor: string,
  statusBarColor: string,
  permittedUrls: Array<string>,
  manifest: Manifest,
  manifestUrl: string
}
