import { css } from "lit";
import { mediumBreakPoint, smallBreakPoint } from "../utils/css/breakpoints";
export const appReportStyles = css`
/* Page wide */
* {
    box-sizing: border-box;
    font-family: inherit;
}

:host {
    --sl-focus-ring-width: 3px;
    --sl-input-focus-ring-color: #4f3fb670;
    --sl-focus-ring: 0 0 0 var(--sl-focus-ring-width) var(--sl-input-focus-ring-color);
    --sl-input-border-color-focus: #4F3FB6ac;
    --sl-input-font-family: Hind, sans-serif;
}

app-header::part(header) {
    position: sticky;
    top: 0;
}

#report-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    row-gap: 1.5em;
    align-items: center;
    background-color: #f2f3fb;
    padding: 20px;
}

#content-holder {
    max-width: 1300px;
    width: 100%;
    display: flex;
    flex-flow: row wrap;
    gap: 1em;
}

sl-details {
    width: 100%;
}

sl-details::part(header){
    padding: 5px 20px;
}

sl-details:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}

sl-details::part(header):focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}

sl-details::part(summary):focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}

sl-details::part(summary-icon){
    display: none;
}

sl-details::part(content) {
    padding-top: .75em;
    padding-bottom: 1.5em;
}

sl-details:disabled{
    cursor: no-drop;
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

button:hover {
    cursor: pointer;
}

sl-progress-ring {
    height: fit-content;
    --track-width: 4px;
    --indicator-width: 8px;
    --size: 85px;
    font-size: var(--subheader-font-size);
    position: relative;
}

sl-progress-ring::part(label){
    color: var(--primary-color);
    font-weight: bold;
    font-size: 18px;
}

sl-progress-ring::part(base) {
    border-radius: 50%;
}

.red {
    --indicator-color: var(--error-color);
}

.red::before {
    content: '';
    position: absolute;
    border-radius: 50%;
    top: calc(var(--indicator-width) / 2);
    left: calc(var(--indicator-width) / 2);
    width: calc(var(--size) - var(--indicator-width));
    height: calc(var(--size) - var(--indicator-width));
    background-color: #FFF3F3;
}

.yellow {
    --indicator-color: var(--warning-color);
}

.yellow::before {
    content: '';
    position: absolute;
    border-radius: 50%;
    top: calc(var(--indicator-width) / 2);
    left: calc(var(--indicator-width) / 2);
    width: calc(var(--size) - var(--indicator-width));
    height: calc(var(--size) - var(--indicator-width));
    background-color: #FFFAED;
}

.green {
    --indicator-color: var(--success-color);
}

.green::before {
    content: '';
    position: absolute;
    border-radius: 50%;
    top: calc(var(--indicator-width) / 2);
    left: calc(var(--indicator-width) / 2);
    width: calc(var(--size) - var(--indicator-width));
    height: calc(var(--size) - var(--indicator-width));
    background-color: #E3FFF2;
}

.counterRing {
    --indicator-color: #8976FF;
}

.counterRing::before {
    content: '';
    position: absolute;
    border-radius: 50%;
    top: calc(var(--indicator-width) / 2);
    left: calc(var(--indicator-width) / 2);
    width: calc(var(--size) - var(--indicator-width));
    height: calc(var(--size) - var(--indicator-width));
    background-color: #F1F3FF;
}

.macro_error {
    width: 3em;
    height: auto;
}

/* App Card and Packaging */
#header-row {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: 1em;
}

/* App Card */

#app-card {
    width: 60%;
    height: 100%;
    border-radius: var(--card-border-radius);
    background-color: #ffffff;
    justify-content: space-between;
    box-shadow: 0px 4px 30px 0px #00000014;

    container: card / inline-size;
}

#app-card-header {
    display: grid;
    grid-template-rows: auto;
    gap: 10px;
    align-items: center;
    padding: 2em 2em 0;
    width: 100%;
}

#app-card-header.skeleton{
    grid-template-columns: 0fr 1fr;
    grid-template-rows: 1fr 0fr;
}

#app-card-header, #app-card-footer{
    font-size: 14px;
}

#app-card-header-col {
    display: grid;
    grid-template-columns: 1fr 4fr 1fr;
    gap: 15px;
}

#pwa-image-holder {
    height: fit-content;
    width: fit-content;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #ffffff;
    box-shadow: rgb(0 0 0 / 20%) 0px 4px 10px 0px;
    border-radius: 4px;
}

/* #app-image-skeleton {
    height: 85px;
    width: 85px;
    padding: 10px;
} */

#pwa-image-holder img{
    height: 115.05px;
    width: 115.05px;
    left: 113px;
    top: 118.951171875px;
    border-radius: 4px;
}

#app-card-share-cta {
    display: flex;
    height: 100%;
    flex-direction: column;
    justify-content: start;
}

#app-card-share-cta #share-button-desktop {
    height: 32px;
    width: 117.5439453125px;
    left: 509.4560546875px;
    top: 116.7421875px;
    border-radius: 20px;
    text-align: center;
    font-size: 12px;
}

#share-icon {
    height: 14px;
    width: 14.78px;
    left: 526.8994140625px;
    top: 125.322265625px;
    border-radius: 0px;

}

.proxy-loader {
    width: 48px;
    height: 48px;
    border: 5px solid var(--primary-color);
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

#site-name {
    margin: 0;
    font-weight: bold;
    font-size: calc(var(--subheader-font-size) + 4px);

    text-overflow: ellipsis;
    overflow: hidden;

}

#site-name, #site-url{
    /* 115 is app icon size, 117 is share button, 4em is padding, 30px is gap */
    max-width: calc(((100cqi - 115px) - 117px) - 4em - 30px);
}

#card-info {
    //overflow: hidden;
    white-space: nowrap;
    height: 100%;
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 5px;
}

#card-info p {
    margin: 0;
}

.visually-hidden {
    font-size: 0;
}

#site-url {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    /* max-width: 200px; */
    font-weight: bold;
    font-size: 16px;
}

#app-card-desc {
    overflow-y:hidden;
    text-overflow:ellipsis;
    font-size: 14px;
    font-weight: 500;
    line-height: 18px;
    white-space: break-spaces;
}
#app-card-desc-mobile {
    display: none;
}

#app-card-footer {
    padding: 0em 2em;
    min-height: 41px;
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: flex-end;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    border-top: 1px solid rgb(242 243 251 / 20%);
}

#last-edited {
    white-space: nowrap;
    margin: 0;
}

#test, #last-edited {
    font-size: 12px;
    line-height: 18px;
}


#test.in-progress{
    color: #767676;

    align-items: center;
    display: flex;
    gap: 10px;
    line-height: 10px;
}

#test img {
    height: 18px;
}

#retest {
    display: flex;
    align-items: center;
    column-gap: 10px;
    border: none;
    background-color: transparent;
}

#retest:disabled{
    cursor: no-drop;
}

#app-image-skeleton {
    height: 115px;
    width: 115px;
    --border-radius: 4px;
}

.app-info-skeleton {
    width: 100%;
    margin-bottom: 10px;
}

.app-info-skeleton-half {
    width: 25%;
    height: 20px;
    margin: 10px 0;
}

.d-none {
    display: none !important;
}

sl-spinner {
    vertical-align: middle;
}

/* Packaging Box */
#app-actions {
    width: 40%;
    height: 100%;
    border-radius: var(--card-border-radius);
    background-color: #ffffff;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0px 4px 30px 0px #00000014;
}

#package {
    row-gap: .5em;
    width: 100%;
    padding: 2em;
}

#pfs, #pfs-disabled { // pfs + disabled
    white-space: nowrap;
    padding: var(--button-padding);
    border-radius: var(--button-border-radius);
    font-size: var(--button-font-size);
    font-weight: var(--font-bold);
    border: 1px solid transparent;
    color: #ffffff;
    white-space: nowrap;
}

#test-download:disabled {
    cursor: no-drop;
    color: #757575;
}

#test-download:disabled .arrow_link {
    border-color: #757575;
}

#pfs {
    background-color: var(--font-color);
}

#pfs-disabled{
    background-color: #C3C3C3;
}

#pfs-disabled:hover{
    cursor: no-drop;
}

#pfs:focus, #pfs:hover {
    box-shadow: var(--button-box-shadow);
    border: 1px solid #ffffff;
    outline: 2px solid #000000;
    background-color: rgba(0, 0, 0, 0.75);
}

.feedback-holder {
    display: flex;
    gap: .5em;
    padding: .5em;
    border-radius: 3px;
    width: 100%;
    word-break: break-word;
}

.type-error {
    align-items: flex-start;
    background-color: #FAEDF1;
    border-left: 4px solid var(--error-color);
}

.type-warning {
    align-items: flex-start;
    background-color: var(--warning-accent-color);
    border-left: 4px solid var(--warning-color);
}

.feedback-holder p {
    margin: 0;
    font-size: 14px;
}

.feedback-holder img {
    margin-top: 3px;
}

.error-title {
    font-weight: bold;
}

.error-actions {
    display: flex;
    align-items: center;
    gap: 1em;
    margin-top: .25em;
}

.error-actions > * {
    all: unset;
    color: var(--font-color);
    font-weight: bold;
    font-size: 14px;
    border-bottom: 1px solid transparent;
}

.error-actions > *:hover {
    cursor: pointer;
    border-bottom: 1px solid var(--font-color);
}

.error-desc {
    max-height: 175px;
    overflow-y: auto;
    line-height: normal;
}

#share-card {
    width: 100%;
    background: #ffffff;
    border-radius: 10px;

    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 22px;
    position: relative;
}

#share-card-mani{
    position: absolute;
    left: 10px;
    bottom: 0;
    height: 85px;
}

#share-card-content{
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

#share-card-text {
    font-size: var(--subheader-font-size);
    color: var(--primary-color);
    font-weight: bold;
    margin-left: 115px;
}

#share-card-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
}

.share-banner-buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 5px;
    padding: 10px 20px;
    background: transparent;
    color: var(--primary-color);
    font-size: var(--button-font-size);
    font-weight: bold;
    border: 1px solid var(--primary-color);
    border-radius: var(--button-border-radius);
    white-space: nowrap;
}
.share-banner-buttons:hover {
    box-shadow: var(--button-box-shadow)
}

#share-button:disabled {
    color: #C3C3C3;
    border-color: #C3C3C3;
}

#share-button:disabled:hover {
    cursor: no-drop;
    box-shadow: none;
}

.banner-button-icons {
    width: 20px;
    height: auto;
}
#share-card-text {
    font-size: var(--subheader-font-size);
    color: var(--primary-color);
    font-weight: bold;
    margin-left: 115px;
}

#share-card-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
}

.share-banner-buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 5px;
    padding: 10px 20px;
    background: transparent;
    color: var(--primary-color);
    font-size: var(--button-font-size);
    font-weight: bold;
    border: 1px solid var(--primary-color);
    border-radius: var(--button-border-radius);
    white-space: nowrap;
}
.share-banner-buttons:hover {
    box-shadow: var(--button-box-shadow)
}

#share-button-desktop:disabled, #share-button-mobile:disabled {
    color: #C3C3C3;
    border-color: #C3C3C3;
}

#share-button-desktop:disabled:hover, #share-button-mobile:disabled:hover {
    cursor: no-drop;
    box-shadow: none;
}

.banner-button-icons {
    width: 20px;
    height: auto;
}



.mani-tooltip {
    --sl-tooltip-padding: 0;
}

.mani-tooltip::part(body){
    background-color: #ffffff;
}

.mani-tooltip::part(base__arrow){
    background-color: #ffffff;
    z-index: 10;
}

.mani-tooltip-content {
    padding: 0;
    display: flex;
    max-width: 325px;
    align-items: center;
    justify-content: center;
    border-radius: var(--card-border-radius);
    gap: .5em;
    background-color: #ffffff;
    color: var(--font-color);
    box-shadow: rgb(0 0 0 / 15%) 0px 0px 40px;
}

.mani-tooltip-content img {
    align-self: flex-end;
    justify-self: flex-end;
    height: 50px;
    width: auto;
}

.mani-tooltip-p {
    margin: 0;
    padding: .5em;
    font-size: 14px;
}

#cl-mani-tooltip-content {
    padding: 5px 10px;
    font-size: 10px;
}

#test-download {
    background-color: transparent;
    color: var(--primary-color);
    border: none;
    width: fit-content;
    display: flex;
    column-gap: 0.5em;
    align-items: center;

    font-weight: bold;
    white-space: nowrap;
    font-size: var(--arrow-link-font-size);
}

#test-download:hover img {
    animation: bounce 1s;
}

#actions-footer {
    background-color: #ffffff;
    width: 100%;
    column-gap: 0.75em;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    padding: .5em 1em;
    border-top: 1px solid #E5E5E5;
}

#actions-footer img {
    height: 15px;
    width: auto;
}

#actions-footer p {
    margin: 0;
    font-size: 12px;
    font-weight: bold;
}

.todo-items-holder {
    max-height: 185px;
    overflow-y: auto;
    scrollbar-width: thin;
}

/* Action Items Card */
#todo {
    width: 100%;
    box-shadow: 0px 4px 30px 0px #00000014;
    border-radius: var(--card-border-radius);
    padding: 20px;
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
    width: 100%;
}

#todo-detail {
    border-radius: var(--card-border-radius);
    border: none;
    display: flex;
    flex-direction: column;
    width: 100%;
}

.action-item-filter-btns {
    img {
        width: 16px;
        height: 16px;
    }

    sl-button::part(label) {
        font-size: 0.8em;
    }

    sl-menu-item::part(label),
    sl-badge { 
        font-size: 0.6em;
    }
}

.details-summary {
    height: 60px;
    color: var(--primary-color);
    font-size: 20px;
    font-weight: bold;
    height: fit-content;
}

#todo-summary {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}

#todo-summary-left {
    display: flex;
    align-items: center;
    gap: 25px;
}

#todo-summary-left > h2 {
    font-size: var(--subheader-font-size);
    margin: 0;
}

#todo-indicators {
    display: flex;
    align-items: center;
}

#pagination-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-top: 10px;
    gap: .25em;
}

.pageToggles {
    height: 15px;
    color: var(--primary-color);
}

#dots {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: .25em;
}

#dots img {
    height: 10px;
    width: auto;
}

#pagination-actions > sl-icon:hover{
    cursor:pointer
}

.pagination-buttons{
    background-color: transparent;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    height: fit-content;
}

#pageStatus {
    font-size: 0;
    color: transparent;
    margin: 0;
}

#indicators-holder {
    display: flex;
    gap: .5em;
    align-items: center;
}

.indicator {
    display: flex;
    gap: 10px;
    align-items: center;
    background-color: #f1f1f1;
    padding: 5px 10px;
    border-radius: 6px;
    border: none;
}

.indicator span {
    line-height: 20px;
    margin: 0;
    font-size: 20px;
    color: var(--primary-color);
    font-weight: bold;
}

.indicator:focus {
    outline: 2px solid var(--primary-color);
}

.indicator.selected {
    background-color: #8c76fc67;
}

.indicator.selected:focus {
    outline: 2px solid #000000;
}

.indicator.selected span {
    color: #ffffff;
}

.indicator img {
    width: 16px;
    height: auto;
}

/* Manifest Card */
#manifest {
    box-shadow: 0px 4px 30px 0px #00000014;
    background-color: #ffffff;
    border-radius: var(--card-border-radius);
    width: 100%;
}

#manifest-header {
    display: grid;
    grid-template-columns: 10fr 2fr 1fr;
    gap: 1em;
    border-bottom: 1px solid #c4c4c4;
    padding: 1em;
}

#mh-content{
    display: flex;
    gap: 1em;
    justify-content: space-between;
    width: 100%;
}

#mh-text {
    row-gap: 0.5em;
    width: 100%;
}

#mh-right {
    display: flex;
    column-gap: 2.5em;
    grid-area: 1/3;
    height: fit-content;
}

#mh-actions {
    row-gap: 1em;
    align-items: center;
}

#manifest-detail-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1em;
}

.missing {
    font-size: 14px;
    margin: 0;
    font-weight: bold;
    white-space: no-wrap;
}

/* S cards */
#two-cell-row {
    display: flex;
    flex-flow: row wrap;
    align-items: flex-start;
    justify-content: space-between;
    width: 100%;
}

#two-cell-row > * {
    width: 49%;
    height: 100%;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-self: flex-start;
    border-radius: var(--card-border-radius);
}

/* SW Card */
#sw-header {
    row-gap: 0.5em;
    height: 100%;
    padding: 1em;
    min-height: 318px;
}

#swh-top {
    display: flex;
    justify-content: space-between;
    column-gap: 1em;
}

#swh-text {
    width: 100%;
    row-gap: 0.5em;
}

#sw-actions {
    row-gap: 1em;
    width: fit-content;
    align-items: flex-start;
    margin-top: auto;
}

#sw-header arrow-link {
    margin: 0;
    margin-top: auto;
}

/* Sec Card */

/* Classes used widely */
.flex-col {
    display: flex;
    flex-direction: column;
    position: relative;
}

.flex-col-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
}

.details-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}

.dropdown_icon {
    transform: rotate(0deg);
    transition: transform .5s;
}

.card-header {
    font-size: calc(var(--subheader-font-size) + 4px);
    font-weight: bold;
    margin: 0;
    white-space: nowrap;
}

.card-desc {
    margin: 0;
    font-size: var(--card-body-font-size);
}

#test-download p {
    line-height: 1em;
}

arrow-link {
    margin-top: 20px;
    margin-bottom: 10px;
}

.arrow_link {
    margin: 0;
    border-bottom: 1px solid var(--primary-color);
    white-space: nowrap;
}

.arrow_anchor {
    text-decoration: none;
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

#report-wrapper .alternate {
    background: var(--secondary-color);
    color: var(--primary-color);
    border: 1px solid var(--primary-color);
    font-size: var(--button-font-size);
    font-weight: bold;
    padding: var(--button-padding);
    border-radius: var(--button-border-radius);
    white-space: nowrap;
    display: flex;
    align-items: center;
    justify-content: center;
}
#report-wrapper .alternate:hover {
    box-shadow: var(--button-box-shadow)
}

#report-wrapper .alternate:disabled {
    color: #C3C3C3;
    border-color: #C3C3C3;
}

#report-wrapper .alternate:disabled:hover {
    cursor: no-drop;
    box-shadow: none;
}

.detail-list {
    display: flex;
    flex-direction: column;
    row-gap: 18px;
}

.detail-list-header {
    font-size: 18px;
    margin: 0;
    font-weight: bold;
}

.detail-list p:not(.detail-list-header){
    margin: 0;
}

.details::part(base) {
    border-radius: 0;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    border: none;
}
.details::part(summary) {
    font-weight: bold;
    font-size: var(--card-body-font-size);
}
.details::part(header) {
    height: 40px;
    padding: 5px 20px;
}

.detail-grid {
    display: flex;
    flex-direction: column;
    row-gap: 0.5em;
}

#sec-header {
    row-gap: .5em;
    padding: 1em;
    min-height: 318px;
    height: 100%;
}
#sec-top {
    display: flex;
    column-gap: 1em;
    justify-content: space-between;
}
#sec-text {
    width: 100%;
    row-gap: 0.5em;
}
#sec-actions {
    row-gap: 1em;
    width: 66%;
    margin-top: auto;
}
#sec-header arrow-link {
    margin: 0;
    margin-top: auto;
}

.icons-holder {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(2, 1fr);
    place-content: center;
    gap: 25px;
}

.icons-holder.sw {
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(1, 1fr);
}

.icon-and-name {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.circle-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border-radius: 50%;
    position: relative;
    border: 2px solid transparent
}

.circle-icon-img {
    height: 60px;
    width: 60px;
    width: auto;
}

.icon-and-name p {
    color: var(--font-color);
    font-size: 12px;
    margin: 0;
    text-align: center;
}

.circle-icon:hover {
    cursor: pointer;
    border: 2px solid #8976FF;
}

.in-progress-marker {
    position: absolute;
    bottom: 0;
    right: 0;
    font-size: 0.7em;
}

.valid-marker {
    height: 13px;
    width: 13px;
    position: absolute;
    bottom: 0;
    right: 0;
}

.progressRingSkeleton::part(base) {
    height: 100px;
    width: 100px;
    border-radius: 50%;
}

.test-result {
    display: flex;
    gap: .5em;
    align-items: center;
}
.test-result p {
    font-weight: normal;
    font-size: 14px;
}
.test-result img {
    height: 17px;
}
.summary-skeleton {
    width: 200px;
    --color: #d0d0d3
}
.desc-skeleton {
    --color: #d0d0d3
}
.desc-skeleton.half {
    width: 50%;
}
.desc-skeleton::part(base), .summary-skeleton::part(base), .app-info-skeleton::part(base){
    min-height: .8rem;
}
.app-info-skeleton-half::part(base){
    min-height: .8rem;
    max-height: .8rem;
}
.gap {
    gap: .5em;
}
sl-tooltip::part(base){
    --sl-tooltip-font-size: 14px;
}

.app-capabilities-links {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;

    @media (max-width: 576px) {
        flex-direction: column;
        row-gap: 12px;
    }
}

.animate{
    animation-delay: 1s;
    animation: shake 1s cubic-bezier(.36,.07,.19,.97) both;
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    perspective: 1000px;
}

@keyframes shake {
    10%, 90% {
    transform: translate3d(-1px, 0, 0);
    }

    20%, 80% {
    transform: translate3d(2px, 0, 0);
    }

    30%, 50%, 70% {
    transform: translate3d(-4px, 0, 0);
    }

    40%, 60% {
    transform: translate3d(4px, 0, 0);
    }
}

.dialog::part(body){
    padding-top: 0;
    padding-bottom: 0;
}
.dialog::part(title){
    display: none;
}
.dialog::part(panel) {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 65%;
    position: relative;
}
.dialog::part(overlay){
    backdrop-filter: blur(10px);
}
.dialog::part(close-button__base){
    position: absolute;
    top: 5px;
    right: 5px;
}

/* Retest modal */
#confirmationButtons {
    display: flex;
    justify-content: space-evenly;
    margin-bottom: 1em;
}

#confirmationButtons > *{
    width: 45%;
}

.loader {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: block;
    margin:15px auto;
    position: relative;
    color: var(--primary-color);
    box-sizing: border-box;
    animation: animloader 2s linear infinite;
    grid-row: 3;
}

@keyframes animloader {
    0% {
    box-shadow: 14px 0 0 -2px,  38px 0 0 -2px,  -14px 0 0 -2px,  -38px 0 0 -2px;
    }
    25% {
    box-shadow: 14px 0 0 -2px,  38px 0 0 -2px,  -14px 0 0 -2px,  -38px 0 0 2px;
    }
    50% {
    box-shadow: 14px 0 0 -2px,  38px 0 0 -2px,  -14px 0 0 2px,  -38px 0 0 -2px;
    }
    75% {
    box-shadow: 14px 0 0 2px,  38px 0 0 -2px,  -14px 0 0 -2px,  -38px 0 0 -2px;
    }
    100% {
    box-shadow: 14px 0 0 -2px,  38px 0 0 2px,  -14px 0 0 -2px,  -38px 0 0 -2px;
    }
}

.loader-round {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    position: relative;
    flex-shrink: 0;
    animation: rotate 1s linear infinite
}
.loader-round::before {
    content: "";
    box-sizing: border-box;
    position: absolute;
    inset: 0px;
    border-radius: 50%;
    border: 2px solid #D6D6D6;
    /* animation: prixClipFix 2s linear infinite, 2s ease-in-out 0.5s infinite normal none running pulse; */
    clip-path:polygon(50% 50%,0 0,100% 0,100% 100%,0 100%,0 50%)
}

.loader-round.large{
    width: 96px;
    height: 96px;
    margin: 2px;
}
.loader-round.large::before{
    border-width: 4px;
    animation: 2s ease-in-out 0.5s infinite normal none running pulse;
}

.loader-round.skeleton{
    animation: none;
    /* clip-path: none; */
}
.loader-round.skeleton::before{
    /* animation: 2s ease-in-out 0.5s infinite normal none running pulse; */
    clip-path: none;
}

@keyframes rotate {
    100%   {transform: rotate(360deg)}
}

@keyframes pulse {
    0% {
    opacity: 1;
    }
    50% {
    opacity: 0.4;
    }
    100% {
    opacity: 1;
    }
}

/* @keyframes prixClipFix {
    0%   {clip-path:polygon(50% 50%,0 0,0 0,0 0,0 0,15% 0)}
    25%  {clip-path:polygon(50% 50%,0 0,100% 0,100% 0,100% 0,100% 0)}
    50%  {clip-path:polygon(50% 50%,0 0,100% 0,100% 100%,100% 100%,100% 100%)}
    75%  {clip-path:polygon(50% 50%,0 0,100% 0,100% 100%,0 100%,0 100%)}
    100% {clip-path:polygon(50% 50%,0 0,100% 0,100% 100%,0 100%,0 25%)}
} */

@media(max-width: 900px){
    #header-row {
    flex-direction: column-reverse;
    row-gap: 1em;
    }

    #app-card{
    width: 100%;
    }
    #app-actions {
    width: 100%;
    }

    #two-cell-row {
    flex-direction: column;
    row-gap: 1em;
    }
    #two-cell-row > * {
    width: 100%;
    height: unset;
    }
    #sw-header {
    min-height: unset;
    }
    #sec-header {
    min-height: unset;
    }
    #manifest-header {
    grid-template-columns: 4fr 4fr 1fr;
    grid-template-rows: min-content 1fr;
    }
    #mh-content {
    grid-area: 1 / 1 / 2 / 3;
    }
    #mh-actions {
    align-items: unset;
    }
    #sw-actions {
    width: 42%
    }
    #sw-actions button {
    width: 100%;
    }
}

/* @media(max-width: 700px){
    --button-padding
} */
@media(max-width: 376px){
    #pwa-image-holder {
    width: 61px !important;
    }
    #pwa-image-holder img {
    width: 55px !important;
    }
}


@media(max-width: 600px){
    #app-card-header-col {
    gap: 10px;
    }
    #pwa-image-holder {
    width: 90px;
    height: auto;
    }
    #pwa-image-holder img {
    width: 84px;
    height: auto;
    }
    #card-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    }
    #app-card-desc {
    max-width: 100%;
    }
    #share-button-desktop {
    display: none;
    }
    #share-button-mobile {
    display: flex;
    }
    #app-card-desc-mobile {
    display: flex;
    flex-direction: column;
    }
    .app-card-desc-desktop {
    display: none;
    }
    #site-name {
    font-size: 20px;
    }
    #site-url {
    margin-bottom: 8px !important;
    }

    #site-name, #site-url{
    /* 84 is app icon size, 4em is padding, 20px is gap */
    max-width: calc((100cqi - 84px) - 4em - 20px);
}

    #app-card-share-cta {
    justify-content: start;
    }
    #app-card-share-cta #share-button-mobile {
    width: 100px;
    }
    #app-card-desc, .skeleton-desc {
    grid-column: 1 / 3;
    }

    #sw-actions {
    width: 100%;
    }
    #sw-actions button {
    margin-top: 20px;
    width: 100%;
    }

    #mh-actions {
    grid-area: 2/1/3/4;
    }
    #mh-actions button {
    width: 100%;
    }
}

${mediumBreakPoint(css`
    #mh-content {
    flex-direction: column;
    }

    #mh-text {
    width: 100%;
    }

    #manifest-detail-grid{
    display: flex;
    flex-direction: column;
    }

    sl-progress-ring {
    --size: 75px;
    --track-width: 4px;
    --subheader-font-size: 14px;
    }
    .progressRingSkeleton::part(base), .loader-round.large  {
    width: 75px;
    height: 75px;
    }

    #share-card {
    flex-direction: column-reverse;
    }

    #share-card-content {
    flex-direction: column-reverse;
    }

    #share-card-text {
    margin-left: 0;
    margin-bottom: 0;
    text-align: center;
    }

    #share-card-mani {
    position: unset;
    }
`)}

${smallBreakPoint(css`
    sl-progress-ring {
    --size: 75px;
    --track-width: 4px;
    --indicator-width: 6px;
    font-size: 14px;
    }

    .progressRingSkeleton::part(base), .loader-round.large {
    width: 75px;
    height: 75px;
    }

    #header-row {
    flex-direction: column-reverse;
    row-gap: 1.5em;
    }

    #app-card{
    width: 100%;
    }

    #app-actions {
    width: 100%;
    }

    #app-actions .arrow_link {
    font-size: 12px;
    }

    #retest img {
    height: 14px;
    }

    #package{
    width: 50%;
    row-gap: .75em;
    }

    #test-download {
    font-size: 10px;
    }

    #mh-content {
    flex-direction: column;
    }

    #mh-text {
    width: 100%;
    }
    #mh-actions {
    align-items: flex-start;
    }

    #manifest-detail-grid{
    display: flex;
    flex-direction: column;
    }

    #report-wrapper .alternate {
    font-size: 16px;
    }

    .half-width-cards {
    width: 100%;
    }

    #actions-footer p {
    font-size: 14px;
    }

    #actions-footer img {
    height: 18px;
    width: auto;
    }
    #last-edited {
    font-size: 14px;
    }
    #manifest-header, #sw-header, #sec-header {
    padding-bottom: 2.5em;
    }
    #manifest-header {
    gap: 0;
    row-gap: 20px;
    }
    #mh-actions, #sw-actions, #sec-header {
    row-gap: 1.5em;
    }

    #share-card {
    flex-direction: column-reverse;
    }

    #share-card-content {
    flex-direction: column-reverse;
    }

    #share-card-text {
    margin-left: 0;
    margin-bottom: 0;
    text-align: center;
    }

    #share-card-mani {
    position: unset;
    }

    .icons-holder {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    place-content: center;
    gap: 25px;
    }

    .icons-holder.sw {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    }
`)}
`;