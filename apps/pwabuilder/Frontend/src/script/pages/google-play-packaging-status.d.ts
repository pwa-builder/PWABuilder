import { LitElement, PropertyValues, TemplateResult } from "lit";
import "../components/app-header";
import { GooglePlayPackageJob } from "../models/google-play-package-job";
import "@shoelace-style/shoelace/dist/components/textarea/textarea";
import "@shoelace-style/shoelace/dist/components/card/card";
import "@shoelace-style/shoelace/dist/components/button/button";
import "@shoelace-style/shoelace/dist/components/spinner/spinner";
import "@shoelace-style/shoelace/dist/components/icon/icon";
/**
 * A page that shows the status of a Google Play packaging job.
 */
export declare class GooglePlayPackagingStatus extends LitElement {
    jobId: string | null;
    hasFailed: boolean;
    logs: string[];
    job: GooglePlayPackageJob | null;
    isRetrying: boolean;
    private readonly pollIntervalMs;
    private readonly maxWaitTimeMs;
    private jobTimeoutHandle;
    static styles: import("lit").CSSResult[];
    connectedCallback(): void;
    updated(changedProperties: PropertyValues<this>): void;
    render(): TemplateResult;
    renderTitle(): TemplateResult;
    renderHeader(): TemplateResult;
    renderFooter(): TemplateResult;
    renderLog(log: string): TemplateResult;
    private pollJob;
    private jobCompleted;
    private jobTimedOut;
    private pollJobFailed;
    private jobFailed;
    private downloadFailed;
    private appendLog;
    private ensureLogContains;
    private downloadBlob;
    private trackPackageFailure;
    private logsScrollToBottom;
    private retryJob;
    private getErrorLogForGitHubIssue;
}
