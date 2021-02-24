export interface Manifest {
  backgroundColor: string | null;
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
  preferRelatedApplications?: boolean;
  relatedApplications?: RelatedApplication[];
  scope: string | null;
  shortName: string | null;
  startUrl: string | null;
  themeColor: string | null;
  generated?: boolean | null;
  url: string | null;
  shortcuts?: ShortcutItem[];
  categories?: string[];
  screenshots?: Icon[];
  iarcRatingId?: string;
  icons?: Icon[];
  shareTarget?: ShareTarget;
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
  generated: boolean;
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

export enum Status {
  DONE = 'done',
  ACTIVE = 'active',
  PENDING = 'pending',
}

export interface Progress {
  header: ListHeader;
  location: string;
  done: Status;
  items: Array<{ name: string; done: Status }>;
}

export interface ProgressList {
  progress: Array<Progress>
}

export enum ListHeader {
  TEST = 'Test',
  REVIEW = 'Review',
  PUBLISH = 'Package',
  COMPLETE = 'Complete'
}
