import { SHOW_TOAST_EVENT_NAME, ToastEvent } from '../models/toast-event';

/**
 * Requests that a toast notification be shown by dispatching a "show-toast"
 * event on the window. The host (app-index) listens for this event and renders
 * the toast via the <toast-alert> component, so callers don't need a reference
 * to any DOM node.
 * @param toast The toast to display.
 */
export function showToast(toast: ToastEvent): void {
    window.dispatchEvent(new CustomEvent<ToastEvent>(SHOW_TOAST_EVENT_NAME, { detail: toast }));
}
