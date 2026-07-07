import { css } from 'lit';

/**
 * Styles for the <toast-alert> component: the callout container, scrollable
 * body, error text, close button, and the countdown progress ring.
 */
export const toastAlertStyles = css`
        :host {
            display: block;
            pointer-events: auto;
        }

        .toast {
            position: relative;
            overflow: hidden;
            display: block;
            box-shadow: var(--wa-shadow-m, 0 2px 8px rgba(0, 0, 0, 0.2));
            /* The callout stays neutral; the variant color shows only as the
               left accent border so the body keeps the default text color. */
            border-inline-start: 4px solid var(--toast-accent, var(--wa-color-neutral-border, currentColor));
        }

        /* Header row: icon, title, and close button share a single line. */
        .header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem;
        }

        .header-icon {
            flex: 0 0 auto;
            /* Match the accent border so the icon reinforces the variant color. */
            color: var(--toast-accent, currentColor);
        }

        /* Title takes the remaining space, pushing the close button to the end. */
        .title {
            flex: 1 1 auto;
            min-width: 0;
        }

        /* Scrollable body wrapper; caps height so long messages scroll. */
        .body {
            max-height: 300px;
            overflow-y: auto;
            padding: 0 0.5rem 0.5rem;
        }

        .error {
            margin: 0;
            white-space: pre-wrap;
            word-break: break-word;
            font-size: 0.85em;
        }

        /* Right-aligned footer holding the optional hyperlink button. */
        .footer {
            display: flex;
            justify-content: flex-end;
            margin-top: 0.5rem;
            padding: 0 0.5rem 0.5rem;
        }

        /* Close button sits at the end of the header row. The auto start margin
           keeps it right-aligned even when there's no title; the negative
           margins pull it snug into the corner. */
        .close {
            flex: 0 0 auto;
            margin: -0.25rem -0.25rem -0.25rem auto;
        }

        /* When a countdown is active, the close button is wrapped in a progress
           ring whose value reflects the remaining time. The ring becomes the
           right-aligned header item, and the button is centered within it. */
        .close-ring {
            flex: 0 0 auto;
            margin-inline-start: auto;
            --size: 2rem;
            --track-width: 2px;
            --indicator-width: 2px;
            /* Match the accent color: a strong indicator over a faint track. */
            --indicator-color: var(--toast-accent, var(--wa-color-brand-50));
            --track-color: color-mix(in oklab, var(--toast-accent, var(--wa-color-brand-50)) 20%, transparent);
        }

        .close-ring .close {
            margin: 0;
        }

        /* Shrink the button so it (and its hover background) fits inside the
           ring's hole instead of overlapping and hiding the ring. wa-button
           sizes itself via ::part(base), so override that rather than the host. */
        .close-ring .close::part(base) {
            width: 1.5rem;
            height: 1.5rem;
            min-height: 0;
            padding: 0;
            border-radius: 50%;
            font-size: 0.8rem;
        }
    `;
