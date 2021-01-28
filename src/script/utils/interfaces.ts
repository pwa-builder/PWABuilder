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
  has_manifest: { infoString: string; result: boolean };
  has_icons: { infoString: string; result: boolean };
  has_name: { infoString: string; result: boolean };
  has_short_name: { infoString: string; result: boolean };
  has_start_url: { infoString: string; result: boolean };
  has_display_mode: { infoString: string; result: boolean };
  has_background_color: { infoString: string; result: boolean };
  has_theme_color: { infoString: string; result: boolean };
  has_orientation_mode: { infoString: string; result: boolean };
  has_screenshots: { infoString: string; result: boolean };
  has_square_512: { infoString: string; result: boolean };
  has_maskable_icon: { infoString: string; result: boolean };
  has_shortcuts: { infoString: string; result: boolean };
  has_categories: { infoString: string; result: boolean };
  has_rating_id: { infoString: string; result: boolean };
  has_related: { infoString: string; result: boolean };
}

export interface ServiceWorkerDetectionResult {
  hasSW: boolean;
  scope: string | null;
  url: string | null;
  hasPushRegistration: boolean;
  serviceWorkerDetectionTimedOut: boolean;
  noServiceWorkerFoundDetails: string | null;
}

export interface SecurityDataResults {
  data: {
    isHTTPS: true;
    validProtocol: true;
    valid: true;
  };
}
