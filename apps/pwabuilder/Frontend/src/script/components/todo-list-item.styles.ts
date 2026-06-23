import { css } from "lit";

export const todoListItemStyles = css`
    :host {
        display: block;
        width: 100%;
        font-size: 16px;
    }

    sl-details::part(header) {
        padding: var(--sl-spacing-x-small);
        background-color: #f1f1f1;
    }

    sl-details::part(header):focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
    }

    .summary {
        display: flex;
        align-items: center;
        gap: var(--sl-spacing-x-small);
        font-family: var(--body-font);
    }

    .status-icon {
        height: 16px;
        width: 16px;
        margin-top: -2px;
    }

    .error {
        white-space: pre-line;
    }

    .footer {
        display: flex;
        gap: var(--sl-spacing-medium);

        sl-button::part(label) {
            padding: 0;
        }
    }
`;