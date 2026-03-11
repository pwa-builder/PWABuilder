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
export declare function showToast(title: string, details: string, variant: "primary" | "success" | "neutral" | "warning" | "danger", icon: string | null, duration?: number, countdown?: "rtl" | "ltr" | "none"): Promise<HTMLElement>;
export declare function showDrawer(): Promise<void>;
