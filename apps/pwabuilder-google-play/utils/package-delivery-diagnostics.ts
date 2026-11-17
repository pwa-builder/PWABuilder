import { redisService } from "../services/redisService.js";

const browserEvents = [
    "page-opened", "page-left", "visibility-changed", "offline", "online",
    "poll-failed", "poll-retry", "poll-stopped", "poll-timeout", "status-changed", "client-error",
    "download-started", "download-failed", "download-retry", "download-body-read", "download-handoff"
];
const phases = ["configuration", "authorization", "request", "response", "body", "handoff", "stream"];
const errorNames = ["Error", "TypeError", "AbortError", "TimeoutError", "Other"];
const storageCodes = ["BlobNotFound", "ContainerNotFound", "AuthorizationFailure",
    "AuthorizationPermissionMismatch", "AuthenticationFailed", "ETIMEDOUT", "ECONNRESET"];
const numericLimits: Record<string, number> = {
    status: 599, attempt: 1000, bytes: Number.MAX_SAFE_INTEGER,
    elapsedMs: 14 * 86400 * 1000, durationMs: 14 * 86400 * 1000
};
const enumValues: Record<string, readonly string[]> = {
    phase: phases, errorName: errorNames, visibility: ["visible", "hidden", "prerender"],
    jobStatus: ["Queued", "InProgress", "Completed", "Failed"]
};

export type DeliveryDetails = Record<string, string | number | boolean | undefined>;

/** Accept only bounded measurements and fixed labels, never free-text errors or URLs. */
export function isBrowserDeliveryEvent(value: unknown): value is DeliveryDetails & { event: string } {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }
    return Object.entries(value).every(([key, item]) => {
        if (key === "event") return typeof item === "string" && browserEvents.includes(item);
        if (key === "online") return typeof item === "boolean";
        if (Object.hasOwn(enumValues, key)) return typeof item === "string" && enumValues[key].includes(item);
        if (Object.hasOwn(numericLimits, key)) return typeof item === "number" && Number.isSafeInteger(item)
            && item >= 0 && item <= numericLimits[key];
        return false;
    }) && "event" in value;
}

/** Extract useful storage failure categories without persisting exception messages or blob names. */
export function deliveryErrorDetails(error: unknown): DeliveryDetails {
    const details = error && typeof error === "object" ? error : {};
    const name = "name" in details ? details.name : undefined;
    const code = "code" in details ? details.code : undefined;
    const status = "statusCode" in details ? details.statusCode : undefined;
    return {
        errorName: typeof name === "string" && errorNames.includes(name) ? name : "Other",
        code: typeof code === "string" && storageCodes.includes(code) ? code : undefined,
        status: typeof status === "number" && Number.isInteger(status) && status >= 100 && status <= 599 ? status : undefined
    };
}

/** Delivery diagnostics are separate from worker snapshots so concurrent progress saves cannot erase them. */
export async function recordDeliveryEvent(reference: string | undefined, source: "browser" | "server",
    event: string, details: DeliveryDetails = {}): Promise<boolean> {
    if (!reference || !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(reference)) {
        console.warn("Package delivery diagnostic has no valid support reference.");
        return false;
    }
    const properties = Object.entries(details).filter(([key, value]) => key !== "event" && value !== undefined)
        .map(([key, value]) => `${key}=${value}`).join(" ");
    const line = `${new Date().toISOString()} [delivery] ${source} ${event}${properties ? " " + properties : ""}`;
    console.info("Package delivery supportReference=%s %s", reference, line);
    try {
        await redisService.appendPackageDiagnostic(reference, line);
        return true;
    } catch (error) {
        console.error("Unable to persist package delivery diagnostic supportReference=%s errorName=%s",
            reference, deliveryErrorDetails(error).errorName);
        return false;
    }
}
