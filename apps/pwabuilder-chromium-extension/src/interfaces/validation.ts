import { Manifest } from "./manifest";

export interface ManifestDetectionResult {
    hasManifest: boolean;
    manifest?: Manifest,
    manifestUri?: string
}

export interface ServiceWorkerDetectionResult {
    hasSW: boolean;
    rawSW?: string;
    url?: string | null;
    scope?: string | null;
    hasPushRegistration?: boolean;
    serviceWorkerDetectionTimedOut?: boolean;
    noServiceWorkerFoundDetails?: string | null;
    hasBackgroundSync?: boolean;
    hasPeriodicBackgroundSync?: boolean;
    isHtmlInCache?: boolean;
}

export interface SecurityDataResults {
    isHTTPS: true;
    validProtocol: true;
    valid: true;
}

export interface SiteData {
    manifest: ManifestDetectionResult,
    sw: ServiceWorkerDetectionResult
}