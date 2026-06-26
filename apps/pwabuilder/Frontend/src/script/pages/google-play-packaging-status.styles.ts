import { css } from "lit";

export const googlePlayPackagingStatusStyles = css`
    :host {
        display: block;
        background-image: url("/assets/new/Hero1920_withmani.webp");
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center top;

        @media (max-width: 535px) {
            background-position-y: 70px;
        }
    }

    .page-title {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 0 6px;

        wa-icon[name="check-circle-fill"] {
            color: var(--wa-color-success-50);
        }

        wa-icon[name="exclamation-octagon"] {
            color: var(--wa-color-danger-50);
        }   
    }

    .content {
        max-width: 1300px;
        margin-left: auto;
        margin-right: auto;
        margin-top: 100px;
        padding: 16px;

        @media (max-width: 535px) {
            padding: 0;
        }
    }

    wa-card {
        width: 100%;
    }

    .card-footer {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 16px;
    }

    .pwa-header {
        display: flex;
        align-items: center;
        gap: 16px;
        overflow: clip;

        .pwa-icon {
            max-width: 92px;
            max-height: 92px;
            height: auto;
        }

        .pwa-title {
            margin: 0;
        }

        p {
            margin: 0;
            color: var(--wa-color-neutral-40);
            font-size: 0.8em;

            @media (max-width: 535px) {
                display: block;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 200px;
            }
        }
    }

    .logs {
        display: flex;
        flex-direction: column;
        gap: 4px;
        background-color: var(--wa-color-neutral-90);
        max-height: 400px;
        height: 400px;
        overflow: auto;
        padding: 16px;

        .log {
            display: block;
            padding: 4px;
            color: rgb(31, 35, 40);
            font-size: 0.8em;
            font-family: monospace;

            &:hover {
                background-color: var(--wa-color-neutral-80);
            }

            &.warn {
                color: var(--wa-color-warning-50);
            }

            &.error {
                color: var(--wa-color-danger-50);
            }
        }
    }
`;