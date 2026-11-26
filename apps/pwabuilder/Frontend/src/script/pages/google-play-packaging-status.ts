import { html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from 'lit/decorators.js';
import "../components/app-header";
import { downloadGooglePlayPackageZip, getGooglePlayPackageJob } from "../services/publish/android-publish";
import { GooglePlayPackageJob } from "../models/google-play-package-job";
import { googlePlayPackagingStatusStyles } from "./google-play-packaging-status.styles";
import { AnalyticsBehavior, recordProcessStep } from "@pwabuilder/site-analytics";
import { repeat } from "lit/directives/repeat.js";
import { Router } from "@vaadin/router";
import { packagingCompleted, packagingFailed } from "./app-report.api";
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/card/card.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';
import '@awesome.me/webawesome/dist/components/spinner/spinner.js';
import { packageSupportIssueBody } from "../utils/package-job-access";
import { PackageDeliveryDiagnostics, packageFailureDetails, PackageRequestError } from "../utils/package-delivery-diagnostics";

/**
 * A page that shows the status of a Google Play packaging job.
 */
@customElement("google-play-packaging-status")
export class GooglePlayPackagingStatus extends LitElement {
    private readonly forbiddenAnalysisHelpUrl = "https://docs.pwabuilder.com/#/builder/faq?id=error-403-forbidden-during-analysis-or-packaging";
    private readonly forbiddenAnalysisFailureMessage = "Your web app is blocking PWABuilder from accessing your app's images, serving 403 Forbidden errors to PWABuilder. If the problem persists, please temporarily disable your firewall, CDN, or Cloudflare while packaging with PWABuilder. For more help, see https://docs.pwabuilder.com/#/builder/faq?id=error-403-forbidden-during-analysis-or-packaging";
    @property({ attribute: "job-id" }) jobId: string | null = null;
    @state() hasFailed = false;
    @state() logs: string[] = [];
    @state() job: GooglePlayPackageJob | null = null;
    @state() hasDownloadFailed = false;
    @state() isDownloading = false;
    private readonly pollIntervalMs = 3000; // Poll the job every 3 seconds
    private readonly maxWaitTimeMs = 30 * 60 * 1000; // Max wait time of 30 minutes
    private readonly pollQueryRetryDelayMs = 10000; // Wait 10 seconds before retrying a failed query
    autoDownloadRetryDelayMs = 3000; // Wait 3 seconds before automatically retrying a failed download
    private jobTimeoutHandle = 0;
    private hasRecordedCompletion = false;
    private hasRecordedFailure = false;
    private pollingTimedOut = false;
    private pollQueryErrorCount = 0; // Number of consecutive errors when querying for job status
    private deliveryDiagnostics: PackageDeliveryDiagnostics | null = null;
    private lastReportedStatus: GooglePlayPackageJob["status"] | null = null;
    private downloadAttempt = 0;
    private readonly onOffline = () => this.reportDelivery("offline");
    private readonly onOnline = () => this.reportDelivery("online");
    private readonly onPageHide = () => this.reportDelivery("page-left");
    private readonly onVisibilityChange = () => this.reportDelivery("visibility-changed");
    private readonly onClientError = (event: ErrorEvent) => this.reportDelivery("client-error", packageFailureDetails(event.error));
    private readonly onUnhandledRejection = (event: PromiseRejectionEvent) => this.reportDelivery("client-error", packageFailureDetails(event.reason));

    static styles = [googlePlayPackagingStatusStyles];

    connectedCallback(): void {
        super.connectedCallback();
        window.addEventListener("offline", this.onOffline);
        window.addEventListener("online", this.onOnline);
        window.addEventListener("pagehide", this.onPageHide);
        document.addEventListener("visibilitychange", this.onVisibilityChange);
        window.addEventListener("error", this.onClientError);
        window.addEventListener("unhandledrejection", this.onUnhandledRejection);

        // See if job ID is set in the URL as the jobid query string.
        const search = new URLSearchParams(window.location.search);
        const jobId = search.get("jobId") || search.get("jobid");
        if (jobId) {
            this.appendLog("Querying for job...");
            this.jobId = jobId;
        }
    }

    disconnectedCallback(): void {
        this.reportDelivery("page-left");
        window.removeEventListener("offline", this.onOffline);
        window.removeEventListener("online", this.onOnline);
        window.removeEventListener("pagehide", this.onPageHide);
        document.removeEventListener("visibilitychange", this.onVisibilityChange);
        window.removeEventListener("error", this.onClientError);
        window.removeEventListener("unhandledrejection", this.onUnhandledRejection);
        super.disconnectedCallback();
    }

    private reportDelivery(...[event, details]: Parameters<PackageDeliveryDiagnostics["report"]>): void {
        const jobId = this.jobId || this.job?.id;
        if (!jobId) return;
        if (this.deliveryDiagnostics?.jobId !== jobId) {
            this.deliveryDiagnostics = new PackageDeliveryDiagnostics(jobId);
        }
        this.deliveryDiagnostics.report(event, { jobStatus: this.job?.status, ...details });
    }

    updated(changedProperties: PropertyValues<this>) {
        if (changedProperties.has("jobId") && this.jobId) {
            clearTimeout(this.jobTimeoutHandle);
            this.pollingTimedOut = false;
            this.reportDelivery("page-opened");
            const localJobId = this.jobId;
            setTimeout(() => this.pollJob(localJobId), this.pollIntervalMs);
            this.jobTimeoutHandle = window.setTimeout(() => this.jobTimedOut(), this.maxWaitTimeMs);
        }

        // If the logs changed, scroll to the bottom of the textarea to see the latest.
        if (changedProperties.has("logs")) {
            // Auto-scroll to the bottom of the logs.
            this.logsScrollToBottom();
        }
    }

    render(): TemplateResult {
        return html`
            <app-header page="report"></app-header>
            <div class="content">
                ${this.renderTitle()}
                <wa-card>
                    ${this.renderHeader()}
                    <div class="logs">
                        ${repeat(this.logs, l => this.renderLog(l))}
                    </div>
                    ${this.renderFooter()}
                </wa-card>
            </div>
        `;
    }

    renderTitle(): TemplateResult {
        if (this.hasDownloadFailed) {
            return html`
                <h2 class="page-title">
                    <wa-icon name="exclamation-octagon"></wa-icon>
                    Package created, but the download failed
                </h2>
            `;
        }

        if (this.hasFailed) {
            const failureTitle = this.hasForbiddenAnalysisFailure() ? "Your web host is blocking PWABuilder" : "Unable to create Google Play package";
            return html`
                <h2 class="page-title">
                    <wa-icon name="exclamation-octagon"></wa-icon>
                    ${failureTitle}
                </h2>
            `;
        }

        if (!this.job) {
            return html`
            <h2 class="page-title">
                <wa-spinner></wa-spinner>
                Checking Google Play package status...
            </h2>
            `;
        }

        if (this.job.status === "Queued") {
            return html`
                <h2 class="page-title">
                    <wa-spinner></wa-spinner> 
                    Waiting for agent to pick up job...
                </h2>
            `;
        }

        if (this.job.status === "Failed") {
            const failureTitle = this.hasForbiddenAnalysisFailure() ? "Your web host is blocking PWABuilder" : "Unable to create Google Play package";
            return html`
                <h2 class="page-title">
                    <wa-icon name="exclamation-octagon"></wa-icon>
                    ${failureTitle}
                </h2>
            `;
        }

        if (this.job.status === "Completed") {
            return html`
                <h2 class="page-title">
                    <wa-icon name="check-circle-fill"></wa-icon>
                    Package created successfully
                </h2>
            `;
        }

        return html`
            <h2 class="page-title">
                <wa-spinner></wa-spinner> 
                Creating your Google Play package...
            </h2>
        `;
    }

    renderHeader(): TemplateResult {
        if (!this.job) {
            return html``;
        }

        const queuedDate = new Date(this.job.createdAt);
        const formattedDate = queuedDate.toLocaleString();
        return html`
            <div class="pwa-header" slot="header">
                <div>
                    <h3 class="pwa-title">${this.job.name}</h3>
                    <p>${this.job.pwaUrl}</p>
                    <p>Queued for packaging at ${formattedDate}</p>
                </div>
            </div>
        `;
    }

    renderFooter(): TemplateResult {
        if (!this.job && !this.hasFailed) {
            return html``;
        }

        if (this.job?.status === "Failed" || this.hasFailed) {
            const title = encodeURIComponent("Error creating Google Play package");
            const reference = this.job?.supportReference || (this.jobId ? localStorage.getItem(`package-support:${this.jobId}`) : null);
            const body = encodeURIComponent(packageSupportIssueBody(reference));
            if (this.hasForbiddenAnalysisFailure()) {
                return html`
                    <div class="card-footer" slot="footer">
                        <wa-button @click="${this.retryJob}">Create a new package</wa-button>
                        <wa-button target="_blank" href="${this.forbiddenAnalysisHelpUrl}">Show me how to fix this</wa-button>
                    </div>
                `;
            }
            // The package was built successfully, so let the user retry just the download rather than rebuilding.
            const retryDownloadButton = this.hasDownloadFailed
                ? html`<wa-button variant="brand" ?loading="${this.isDownloading}" ?disabled="${this.isDownloading}" @click="${this.retryDownload}">Retry download</wa-button>`
                : html``;
            return html`
                <div class="card-footer" slot="footer">
                    ${retryDownloadButton}
                    <wa-button @click="${this.retryJob}">Create a new package</wa-button>
                    <wa-button target="_blank" href="https://github.com/pwa-builder/PWABuilder/issues/new?&labels=bug%20%3Abug%3A,android-platform&title=${title}&body=${body}">Report a bug</wa-button>
                </div>
            `;
        }

        return html``;
    }

    renderLog(log: string): TemplateResult {
        let logClass = "log";
        if (log.includes("[error]")) {
            logClass += " error";
        }
        if (log.includes("[warn]")) {
            logClass += " warn";
        }

        return html`<span class="${logClass}">${log}</span>`;
    }

    private async pollJob(jobId: string): Promise<void> {
        if (this.pollingTimedOut || this.jobId !== jobId) return;
        let job: GooglePlayPackageJob;
        try {
            job = await getGooglePlayPackageJob(jobId);
            if (this.pollingTimedOut || this.jobId !== jobId) return;
            this.pollQueryErrorCount = 0; // Reset on successful query
            this.job = job;
        } catch (error) {
            if (this.pollingTimedOut || this.jobId !== jobId) return;
            this.reportDelivery("poll-failed", packageFailureDetails(error));
            const configurationNetworkFailure = error instanceof PackageRequestError
                && error.phase === "configuration" && error.errorName === "TypeError";
            if (configurationNetworkFailure || this.pollQueryErrorCount < 1) {
                // Retry configuration fetch failures until the overall polling deadline.
                this.pollQueryErrorCount = 1;
                this.reportDelivery("poll-retry");
                setTimeout(() => this.pollJob(jobId), this.pollQueryRetryDelayMs);
            } else {
                this.pollJobFailed(error);
            }
            return;
        }

        if (this.lastReportedStatus !== job.status) {
            this.reportDelivery("status-changed", { jobStatus: job.status });
            this.lastReportedStatus = job.status;
        }
        this.ensureLogContains(job.logs);
        if (job.status === "Completed") {
            await this.jobCompleted(job);
        } else if (job.status === "Failed") {
            this.appendForbiddenAnalysisFailureLog();
            this.jobFailed(job);
        } else {
            // Otherwise, it's queued or processing. Poll again after a delay.
            setTimeout(() => this.pollJob(jobId), this.pollIntervalMs);
        }
    }

    private async jobCompleted(job: GooglePlayPackageJob): Promise<void> {
        this.recordPackagingCompleted(job.analysisId);
        clearTimeout(this.jobTimeoutHandle);
        await this.downloadPackage(job);
    }

    private async downloadPackage(job: GooglePlayPackageJob): Promise<void> {
        // Match the server's fixed access window from enqueue.
        const generatedDate = new Date(job.createdAt);
        const accessCutoff = new Date(Date.now() - 72 * 60 * 60 * 1000);
        if (generatedDate <= accessCutoff) {
            this.appendLog("Package access expires after 72 hours. Please create a new package.");
            return;
        }

        this.isDownloading = true;
        try {
            const blob = await this.downloadPackageZipWithRetry(job.id);
            this.downloadBlob(blob, job);
            // A synthetic anchor click confirms handoff only; browsers do not expose whether the user saved the file.
            this.reportDelivery("download-handoff", { bytes: blob.size, attempt: this.downloadAttempt });
            this.hasDownloadFailed = false;
            this.hasFailed = false;
            this.appendLog("Package created successfully. Download has begun.");
        } catch (downloadError) {
            if (!(downloadError instanceof PackageRequestError)) {
                this.reportDelivery("download-failed", { phase: "handoff", ...packageFailureDetails(downloadError) });
            }
            this.downloadFailed(job, downloadError);
        } finally {
            this.isDownloading = false;
        }
    }

    /**
     * Downloads the package zip, automatically retrying once after a short delay.
     * Transient network failures (e.g. "TypeError: Failed to fetch") can occur even though the package was built successfully.
     */
    private async downloadPackageZipWithRetry(jobId: string): Promise<Blob> {
        const download = async (): Promise<Blob> => {
            const attempt = ++this.downloadAttempt;
            const started = performance.now();
            this.reportDelivery("download-started", { attempt });
            try {
                const blob = await downloadGooglePlayPackageZip(jobId);
                this.reportDelivery("download-body-read", { attempt, bytes: blob.size, durationMs: Math.round(performance.now() - started) });
                return blob;
            } catch (error) {
                this.reportDelivery("download-failed", { attempt, ...packageFailureDetails(error), durationMs: Math.round(performance.now() - started) });
                throw error;
            }
        };
        try {
            return await download();
        } catch (firstError) {
            console.warn("Google Play package download failed. Retrying automatically.", firstError);
            this.appendLog(`Download failed (${firstError}). Retrying automatically...`);
            this.reportDelivery("download-retry", { attempt: this.downloadAttempt + 1 });
            await new Promise(resolve => setTimeout(resolve, this.autoDownloadRetryDelayMs));
            return await download();
        }
    }

    private async retryDownload(): Promise<void> {
        if (!this.job || this.isDownloading) {
            return;
        }

        this.appendLog("Retrying download...");
        this.reportDelivery("download-retry", { attempt: this.downloadAttempt + 1 });
        await this.downloadPackage(this.job);
    }

    private jobTimedOut(): void {
        this.pollingTimedOut = true;
        this.reportDelivery("poll-timeout");
        this.appendLog("[error] Timed out waiting for Google Play packaging job to complete.");
        this.hasFailed = true;
        this.recordPackagingFailed(this.job?.analysisId ?? null, "Timed out waiting for Google Play packaging job to complete.");
    }

    private pollJobFailed(error: unknown): void {
        this.reportDelivery("poll-stopped", packageFailureDetails(error));
        clearTimeout(this.jobTimeoutHandle);
        this.appendLog(`[error] ${error instanceof Error ? error.message : "Unable to query packaging status."}`);
        this.hasFailed = true;
        this.trackPackageFailure(error);
        this.recordPackagingFailed(this.job?.analysisId ?? null, error instanceof Error ? error : `${error}`);
    }

    private jobFailed(job: GooglePlayPackageJob): void {
        clearTimeout(this.jobTimeoutHandle);
        this.hasFailed = true;
        console.error("Google Play packaging job failed.", job.errors);
        this.trackPackageFailure(job.errors.join("\n"));
        this.recordPackagingFailed(job.analysisId, job.errors.join("\n"));
    }

    private downloadFailed(job: GooglePlayPackageJob, error: any): void {
        this.appendLog(`[error] Error downloading Google Play package: ${error}`);
        this.appendLog("Your package was created successfully. Click Retry download to try again. If the download keeps failing, check whether antivirus, a firewall, a proxy, or a browser extension is blocking ZIP downloads.");
        this.hasDownloadFailed = true;
        this.hasFailed = true;
        this.trackPackageFailure(error);
        this.recordPackagingFailed(job.analysisId, error instanceof Error ? error : `${error}`);
    }

    private recordPackagingCompleted(analysisId: string | null): void {
        if (!analysisId || this.hasRecordedCompletion) {
            return;
        }

        this.hasRecordedCompletion = true;
        packagingCompleted(analysisId, "GooglePlayStore").catch(error => {
            console.warn("Unable to record packaging completion.", error);
        });
    }

    private recordPackagingFailed(analysisId: string | null, error: string | Error): void {
        if (!analysisId || this.hasRecordedFailure) {
            return;
        }

        this.hasRecordedFailure = true;
        packagingFailed(analysisId, "GooglePlayStore", error).catch(requestError => {
            console.warn("Unable to record packaging failure.", requestError);
        });
    }

    private appendLog(message: string): void {
        this.logs = [...this.logs, message];
    }

    private ensureLogContains(logs: string[]): void {
        logs
            .filter(l => !this.logs.includes(l))
            .forEach(l => this.appendLog(l));
    }

    private downloadBlob(blob: Blob, job: GooglePlayPackageJob): void {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${job.name || "My PWA"} - Google Play package.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    private trackPackageFailure(error: unknown): void {
        recordProcessStep("analyze-and-package-pwa",
            `create-android-package-failed`,
            AnalyticsBehavior.CancelProcess,
            {
                url: this.job?.pwaUrl || "",
                error: error
            });
        recordProcessStep(
            "pwa-builder",
            `create-android-package-failed`,
            AnalyticsBehavior.CancelProcess,
            {
                url: this.job?.pwaUrl || "",
                error: error
            });
    }

    private logsScrollToBottom(): void {
        const logsElement = this.shadowRoot?.querySelector(".logs");
        if (logsElement) {
            logsElement.scrollTo({
                top: logsElement.scrollHeight,
                behavior: "smooth"
            });
        }
    }

    private hasForbiddenAnalysisFailure(): boolean {
        if (!(this.job?.status === "Failed" || this.hasFailed)) {
            return false;
        }

        return this.logs.some(log => log.includes(this.forbiddenAnalysisHelpUrl));
    }

    private appendForbiddenAnalysisFailureLog(): void {
        if (!this.hasForbiddenAnalysisFailure() || this.logs.some(log => log.includes(this.forbiddenAnalysisFailureMessage))) {
            return;
        }

        this.appendLog(`${new Date().toISOString()} [error]: ${this.forbiddenAnalysisFailureMessage}`);
    }

    private retryJob(): void {
        clearTimeout(this.jobTimeoutHandle);
        Router.go(this.job ? `/reportcard?site=${encodeURIComponent(this.job.pwaUrl)}` : "/");
    }
}