export interface Manifest {
  background_color: string | null;
  description: string | null;
  dir: string | null;
  display: string;
  lang: string | null;
  name: string | null;
  orientation?:
    | "any"
    | "natural"
    | "landscape"
    | "portrait"
    | "portrait-primary"
    | "portrait-secondary"
    | "landscape-primary"
    | "landscape-secondary"
    | null;
  prefer_related_applications?: boolean;
  related_applications?: RelatedApplication[];
  scope: string | null;
  short_name: string | null;
  start_url: string | null;
  theme_color: string | null;
  generated?: boolean | null;
  url: string | null;
  shortcuts?: ShortcutItem[];
  categories?: string[];
  screenshots?: Icon[];
  iarc_rating_id?: string;
  icons?: Icon[];
  share_target?: ShareTarget;
}

export interface ShortcutItem {
  name: string;
  url: string;
  description?: string;
  short_name?: string;
  icons?: Icon[];
}

export interface Fingerprint {
  type: string;
  value: string;
}

export interface StaticContent {
  code: string;
  name: string;
}

export interface Icon {
  src: string;
  generated?: boolean;
  type?: string;
  sizes?: string;
  purpose?: "any" | "maskable" | "monochrome";
  platform?: string;
}

export interface Asset {
  filename: string;
  data: Blob;
}

export interface RelatedApplication {
  platform: string;
  url?: string | null;
  id?: string | null;
  min_version?: string | null;
  fingerprints?: Fingerprint[];
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

export interface ShareTarget {
  action?: string;
  method?: string;
  enctype?: string;
  params?: ShareTargetParams;
}

export interface CustomMember {
  name: string;
  value: string;
}

export interface ColorOptions {
  colorOption: string;
  color: string;
}

export interface CodeIssue {
  code: string;
  description: string;
  platform: string;
}

export interface CodeError {
  member: string;
  issues: CodeIssue[];
}

/**
 * A W3C web manifest, with an additional property containing the URL of the manifest.
 */
export interface ManifestContext extends Manifest {
  /**
   * The URL of the manifest.
   */
  manifestUrl: string | null;
}

export interface State {
  url: string | null;
  manifest: ManifestContext | null;
  manifestUrl: string | null;
  manifestId: string | null;
  siteServiceWorkers: any;
  icons: Icon[];
  screenshots: Icon[];
  shortcuts: ShortcutItem[];
  members: CustomMember[];
  suggestions: CodeError[] | null;
  warnings: CodeError[] | null;
  errors: string[] | null;
  assets: Asset[] | null;
  generated: boolean | null;
}

export const state = (): State => ({
  url: null,
  manifest: null,
  manifestUrl: null,
  manifestId: null,
  siteServiceWorkers: null,
  icons: [],
  screenshots: [],
  shortcuts: [],
  members: [],
  suggestions: null,
  warnings: null,
  errors: null,
  assets: null,
  generated: null,
});

export interface ManifestDetectionResult {
  content: Manifest;
  format: "w3c" | "chromeos" | "edgeextension" | "windows10" | "firefox";
  generatedUrl: string;
  default: {
    short_name: string;
  };
  id: string;
  errors: [];
  suggestions: [];
  warnings: [];
}

export interface ServiceWorkerDetectionResult {
  hasSW: boolean;
  scope: string | null;
  url: string | null;
  hasPushRegistration: boolean;
  hasBackgroundSync: boolean;
  hasPeriodicBackgroundSync: boolean;
  serviceWorkerDetectionTimedOut: boolean;
  noServiceWorkerFoundDetails: string | null;
}
