import '@awesome.me/webawesome/dist/components/callout/callout.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';



/**
 * Returns the fixed-position container that stacks toast notifications in the
 * top-right corner, creating it on first use. Replaces Shoelace's built-in toast
 * stack, which moved to Web Awesome Pro.
 */
let toastStack: HTMLElement | null = null;
function getToastStack(): HTMLElement {
    if (toastStack && document.body.contains(toastStack)) {
        return toastStack;
    }
    toastStack = document.createElement('div');
    Object.assign(toastStack.style, {
        position: 'fixed',
        top: '1rem',
        insetInlineEnd: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        zIndex: '1000',
        maxWidth: 'min(28rem, calc(100vw - 2rem))',
        pointerEvents: 'none',
    });
    document.body.appendChild(toastStack);
    return toastStack;
}

/**
 * Shows a closable toast notification in the browser.
 * @param title The title of the toast, shown in bold. If empty, not title will be shown.
 * @param details The details of the toast, shown in plain text. If empty, no details will be shown.
 * @param variant The variant of toast to show.
 * @param icon An icon name to show in the toast. If null or empty, no icon will be shown.
 * @param duration A duration specifying how long the toast will be shown before automatically dismissing. Use 0 to prevent the toast from automatically dismissing.
 * @param countdown A countdown UI direction. A progress bar will be shown either counting down from right to left ("rtl") or left to right ("ltr"), indicating the automatic dismissal. Use "none" to hide the progress bar.
 * @param hyperlinkText The text of an optional hyperlink rendered after the body. Only shown when both hyperlinkText and hyperlinkUrl are supplied.
 * @param hyperlinkUrl The URL of an optional hyperlink rendered after the body. Only shown when both hyperlinkText and hyperlinkUrl are supplied.
 * @returns The toast HTML element.
 */
export async function showToast(title: string, details: string, variant: "primary" | "success" | "neutral" | "warning" | "danger", icon: string | null, duration: number = 10000, countdown: "rtl" | "ltr" | "none" = "rtl", hyperlinkText: string | null = null, hyperlinkUrl: string | null = null): Promise<HTMLElement> {
    // Web Awesome renders inline alerts with <wa-callout>; "primary" became "brand".
    const waVariant = variant === "primary" ? "brand" : variant;

    const toast = document.createElement("wa-callout");
    toast.setAttribute("variant", waVariant);
    toast.setAttribute("role", "status");
    Object.assign(toast.style, {
        position: "relative",
        overflow: "hidden",
        pointerEvents: "auto",
        boxShadow: "var(--wa-shadow-m, 0 2px 8px rgba(0, 0, 0, 0.2))",
    });

    let body = '';
    if (icon) {
        body += `<wa-icon slot='icon' name="${icon}"></wa-icon>`;
    }
    if (title) {
        body += `<strong>${title}</strong>`;
        if (details) {
            body += '<br>';
        }
    }
    if (details) {
        body += details;
    }
    if (hyperlinkText && hyperlinkUrl) {
        body += `<br><a href="${hyperlinkUrl}" target="_blank" rel="noopener">${hyperlinkText}</a>`;
    }

    toast.innerHTML = body;
    getToastStack().appendChild(toast);

    const dismiss = () => {
        toast.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" })
            .finished.then(() => toast.remove());
    };

    if (duration > 0) {
        let barAnimation: Animation | null = null;
        if (countdown !== "none") {
            const bar = document.createElement("div");
            Object.assign(bar.style, {
                position: "absolute",
                bottom: "0",
                insetInlineStart: "0",
                height: "3px",
                width: "100%",
                background: "currentColor",
                opacity: "0.4",
                transformOrigin: countdown === "rtl" ? "right" : "left",
            });
            toast.appendChild(bar);
            barAnimation = bar.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }], { duration, fill: "forwards" });
        }

        // Track the remaining time so hovering can pause the countdown: the user
        // shouldn't lose a toast while they're still reading it.
        let dismissTimer = 0;
        let remaining = duration;
        let resumedAt = Date.now();

        const startTimer = () => {
            resumedAt = Date.now();
            dismissTimer = window.setTimeout(dismiss, remaining);
        };

        const pauseTimer = () => {
            window.clearTimeout(dismissTimer);
            remaining -= Date.now() - resumedAt;
            barAnimation?.pause();
        };

        const resumeTimer = () => {
            if (remaining > 0) {
                barAnimation?.play();
                startTimer();
            }
        };

        toast.addEventListener("mouseenter", pauseTimer);
        toast.addEventListener("mouseleave", resumeTimer);
        startTimer();
    }

    return toast;
}