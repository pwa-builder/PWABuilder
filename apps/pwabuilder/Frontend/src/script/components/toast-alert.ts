import { LitElement, html, nothing, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { ToastEvent, ToastVariant } from '../models/toast-event';
import { toastAlertStyles } from './toast-alert.styles';
import '@awesome.me/webawesome/dist/components/callout/callout.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';
import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/progress-ring/progress-ring.js";

/** Auto-dismiss duration, in milliseconds, used when a countdown is enabled. */
const DEFAULT_DURATION = 10000;

/**
 * Maps a toast variant to its Web Awesome color group. "primary" uses the
 * "brand" palette; every other variant shares its name with the palette. The
 * resolved group is used to build the accent color (e.g. --wa-color-danger-50)
 * applied to the left border and countdown ring.
 */
function variantColorGroup(variant: ToastVariant): string {
    return variant === "primary" ? "brand" : variant;
}

/**
 * Renders a single closable toast notification as a <wa-callout>. Handles its
 * own auto-dismiss countdown (resetting while hovered) and fades out before
 * emitting a "toast-dismiss" event so the host can remove it from the DOM.
 *
 * The countdown is visualized as a <wa-progress-ring> wrapped around the close
 * button, so the remaining time depletes the ring around the X. When the
 * toast's countdown is falsy the toast stays until the user closes it.
 */
@customElement('toast-alert')
export class ToastAlert extends LitElement {

    static styles = [toastAlertStyles];

    /** The toast to display. */
    @property({ attribute: false }) toast!: ToastEvent;

    /**
     * Current countdown progress ring value (0-100). Reactive so the ring
     * re-renders automatically as the countdown ticks. Starts full.
     */
    @state() private countdownValue = 100;

    /** Total auto-dismiss duration, in ms. Resolved once in firstUpdated. */
    private duration = 0;

    /** Handle for the pending auto-dismiss timeout. */
    private dismissTimer = 0;

    /** Handle for the countdown ring's requestAnimationFrame loop. */
    private rafId = 0;

    /** Remaining time, in ms, before auto-dismissal (survives hover resets). */
    private remaining = 0;

    /** Timestamp of the most recent timer (re)start, used to compute elapsed time. */
    private resumedAt = 0;

    /** Whether an auto-dismiss countdown ring should be shown and animated. */
    private get showCountdown(): boolean {
        return this.duration > 0;
    }

    /** @inheritdoc */
    firstUpdated(): void {
        this.duration = this.toast.countdown ? DEFAULT_DURATION : 0;
        if (this.duration <= 0) {
            return;
        }

        this.remaining = this.duration;
        this.startTimer();
    }

    /** @inheritdoc */
    disconnectedCallback(): void {
        super.disconnectedCallback();
        window.clearTimeout(this.dismissTimer);
        cancelAnimationFrame(this.rafId);
    }

    /** Renders the toast content. */
    render(): TemplateResult {
        const toast = this.toast;
        const showCountdown = !!toast.countdown;

        // Rather than tint the whole callout with the variant color (which made
        // the body text hard to read for "danger" etc.), we keep the callout
        // neutral and expose the variant color only as an accent used for the
        // left border and the countdown ring.
        const accent = `var(--wa-color-${variantColorGroup(toast.variant)}-50)`;

        // The close button doubles as the countdown indicator: when a countdown
        // is active it's wrapped in a progress ring whose value tracks the
        // remaining time, depleting from full as the toast ages.
        const closeButton = html`
            <wa-button appearance="plain" type="button" class="close" @click=${() => this.dismiss()}>
                <wa-icon name="x-lg" aria-label="Close"></wa-icon>
            </wa-button>
        `;

        return html`
            <wa-callout
                class="toast"
                variant="neutral"
                role="status"
                style=${styleMap({ "--toast-accent": accent })}
                @mouseenter=${() => this.pauseTimer()}
                @mouseleave=${() => this.resumeTimer()}>
                <div class="header">
                    ${toast.icon ? html`<wa-icon class="header-icon" name=${toast.icon}></wa-icon>` : nothing}
                    ${toast.title ? html`<strong class="title">${toast.title}</strong>` : nothing}
                    ${showCountdown
                        ? html`<wa-progress-ring class="close-ring" value=${this.countdownValue}>${closeButton}</wa-progress-ring>`
                        : closeButton}
                </div>
                ${this.renderBody()}
                ${this.renderFooter()}
            </wa-callout>
        `;
    }

    /**
     * Builds the details shown below the header. Returns nothing when there are
     * no details so the toast collapses to just the header (and footer).
     */
    private renderBody(): TemplateResult | typeof nothing {
        const { details } = this.toast;

        if (!details) {
            return nothing;
        }

        return html`<div class="body">${this.renderDetails(details)}</div>`;
    }

    /**
     * Builds the right-aligned footer containing the optional hyperlink button.
     * Returns nothing when there's no hyperlink.
     */
    private renderFooter(): TemplateResult | typeof nothing {
        const toast = this.toast;

        if (!toast.hyperlinkText || !toast.hyperlinkUrl) {
            return nothing;
        }

        return html`
            <div class="footer">
                <wa-button class="link" appearance="accent" size="xs" href=${toast.hyperlinkUrl} target="_blank" rel="noopener">${toast.hyperlinkText}</wa-button>
            </div>
        `;
    }

    /**
     * Renders the details. Errors are shown as preformatted text so the stack
     * trace keeps its line breaks; Lit escapes the interpolated text for us.
     */
    private renderDetails(details: string | Error): TemplateResult | typeof nothing {
        if (!details) {
            return nothing;
        }

        if (details instanceof Error) {
            // V8 stacks already start with the message, so only prepend the
            // message when the stack is missing or doesn't already include it.
            const stack = details.stack ?? '';
            const errorText = stack.includes(details.message)
                ? stack
                : [details.message, stack].filter(Boolean).join('\n\n');
            return html`<pre class="error">${errorText}</pre>`;
        }

        return html`${details}`;
    }

    /** Fades the toast out, then asks the host to remove it. */
    private dismiss(): void {
        window.clearTimeout(this.dismissTimer);
        this.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" })
            .finished.then(() => {
                this.dispatchEvent(new CustomEvent("toast-dismiss", { bubbles: true, composed: true }));
            });
    }

    /** Starts (or restarts) the auto-dismiss countdown from the remaining time. */
    private startTimer(): void {
        this.resumedAt = Date.now();
        this.dismissTimer = window.setTimeout(() => this.dismiss(), this.remaining);
        if (this.showCountdown) {
            this.rafId = requestAnimationFrame(() => this.updateCountdownRing());
        }
    }

    /**
     * Pauses and resets the countdown while the pointer is over the toast, so
     * it won't auto-dismiss out from under the user. The ring is restored to
     * full; the timer resumes from the full duration on mouse leave.
     */
    private pauseTimer(): void {
        window.clearTimeout(this.dismissTimer);
        cancelAnimationFrame(this.rafId);
        this.remaining = this.duration;
        this.countdownValue = 100;
    }

    /** Resumes the countdown from the full duration when the pointer leaves. */
    private resumeTimer(): void {
        if (this.showCountdown) {
            this.startTimer();
        }
    }

    /**
     * Drives the progress ring each frame to reflect the remaining time. The
     * ring depletes from full as the toast ages; the loop stops once the
     * countdown reaches zero (the dismiss timeout handles removal).
     */
    private updateCountdownRing(): void {
        const elapsed = Date.now() - this.resumedAt;
        const currentRemaining = Math.max(0, this.remaining - elapsed);
        const remainingFraction = this.duration > 0 ? currentRemaining / this.duration : 0;
        this.countdownValue = remainingFraction * 100;

        if (currentRemaining > 0) {
            this.rafId = requestAnimationFrame(() => this.updateCountdownRing());
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "toast-alert": ToastAlert;
    }
}
