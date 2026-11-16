import { getPackageAuthorization } from "./package-job-access";
import { getAndroidServiceUrl } from "./packaging-configuration";

type RequestPhase = "configuration" | "authorization" | "request" | "response" | "body" | "handoff";
type DeliveryEvent = "page-opened" | "page-left" | "visibility-changed" | "offline" | "online"
    | "poll-failed" | "poll-retry" | "poll-stopped" | "poll-timeout" | "status-changed" | "client-error"
    | "download-started" | "download-failed" | "download-retry" | "download-body-read" | "download-handoff";
interface DeliveryDetails {
    phase?: RequestPhase;
    status?: number;
    errorName?: string;
    attempt?: number;
    bytes?: number;
    durationMs?: number;
    jobStatus?: "Queued" | "InProgress" | "Completed" | "Failed";
}

export class PackageRequestError extends Error {
    constructor(readonly phase: RequestPhase, message: string, readonly status?: number,
        readonly errorName = "Error") {
        super(message);
    }
}

export function packageFailureDetails(error: unknown): DeliveryDetails {
    const name = error instanceof PackageRequestError ? error.errorName : error instanceof Error ? error.name : "Other";
    return {
        ...(error instanceof PackageRequestError ? { phase: error.phase, status: error.status } : {}),
        errorName: ["Error", "TypeError", "AbortError", "TimeoutError"].includes(name) ? name : "Other"
    };
}

/** Best-effort bounded delivery logs, using the existing owner credential and private diagnostics sink. */
export class PackageDeliveryDiagnostics {
    private readonly started = performance.now();
    private readonly pending: object[] = [];
    private count = 0;
    private flushing = false;
    private serviceUrl: string | null = null;

    constructor(readonly jobId: string) {}

    report(event: DeliveryEvent, details: DeliveryDetails = {}): void {
        if (this.count >= 60) {
            void this.flush();
            return;
        }
        this.count++;
        this.pending.push({
            event, ...details, online: navigator.onLine, visibility: document.visibilityState,
            elapsedMs: Math.round(performance.now() - this.started)
        });
        void this.flush();
    }

    private async flush(): Promise<void> {
        if (this.flushing) return;
        this.flushing = true;
        try {
            // Only diagnostics retain their original destination; packaging operations still resolve fresh slot config.
            this.serviceUrl ??= await getAndroidServiceUrl(import.meta.env.DEV);
            while (this.pending.length) {
                const batch = this.pending.slice(0, 20);
                const response = await fetch(`${this.serviceUrl}/packageJobDiagnostics?id=${encodeURIComponent(this.jobId)}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: getPackageAuthorization(this.jobId, localStorage)
                    },
                    body: JSON.stringify(batch),
                    cache: "no-store",
                    keepalive: true,
                    signal: AbortSignal.timeout(5000)
                });
                if (!response.ok) {
                    throw new PackageRequestError("response", "Delivery diagnostic submission failed.", response.status);
                }
                this.pending.splice(0, batch.length);
            }
        } catch (error) {
            // Keep the bounded queue for the next event (including going online), without delaying packaging or retries.
            console.warn("Unable to submit package delivery diagnostics.", packageFailureDetails(error));
        } finally {
            this.flushing = false;
        }
    }
}
