/**
 * The visual style of a toast notification. "primary" is mapped to Web Awesome's
 * "brand" variant at render time.
 */
export type ToastVariant = "primary" | "success" | "neutral" | "warning" | "danger";

/**
 * The name of the window event dispatched by showToast and listened to by the
 * host (app-index) that renders toasts.
 */
export const SHOW_TOAST_EVENT_NAME = "show-toast";

/**
 * Describes a single toast notification. Passed as the detail of the
 * "show-toast" window event and consumed by the <toast-alert> component.
 */
export interface ToastEvent {
    /** The title of the toast, shown in bold. If empty, no title is shown. */
    title: string;
    /**
     * The details of the toast. If an Error is supplied, its message and stack
     * trace are rendered. If empty, no details are shown.
     */
    details: string | Error;
    /** The visual variant of the toast. */
    variant: ToastVariant;
    /** An icon name to show in the toast, or null/empty for no icon. */
    icon: string | null;
    /**
     * Whether the toast auto-dismisses after the default duration, visualized
     * by the countdown progress ring. When falsy (false, null, or undefined),
     * the toast stays visible until the user closes it.
     */
    countdown?: boolean | null;
    /**
     * The text of an optional hyperlink rendered after the body. Only shown when
     * both hyperlinkText and hyperlinkUrl are supplied.
     */
    hyperlinkText?: string | null;
    /**
     * The URL of an optional hyperlink rendered after the body. Only shown when
     * both hyperlinkText and hyperlinkUrl are supplied.
     */
    hyperlinkUrl?: string | null;
}

declare global {
    interface WindowEventMap {
        /** Fired by showToast to request that a new toast be displayed. */
        [SHOW_TOAST_EVENT_NAME]: CustomEvent<ToastEvent>;
    }
}
