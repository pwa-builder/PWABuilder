import { html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from 'lit/decorators.js';
import "../components/app-header";
import { downloadGooglePlayPackageZip, enqueueGooglePlayPackageJob, getGooglePlayPackageJob } from "../services/publish/android-publish";
import { GooglePlayPackageJob } from "../models/GooglePlayPackageJob";
import { env } from "../utils/environment";
import "@shoelace-style/shoelace/dist/components/textarea/textarea";
import { googlePlayPackagingStatusStyles } from "./google-play-packaging-status.styles";
import { AnalyticsBehavior, recordProcessStep } from "@pwabuilder/site-analytics";
import { repeat } from "lit/directives/repeat.js";
import "@shoelace-style/shoelace/dist/components/card/card";
import "@shoelace-style/shoelace/dist/components/button/button";
import { Router } from "@vaadin/router";
import "@shoelace-style/shoelace/dist/components/spinner/spinner";
import "@shoelace-style/shoelace/dist/components/icon/icon";

/**
 * A page that shows the status of a Google Play packaging job.
 */
@customElement("google-play-packaging-status")
export class GooglePlayPackagingStatus extends LitElement {
    @property({ attribute: "job-id" }) jobId: string | null = null;
    @state() hasFailed = false;
    @state() logs: string[] = [];
    @state() job: GooglePlayPackageJob | null = null;
    @state() isRetrying = false;
    private readonly pollIntervalMs = 3000; // Poll the job every 3 seconds
    private readonly maxWaitTimeMs = 15 * 60 * 1000; // Max wait time of 15 minutes
    private jobTimeoutHandle = 0;

    static styles = [googlePlayPackagingStatusStyles];

    connectedCallback(): void {
        super.connectedCallback();

        // See if job ID is set in the URL as the jobid query string.
        const search = new URLSearchParams(window.location.search.toLowerCase());
        const jobId = search.get("jobid");
        if (jobId) {
            this.appendLog("Querying for job...");
            this.jobId = jobId;
        }
    }

    updated(changedProperties: PropertyValues<this>) {
        if (changedProperties.has("jobId") && this.jobId) {
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
                <sl-card>
                    ${this.renderHeader()}
                    <div class="logs">
                        ${repeat(this.logs, l => this.renderLog(l))}
                    </div>
                    ${this.renderFooter()}
                </sl-card>
            </div>
        `;
    }

    renderTitle(): TemplateResult {
        if (!this.job) {
            return html`
            <h2 class="page-title">
                <sl-spinner></sl-spinner>
                Checking Google Play package status...
            </h2>
            `;
        }

        if (this.job.status === "Queued") {
            return html`
                <h2 class="page-title">
                    <sl-spinner></sl-spinner> 
                    Waiting for agent to pick up job...
                </h2>
            `;
        }

        if (this.job.status === "Failed") {
            return html`
                <h2 class="page-title">
                    <sl-icon name="exclamation-octagon"></sl-icon>
                    Unable to create Google Play package
                </h2>
            `;
        }

        if (this.job.status === "Completed") {
            return html`
                <h2 class="page-title">
                    <sl-icon name="check-circle-fill"></sl-icon>
                    Package created successfully
                </h2>
            `;
        }

        return html`
            <h2 class="page-title">
                <sl-spinner></sl-spinner> 
                Creating your Google Play package...
            </h2>
        `;
    }

    renderHeader(): TemplateResult {
        if (!this.job?.packageOptions) {
            return html``;
        }

        const queuedDate = new Date(this.job.createdAt);
        const formattedDate = queuedDate.toLocaleString();
        return html`
            <div class="pwa-header" slot="header">
                <img class="pwa-icon" src="${this.job.packageOptions.iconUrl}" alt="PWA Icon" />
                <div>
                    <h3 class="pwa-title">${this.job.packageOptions.name}</h3>
                    <p><a href="${this.job.packageOptions.webManifestUrl}">${this.job.packageOptions.webManifestUrl}</a></p>
                    <p>Queued for packaging at ${formattedDate}</p>
                </div>
            </div>
        `;
    }

    renderFooter(): TemplateResult {
        if (!this.job) {
            return html``;
        }

        if (this.job.status === "Failed") {
            const title = encodeURIComponent("Error creating Google Play package");
            const errorLogs = this.logs.filter(l => l.includes("[error]"));
            const lastErrorLog = ([...errorLogs].reverse()[0] || [...this.logs].reverse()[0] || "No longs available").replaceAll("\n", "\n> ");
            const body = encodeURIComponent(`I received the [following error](https://pwabuilder.com/google-play-packaging-status?jobId=${this.job.id}) when creating a Google Play package for ${this.job.packageOptions.pwaUrl}.\n\n> ${lastErrorLog}`);
            return html`
                <div class="card-footer" slot="footer">
                    <sl-button @click="${this.retryJob}">Retry</sl-button>
                    <sl-button target="_blank" href="https://github.com/pwa-builder/PWABuilder/issues/new?title=${title}&body=${body}&labels=bug%20%3Abug%3A,android-platform">Report a bug</sl-button>
                </div>
            `;
        }

        return html``;
    }

    renderLog(log: string): TemplateResult {
        if (log.includes("[error]")) {
            return html`<span class="log error">${log}</span>`;
        }
        return html`<span class="log">${log}</span>`;
    }

    private async pollJob(jobId: string): Promise<void> {
        let job: GooglePlayPackageJob;
        try {
            job = await getGooglePlayPackageJob(jobId);
            this.job = job;
        } catch (error) {
            this.pollJobFailed(jobId, error);
            return;
        }

        this.ensureLogContains(job.logs);
        if (job.status === "Completed") {
            await this.jobCompleted(job);
        } else if (job.status === "Failed") {
            this.jobFailed(job);
        } else {
            // Otherwise, it's queued or processing. Poll again after a delay.
            setTimeout(() => this.pollJob(jobId), this.pollIntervalMs);
        }
    }

    private async jobCompleted(job: GooglePlayPackageJob): Promise<void> {
        // If the package was generated more than 24 hours ago, skip download because we're looking at a historical job result.
        const generatedDate = new Date(job.createdAt);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        if (generatedDate < oneDayAgo) {
            this.appendLog(`Package was generated over 24 hours ago. Skipping download of package zip file. Old packages are automatically deleted after a period of time, but you may try downloading manually from ${env.androidPackageGeneratorUrl}//downloadPackageZip?id=${job.id}`);
            clearTimeout(this.jobTimeoutHandle);
            return;
        }

        let blob: Blob;
        try {
            blob = await downloadGooglePlayPackageZip(job.id);
            clearTimeout(this.jobTimeoutHandle);
            this.downloadBlob(blob, job);
            this.appendLog("Package created successfully. Download has begun.");
        } catch (downloadError) {
            this.downloadFailed(job, downloadError);
        }
    }

    private jobTimedOut(): void {
        this.appendLog("Timed out waiting for Google Play packaging job to complete.");
        this.hasFailed = true;
    }

    private pollJobFailed(jobId: string, error: unknown): void {
        this.appendLog(`Error when querying for Google Play packaging job ${jobId}.`);
        this.hasFailed = true;
        this.trackPackageFailure(error);
    }

    private jobFailed(job: GooglePlayPackageJob): void {
        this.hasFailed = true;
        console.error("Google Play packaging job failed.", job.errors);
        this.trackPackageFailure(job.errors.join("\n"));
    }

    private downloadFailed(job: GooglePlayPackageJob, error: any): void {
        const downloadUrl = `${env.androidPackageGeneratorUrl}/downloadPackageZip?id=${encodeURIComponent(job.id)}`;
        this.appendLog(`Error download Google Play package from ${downloadUrl} for job ${job.id}: ${error}`);
        this.hasFailed = true;
        this.trackPackageFailure(error);
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
        a.download = `${job.packageOptions.launcherName || job.packageOptions.name || "My PWA"} - Google Play package.zip`;
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
                url: this.job?.packageOptions?.pwaUrl || "",
                error: error
            });
        recordProcessStep(
            "pwa-builder",
            `create-android-package-failed`,
            AnalyticsBehavior.CancelProcess,
            {
                url: this.job?.packageOptions?.pwaUrl || "",
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

    private async retryJob(): Promise<void> {
        if (!this.job?.packageOptions) {
            console.error("Can't retry job because the job or its package options are missing.");
            return;
        }

        this.isRetrying = true;
        try {
            const newJobId = await enqueueGooglePlayPackageJob(this.job.packageOptions);
            Router.go(`/google-play-packaging-status?jobId=${newJobId}`);
        } catch (error) {
            this.appendLog("Error retrying job: " + error);
        }
    }
}