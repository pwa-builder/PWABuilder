import { GooglePlayPackageJob } from "../models/googlePlayPackageJob.js";
import { redactSecretsFromError } from "./redactSecrets.js";

export interface PackageJobStatus {
    id: string;
    supportReference: string | undefined;
    pwaUrl: string;
    analysisId: string | null;
    status: GooglePlayPackageJob["status"];
    createdAt: string;
    retryCount: number;
    name: string;
    logs: string[];
    errors: string[];
    downloadAvailable: boolean;
}

export interface PackageJobDiagnostics {
    supportReference: string | undefined;
    status: GooglePlayPackageJob["status"];
    createdAt: string;
    updatedAt: string;
    retryCount: number;
    siteOrigin: string;
    configuration: {
        name: string;
        packageId: string;
        appVersion: string;
        appVersionCode: number;
        minSdkVersion: number | undefined;
        signingMode: "new" | "mine" | "none";
        hasUploadedKey: boolean;
        hasKeyPassword: boolean;
        hasStorePassword: boolean;
    };
    logs: string[];
    errors: string[];
}

export function sanitizeJobText(job: GooglePlayPackageJob, text: string): string {
    const signing = job.packageOptions.signing;
    const secrets = [
        ...Object.values(signing || {}),
        job.uploadedBlobFileName
    ].filter((value): value is string => typeof value === "string" && value.length > 0);
    const encodedSecrets = secrets.flatMap(secret => [
        secret, encodeURIComponent(secret), JSON.stringify(secret).slice(1, -1),
        ...(secret.startsWith("data:") ? [secret.slice(secret.indexOf(",") + 1)] : [])
    ]);
    const redacted = redactSecretsFromError({ message: text }, encodedSecrets).message;
    return redacted
        .replace(/data:[^\s"']+/gi, "[redacted data]")
        .replace(/\bBearer\s+[A-Za-z0-9._~-]+/gi, "Bearer [redacted]")
        .replace(/((?:--?(?:ks-pass|key-pass|ks-key-pass|storepass|keypass|ks-key-alias))[\s=]+)(?:"[^"]*"|'[^']*'|\S+)/gi, "$1[redacted]")
        .replace(/((?:"?(?:keyPassword|storePassword|accessToken|clientSecret|password|authorization)"?)\s*[:=]\s*)(?:"[^"]*"|'[^']*'|[^\s,}]+)/gi, "$1[redacted]")
        .replace(/https?:\/\/[^\s"'<>]+/gi, value => {
            if (value === "https://docs.pwabuilder.com/#/builder/faq?id=error-403-forbidden-during-analysis-or-packaging") {
                return value;
            }
            try {
                return new URL(value).origin;
            } catch {
                return "[redacted URL]";
            }
        })
        .slice(0, 4000);
}

export function getPackageJobStatus(job: GooglePlayPackageJob): PackageJobStatus {
    const url = new URL(job.pwaUrl);
    return {
        id: job.id,
        supportReference: job.supportReference,
        pwaUrl: url.origin + url.pathname,
        analysisId: job.analysisId,
        status: job.status,
        createdAt: job.createdAt,
        retryCount: job.retryCount,
        name: sanitizeJobText(job, job.packageOptions.name),
        logs: job.logs.slice(-100).map(log => sanitizeJobText(job, log)),
        errors: job.errors.slice(-20).map(error => sanitizeJobText(job, error)),
        downloadAvailable: job.status === "Completed" && !!job.uploadedBlobFileName
    };
}

export type StoredPackageJob = PackageJobStatus & { uploadedBlobFileName: string | null };

export function getPackageJobDiagnostics(job: GooglePlayPackageJob): PackageJobDiagnostics {
    const options = job.packageOptions;
    const status = getPackageJobStatus(job);
    return {
        supportReference: job.supportReference,
        status: job.status,
        createdAt: job.createdAt,
        updatedAt: new Date().toISOString(),
        retryCount: job.retryCount,
        siteOrigin: new URL(job.pwaUrl).origin,
        configuration: {
            name: status.name,
            packageId: sanitizeJobText(job, options.packageId),
            appVersion: sanitizeJobText(job, options.appVersion),
            appVersionCode: options.appVersionCode,
            minSdkVersion: options.minSdkVersion,
            signingMode: options.signingMode,
            hasUploadedKey: !!options.signing?.file,
            hasKeyPassword: !!options.signing?.keyPassword,
            hasStorePassword: !!options.signing?.storePassword
        },
        logs: status.logs,
        errors: status.errors
    };
}
