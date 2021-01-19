export interface Manifest {
  background_color: string | null;
  description: string | null;
  dir: string | null;
  display: string;
  lang: string | null;
  name: string | null;
  orientation?:
    | 'any'
    | 'natural'
    | 'landscape'
    | 'portrait'
    | 'portrait-primary'
    | 'portrait-secondary'
    | 'landscape-primary'
    | 'landscape-secondary'
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

export interface Icon {
  src: string;
  generated?: boolean;
  type?: string;
  sizes?: string;
  purpose?: 'any' | 'maskable' | 'monochrome';
  platform?: string;
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

export interface ManifestDetectionResult {
  content: Manifest;
  format: 'w3c' | 'chromeos' | 'edgeextension' | 'windows10' | 'firefox';
  generatedUrl: string;
  default: {
    short_name: string;
  };
  id: string;
  errors: [];
  suggestions: [];
  warnings: [];
}

export interface ManifestTestResults {
  has_manifest: boolean;
    has_icons: boolean;
    has_name: boolean;
    has_short_name:
      boolean;
    has_start_url:
      boolean;
    has_display_mode: boolean;
    has_background_color: boolean;
    has_theme_color: boolean;
    has_orientation_mode: boolean;
    has_screenshots: boolean;
    has_square_512: boolean;
    has_maskable_icon: boolean;
    has_shortcuts: boolean;
    has_categories: boolean;
    has_rating_id: boolean;
    has_related: boolean;
}