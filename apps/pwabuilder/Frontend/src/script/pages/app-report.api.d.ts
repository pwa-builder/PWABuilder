import { Validation } from '@pwabuilder/manifest-validation';
import { TestResult } from '../utils/interfaces';
export type ReportAudit = {
    manifestValidations: Validation[];
    serviceWorkerValidations: TestResult[];
    securityValidations: TestResult[];
    audits: {
        serviceWorker: {
            url?: string;
            scope?: string;
        };
        appleTouchIcon: {
            score: boolean;
        };
        maskableIcon: {
            score: boolean;
        };
        splashScreen: {
            score: boolean;
        };
        themedOmnibox: {
            score: boolean;
        };
        viewport: {
            score: boolean;
        };
        images: {
            score: boolean;
            details: {
                iconsValidation?: Validation;
                screenshotsValidation?: Validation;
            };
        };
    };
    artifacts: {
        webAppManifestDetails: {
            raw?: string;
            url?: string;
            value?: unknown;
            json?: unknown;
        };
        serviceWorker: {
            registrations: unknown[];
            versions: unknown[];
            raw?: string;
        };
        url: string;
        linkElements: unknown[];
        metaElements: unknown[];
    };
};
export type FindWebManifestResult = {
    content: {
        url: string;
        raw: string;
        json: unknown;
        validations: Validation[];
    };
};
export type Analysis = {
    id: string;
    url: string;
    createdAt: string;
    lastModifiedAt: string;
    duration: string | null;
    status: "Queued" | "Processing" | "Completed" | "Failed";
    error: string | null;
    webManifest: ManifestDetection | null;
    serviceWorker: ServiceWorkerDetection | null;
    lighthouseReport: LighthouseReport | null;
    logs: string[];
    canPackage: boolean;
    capabilities: PwaCapability[];
};
export type PwaCapability = {
    level: PwaCapabilityLevel;
    category: PwaCapabilityCategory;
    id: PwaCapabilityId;
    featureName: string | null;
    featureIcon: string | null;
    description: string;
    todoAction: string;
    field: string | null;
    isFieldExistenceCheck: boolean;
    learnMoreUrl: string | null;
    imageUrl: string | null;
    status: PwaCapabilityStatus;
    errorMessage: string | null;
};
export type PwaCapabilityLevel = "Required" | "Recommended" | "Optional" | "Feature";
export type PwaCapabilityCategory = "ServiceWorker" | "WebAppManifest" | "Https" | "General";
export type PwaCapabilityId = "HasManifest" | "Name" | "Id" | "ShortName" | "Description" | "BackgroundColor" | "Shortcuts" | "Categories" | "Icons" | "ThemeColor" | "Scope" | "ScopeExtensions" | "Display" | "Orientation" | "Language" | "Direction" | "Screenshots" | "FileHandlers" | "LaunchHandlers" | "PreferRelatedApplication" | "RelatedApplication" | "ProtocolHandlers" | "ShareTarget" | "IarcRatingId" | "DisplayOverride" | "WindowControlsOverlay" | "TabbedDisplay" | "NoteTaking" | "StartUrl" | "Widgets" | "EdgeSidePanel" | "IconsAreFetchable" | "HasSquare192x192PngAnyPurposeIcon" | "HasSquare512x512PngAnyPurposeIcon" | "ScreenshotsAreFetchable" | "HasWideScreenshot" | "HasNarrowScreenshot" | "HasServiceWorker" | "ServiceWorkerIsNotEmpty" | "PeriodicSync" | "BackgroundSync" | "PushNotifications" | "OfflineSupport" | "HasHttps" | "NoMixedContent" | "ServesHtml";
export type PwaCapabilityStatus = "InProgress" | "Skipped" | "Passed" | "Failed";
export type ManifestDetection = {
    url: string;
    manifest: object;
    manifestRaw: string;
    appIcon: string | null;
};
export type ServiceWorkerDetection = {
    url: string;
    raw: string | null;
};
export type LighthouseReport = {
    lighthouseVersion: string | null;
    requestedUrl: string | null;
    mainDocumentUrl: string | null;
    finalDisplayedUrl: string | null;
    fetchTime: string;
    gatherMode: string | null;
    runWarnings: string[] | null;
    userAgent: string | null;
};
export type FindServiceWorkerResult = {
    content: {
        url: string;
        raw: string;
    };
};
export type AuditServiceWorkerResult = {
    validations: TestResult[];
};
export declare function Report(url: string): Promise<ReportAudit>;
/**
 * Queues an analysis job for the specified site.
 * @param site The site URL to analyze.
 * @returns The ID of the queued analysis job.
 */
export declare function enqueueAnalysis(site: string): Promise<string>;
/**
 * Gets the analysis with the specified ID.
 * @param id The ID of the analysis to retrieve.
 * @returns The analysis with the specified ID, or null if not found.
 */
export declare function getAnalysis(id: string): Promise<Analysis | null>;
export declare function FindWebManifest(site: string): Promise<FindWebManifestResult>;
export declare function FindServiceWorker(site: string): Promise<FindServiceWorkerResult>;
export declare function AuditServiceWorker(url: string): Promise<AuditServiceWorkerResult>;
