import { css } from 'lit';

export const manifestInfoFormStyles = css`
    :host {
        --sl-focus-ring-width: 3px;
        --sl-input-focus-ring-color: #4f3fb670;
        --sl-focus-ring: 0 0 0 var(--sl-focus-ring-width)
            var(--sl-input-focus-ring-color);
        --sl-input-border-color-focus: #4f3fb6ac;
        --sl-input-font-family: Hind, sans-serif;
    }

    sl-input::part(base),
    sl-textarea::part(base),
    sl-option::part(base),
    sl-color-picker::part(base),
    sl-button::part(base) {
        --sl-input-font-size-medium: 16px;
        --sl-font-size-medium: 16px;
        --sl-input-height-medium: 3em;
        --sl-button-font-size-medium: 16px;
    }
    sl-input::part(base),
    sl-textarea::part(base) {
        background-color: #fbfbfb;
    }
    #form-holder {
        display: flex;
        flex-direction: column;
        row-gap: 1em;
    }
    .form-row {
        display: flex;
        column-gap: 1em;
    }
    .form-row h3 {
        font-size: 18px;
        margin: 0;
    }
    .field-desc {
        white-space: no-wrap;
        font-size: 14px;
        margin: 0;
        color: #717171;
    }

    .long .form-field {
        width: 100%;
    }
    .form-field {
        width: 50%;
        row-gap: 0.25em;
        display: flex;
        flex-direction: column;
    }
    .form-field p {
        font-size: 14px;
    }
    .field-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        column-gap: 5px;
    }

    .header-left {
        display: flex;
        align-items: center;
        column-gap: 10px;
    }

    .color_field {
        display: flex;
        flex-direction: column;
    }
    .color-holder {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .toolTip {
        font-size: 14px;
        visibility: hidden;
        width: 150px;
        background: black;
        color: white;
        font-weight: 500;
        text-align: center;
        border-radius: 6px;
        padding: 0.75em;
        /* Position the tooltip */
        position: absolute;
        top: 20px;
        left: -25px;
        z-index: 1;
        box-shadow: 0px 2px 20px 0px #0000006c;
    }
    .field-header a {
        display: flex;
        align-items: center;
        position: relative;
        color: black;
    }
    a:hover .toolTip {
        visibility: visible;
    }
    a:visited,
    a:focus {
        color: black;
    }
    .color-section {
        display: flex;
        gap: 0.5em;
        align-items: center;
        justify-content: flex-start;
    }

    .color-section p {
        font-size: 18px;
        color: #717171;
        display: flex;
        align-items: center;
        height: fit-content;
        margin: 0;
    }

    sl-color-picker {
        --grid-width: 315px;
        height: 25px;
    }

    sl-color-picker::part(trigger) {
        border-radius: 0;
        height: 25px;
        width: 75px;
        display: flex;
    }
    sl-menu {
        width: 100%;
    }

    sl-option:focus-within::part(base) {
        color: #ffffff;
        background-color: #4f3fb6;
    }

    sl-option::part(base):hover {
        color: #ffffff;
        background-color: #4f3fb6;
    }

    .error-color-field {
        border: 1px solid #eb5757 !important;
    }

    .error::part(base) {
        border-color: #eb5757;
        --sl-input-focus-ring-color: #eb575770;
        --sl-focus-ring-width: 3px;
        --sl-focus-ring: 0 0 0 var(--sl-focus-ring-width)
            var(--sl-input-focus-ring-color);
        --sl-input-border-color-focus: #eb5757ac;
    }

    .error::part(control) {
        border-color: #eb5757;
    }

    sl-input::part(input),
    sl-textarea::part(textarea) {
        color: #717171;
    }

    .focus {
        color: #4f3fb6;
    }

    @media (max-width: 765px) {
        .form-row:not(.color-row) {
            flex-direction: column;
            row-gap: 1em;
        }
        .form-row:not(.color-row) .form-field {
            width: 100%;
        }
    }

    @media (max-width: 480px) {
        sl-input::part(base),
        sl-option::part(base) {
            --sl-input-font-size-medium: 14px;
            --sl-font-size-medium: 14px;
            --sl-input-height-medium: 2.5em;
        }

        .form-row p {
            font-size: 12px;
        }

        .form-row h3 {
            font-size: 16px;
        }

        .color-row {
            gap: 1em;
            flex-direction: column;
        }

        .color-row .form-field {
            width: 100%;
        }
        .field-header a:after {
            content: '';
            position: absolute;
            left: -13px;
            top: -13px;
            z-index: -1;
            width: 40px;
            height: 40px;
            border-radius: 7px;
        }
    }
`;
