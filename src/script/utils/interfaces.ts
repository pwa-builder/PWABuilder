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
  error?: string;
}

export interface RawTestResult {
  manifest: Array<TestResult>;
  service_worker: Array<TestResult>;
  security: Array<TestResult>;
}

export interface TestResult {
  infoString: string;
  result: boolean;
  category: string;
}

export interface OrganizedResults {
  required: Array<TestResult>;
  recommended: Array<TestResult>;
  optional: Array<TestResult>;
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

export interface FileInputDetails {
  input: HTMLInputElement;
}
