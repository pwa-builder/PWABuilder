export interface Question {
  type: string;
  name: string;
  message: string;
  default?: string;
  choices?: string[];
  validate?: Function;
}

export interface MsixInfo {
  name?: string;
  packageId: string;
  url?: string;
  version: string;
  allowSigning: boolean;
  classicPackage: ClassicPackage;
  publisher?: Publisher;
}

interface ClassicPackage {
  generate: boolean;
  version: string;
}

interface Publisher {
  displayName: string;
  commonName: string;
}

export interface Manifest {
  background_color?: string;
  description?: string;
  dir?: "auto" | "ltr" | "rtl" | string;
  display?: "standalone" | "fullscreen" | "fullscreen-sticky";
  lang?: string | undefined;
  name?: string | undefined;
  orientation?:
    | "any"
    | "natural"
    | "landscape"
    | "portrait"
    | "portrait-primary"
    | "portrait-secondary"
    | "landscape-primary"
    | "landscape-secondary";
  prefer_related_applications?: boolean;
  related_applications?: RelatedApplication[];
  scope?: string;
  short_name?: string;
  start_url?: string;
  theme_color?: string;
  generated?: boolean;
  shortcuts?: ShortcutItem[];
  categories?: string[];
  screenshots?: Screenshot[];
  iarc_rating_id?: string;
  iconBlobUrls?: string[];
  icons?: Icon[];
  share_target?: ShareTarget;

  // for custom properties as well as using object notations: manifest[key]
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - accomodate custom entries... these can be a pain
  [key: string]: string | boolean | undefined | Array<any> | any;
}

export interface ShortcutItem {
  name: string;
  url: string;
  description?: string;
  short_name?: string;
  icons?: Icon[];
}

export interface Icon {
  src: string;
  generated?: boolean;
  type?: string;
  sizes?: string;
  purpose?: "any" | "maskable" | "monochrome";
  label?: string;
}

export interface Screenshot extends Icon {
  platform?:
    | "narrow"
    | "wide"
    | "android"
    | "chromeos"
    | "ios"
    | "kaios"
    | "macos"
    | "windows"
    | "xbox"
    | "chrome_web_store"
    | "play"
    | "itunes"
    | "microsoft-inbox"
    | "microsoft-store";
}

export interface RelatedApplication {
  platform: string;
  url?: string | null;
  id?: string | null;
  min_version?: string | null;
  fingerprints?: Fingerprint[];
}

export interface Fingerprint {
  type: string;
  value: string;
}

export interface ShareTarget {
  action?: string;
  method?: string;
  enctype?: string;
  params?: ShareTargetParams;
}

export interface ShareTargetParams {
  title?: string;
  text?: string;
  url?: string;
  files?: FilesParams[];
}

export interface FilesParams {
  name: string;
  accept: string[];
}
