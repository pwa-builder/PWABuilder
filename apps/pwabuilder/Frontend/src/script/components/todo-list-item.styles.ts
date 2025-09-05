import { css } from "lit";

export const todoListItemStyles = css`
    :host {
        display: block;
        width: 100%;
    }

    .iwrapper {
        display: flex;
        column-gap: .5em;
        align-items: center;
        justify-content: space-between;
        font-size: 16px;
        background-color: #f1f1f1;
        border-radius: var(--card-border-radius);
        padding: .5em;
        margin-bottom: 10px;
        border: 1px solid transparent;
    }

    .clickable:hover {
    cursor: pointer;
        border: 1px solid #CBCDEB;
    }

    .active:hover {
    cursor: pointer;
        border: 1px solid #CBCDEB;
    }

    .iwrapper img {
        height: 16px;
    }

    .left, .right {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .left {
        gap: .5em;
    }

    .left p {
        margin: 0;
        vertical-align: middle;
        line-height: 16px;
        padding-top: 3px;
    }

    .arrow_link {
        margin: 0;
        border-bottom: 1px solid var(--primary-color);
        white-space: nowrap;
    }

    .arrow_anchor {
        font-size: var(--arrow-link-font-size);
        font-weight: bold;
        margin: 0px 0.5em 0px 0px;
        line-height: 1em;
        color: var(--primary-color);
        display: flex;
        column-gap: 10px;
        width: fit-content;
    }

    .arrow_anchor:visited {
        color: var(--primary-color);
    }

    .arrow_anchor:hover {
        cursor: pointer;
    }

    .arrow_anchor:hover img {
        animation: bounce 1s;
    }

    @keyframes bounce {
        0%,
        20%,
        50%,
        80%,
        100% {
            transform: translateY(0);
        }
        40% {
            transform: translateX(-5px);
        }
        60% {
            transform: translateX(5px);
        }
    }

    .arrow {
        width: 16px;
    }

    .right {
        background-color: transparent;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .right:hover {
        cursor: pointer;
    }
`;