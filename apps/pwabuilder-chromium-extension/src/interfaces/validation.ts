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
    isHTTPS: boolean;
    validProtocol: boolean;
    valid: boolean;
}

export interface SiteData {
    currentUrl: string,
    manifest: ManifestDetectionResult,
    sw: ServiceWorkerDetectionResult,
    security?: SecurityDataResults
}