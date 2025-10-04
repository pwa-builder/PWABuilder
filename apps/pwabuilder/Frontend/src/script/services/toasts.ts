
/**
 * Shows a closable toast notification in the browser.
 * @param title The title of the toast, shown in bold. If empty, not title will be shown.
 * @param details The details of the toast, shown in plain text. If empty, no details will be shown.
 * @param variant The variant of toast to show.
 * @param icon An icon name to show in the toast. If null or empty, no icon will be shown.
 * @param duration A duration specifying how long the toast will be shown before automatically dismissing. Use 0 to prevent the toast from automatically dismissing.
 * @param countdown A countdown UI direction. A progress bar will be shown either counting down from right to left ("rtl") or left to right ("ltr"), indicating the automatic dismissal. Use "none" to hide the progress bar.
 * @returns The toast HTML element.
 */
export async function showToast(title: string, details: string, variant: "primary" | "success" | "neutral" | "warning" | "danger", icon: string | null, duration: number = 5000, countdown: "rtl" | "ltr" | "none" = "rtl"): Promise<HTMLElement> {
    await import('@shoelace-style/shoelace/dist/components/alert/alert.js');
    await import('@shoelace-style/shoelace/dist/components/icon/icon.js');

    const toast = document.createElement("sl-alert");
    toast.setAttribute("variant", variant);
    if (duration > 0) {
        toast.setAttribute("duration", duration.toString());
    }
    if (countdown !== "none") {
        toast.setAttribute("countdown", countdown);
    }

    let body = '';
    if (icon) {
        body += `<sl-icon slot='icon' name="${icon}"></sl-icon>`;
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

    toast.innerHTML = body;
    (toast as any).toast();
    return toast;
}

export async function showDrawer(): Promise<void> {

} 