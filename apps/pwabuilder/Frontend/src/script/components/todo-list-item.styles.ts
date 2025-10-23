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

    .footer {
        display: flex;
        gap: var(--sl-spacing-medium);

        sl-button::part(label) {
            padding: 0;
        }
    }
`;