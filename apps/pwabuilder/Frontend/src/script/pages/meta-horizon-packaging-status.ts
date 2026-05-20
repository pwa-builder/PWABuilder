import { html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from 'lit/decorators.js';
import "../components/app-header";
import {
    downloadMetaHorizonPackageZip,
    enqueueMetaHorizonPackageJob,
    getMetaHorizonPackageJob,
} from "../services/publish/meta-horizon-publish";
import { MetaHorizonPackageJob } from "../models/meta-horizon-package-job";
import { env } from "../utils/environment";
import "@shoelace-style/shoelace/dist/components/textarea/textarea";
import { metaHorizonPackagingStatusStyles } from "./meta-horizon-packaging-status.styles";
import { AnalyticsBehavior, recordProcessStep } from "@pwabuilder/site-analytics";
import { repeat } from "lit/directives/repeat.js";
import "@shoelace-style/shoelace/dist/components/card/card";
import "@shoelace-style/shoelace/dist/components/button/button";
import { Router } from "@vaadin/router";
import "@shoelace-style/shoelace/dist/components/spinner/spinner";
import "@shoelace-style/shoelace/dist/components/icon/icon";

/**
 * A page that shows the status of a Meta Horizon packaging job.
 */
@customElement("meta-horizon-packaging-status")
export class MetaHorizonPackagingStatus extends LitElement {
    @property({ attribute: "job-id" }) jobId: string | null = null;
    @state() hasFailed = false;
    @state() logs: string[] = [];
    @state() job: MetaHorizonPackageJob | null = null;
    @state() isRetrying = false;
    private readonly pollIntervalMs = 3000;
    private readonly maxWaitTimeMs = 15 * 60 * 1000;
    private jobTimeoutHandle = 0;

    static styles = [metaHorizonPackagingStatusStyles];

    connectedCallback(): void {
        super.connectedCallback();

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

        if (changedProperties.has("logs")) {
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
        if (this.hasFailed) {
            return html`
                <h2 class="page-title">
                    <sl-icon name="exclamation-octagon"></sl-icon>
                    Unable to create Meta Horizon package
                </h2>
            `;
        }

        if (!this.job) {
            return html`
            <h2 class="page-title">
                <sl-spinner></sl-spinner>
                Checking Meta Horizon package status...
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
                    Unable to create Meta Horizon package
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
                Creating your Meta Horizon package...
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
        if (!this.job && !this.hasFailed) {
            return html``;
        }

        if (this.job?.status === "Failed" || this.hasFailed) {
            const title = encodeURIComponent("Error creating Meta Horizon package");
            const lastErrorLog = this.getErrorLogForGitHubIssue(this.logs).replaceAll("\n", "\n> ");
            const body = encodeURIComponent(`I received the [following error](https://pwabuilder.com/meta-horizon-packaging-status?jobId=${this.job?.id || this.jobId}) when creating a Meta Horizon package for ${this.job?.packageOptions.pwaUrl || "[empty]"}.\n\n> ${lastErrorLog}`);
            return html`
                <div class="card-footer" slot="footer">
                    <sl-button @click="${this.retryJob}">Retry</sl-button>
                    <sl-button target="_blank" href="https://github.com/pwa-builder/PWABuilder/issues/new?&labels=bug%20%3Abug%3A,meta-horizon-platform&title=${title}&body=${body}">Report a bug</sl-button>
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
        let job: MetaHorizonPackageJob;
        try {
            job = await getMetaHorizonPackageJob(jobId);
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
            setTimeout(() => this.pollJob(jobId), this.pollIntervalMs);
        }
    }

    private async jobCompleted(job: MetaHorizonPackageJob): Promise<void> {
        const generatedDate = new Date(job.createdAt);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        if (generatedDate < oneDayAgo) {
            this.appendLog(`Package was generated over 24 hours ago. Skipping download of package zip file. Old packages are automatically deleted after a period of time, but you may try downloading manually from ${env.metaHorizonPackageGeneratorUrl}/downloadPackageZip?id=${job.id}`);
            clearTimeout(this.jobTimeoutHandle);
            return;
        }

        let blob: Blob;
        try {
            blob = await downloadMetaHorizonPackageZip(job.id);
            clearTimeout(this.jobTimeoutHandle);
            this.downloadBlob(blob, job);
            this.appendLog("Package created successfully. Download has begun.");
        } catch (downloadError) {
            this.downloadFailed(job, downloadError);
        }
    }

    private jobTimedOut(): void {
        this.appendLog("[error] Timed out waiting for Meta Horizon packaging job to complete.");
        this.hasFailed = true;
    }

    private pollJobFailed(jobId: string, error: unknown): void {
        this.appendLog(`[error] Error when querying for Meta Horizon packaging job ${jobId}.`);
        this.hasFailed = true;
        this.trackPackageFailure(error);
    }

    private jobFailed(job: MetaHorizonPackageJob): void {
        this.hasFailed = true;
        console.error("Meta Horizon packaging job failed.", job.errors);
        this.trackPackageFailure(job.errors.join("\n"));
    }

    private downloadFailed(job: MetaHorizonPackageJob, error: any): void {
        const downloadUrl = `${env.metaHorizonPackageGeneratorUrl}/downloadPackageZip?id=${encodeURIComponent(job.id)}`;
        this.appendLog(`Error downloading Meta Horizon package from ${downloadUrl} for job ${job.id}: ${error}`);
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

    private downloadBlob(blob: Blob, job: MetaHorizonPackageJob): void {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${job.packageOptions.launcherName || job.packageOptions.name || "My PWA"} - Meta Horizon package.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    private trackPackageFailure(error: unknown): void {
        recordProcessStep("analyze-and-package-pwa",
            `create-meta-horizon-package-failed`,
            AnalyticsBehavior.CancelProcess,
            {
                url: this.job?.packageOptions?.pwaUrl || "",
                error: error
            });
        recordProcessStep(
            "pwa-builder",
            `create-meta-horizon-package-failed`,
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
            const newJobId = await enqueueMetaHorizonPackageJob(this.job.packageOptions);
            Router.go(`/meta-horizon-packaging-status?jobId=${newJobId}`);
        } catch (error) {
            this.appendLog("Error retrying job: " + error);
        }
    }

    private getErrorLogForGitHubIssue(logs: string[]): string {
        const logsReversed = [...logs].reverse();
        const errorLogs = logsReversed.filter(l => l.includes("[error]"));
        const logWithStack = errorLogs.find(l => l.includes("\n"));
        return logWithStack || errorLogs[0] || "No logs available";
    }
}
