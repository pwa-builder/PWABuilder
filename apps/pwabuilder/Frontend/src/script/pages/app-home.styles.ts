import { css } from "lit";
import {
  xSmallBreakPoint,
  smallBreakPoint,
  xLargeBreakPoint,
  xxxLargeBreakPoint,
  BreakpointValues,
} from '../utils/css/breakpoints';

export const homeStyles = css`
  :host {
    --sl-focus-ring-width: 3px;
    --sl-input-focus-ring-color: #595959;
    --sl-focus-ring: 0 0 0 var(--sl-focus-ring-width) var(--sl-input-focus-ring-color);
    --sl-input-border-color-focus: #4F3FB6ac;
    --sl-color-primary-300: var(--primary-color);
  }

  #home-block::before {
    content: "";
  }

  #home-block {
    background: url(/assets/new/Hero1920_withmani.webp);
    background-position: center center;
    background-size: cover;
    background-repeat: no-repeat;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 4em;
  }

  #mani {
    position: fixed;
  }

  #wrapper {
    width: min(1000px, 90vw);
    max-width: 100%;
  }

  app-header::part(header) {
    background-color: transparent;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    z-index: 2;
    border: none;
  }

  #input-header {
    font-size: var(--subheader-font-size);
    font-weight: bold;
    margin: 0;
    line-height: 1.75em;
    color: var(--primary-color);
  }

  #content-grid {
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: auto auto;
    width: fit-content;
  }

  .intro-grid-item {
    width: max-content;
    margin-right: 1em;
    text-wrap-style: balance;
  }
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
    }
    40% {
      transform: translateX(-5px);
    }
    60% {
        transform: translateX(5px);
    }
  }
  .grid-item-header {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    font-weight: bold;
    margin-bottom: .25em;
  }
  .grid-item-header a {
    text-decoration: none;
    border-bottom: 1px solid rgb(79, 63, 182);
    font-size: var(--subheader-font-size);
    font-weight: bold;
    margin: 0px 0.5em 0px 0px;
    line-height: 1em;
    color: rgb(79, 63, 182);
  }
  .grid-item-header a:visited {
    color: var(--primary-color);
  }
  .grid-item-header:hover {
    cursor: pointer;
  }
  .grid-item-header:hover img {
    animation: bounce 1s;
  }
  .intro-grid-item p {
    margin: 0;
    color: var(--font-color);
    font-size:  var(--body-font-size);
    width: 15em;
  }
  #input-form {
    margin-top: 1em;
    width: max-content;
  }
  #input-header-holder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: max-content;
    margin-bottom: 10px;
  }
  #input-header-holder img {
    width: auto;
    height: 1em;
    margin-left: 20px;
  }
  #input-area {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: 1fr 1fr;
    row-gap: 5px;
    place-items: center;
  }
  #input-and-error {
    grid-area: 1 / 1 / auto / 5;
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  #input-box::part(input) {
    -webkit-text-fill-color: var(--sl-input-color);
  }
  #start-button {
    grid-area: 1 / 5 / auto / auto;
    width: 100%;
  }
  .raise:hover:not(disabled){
    transform: scale(1.01);
  }
  .raise:focus:not(disabled) {
    transform: scale(1.01);
    outline: 1px solid #000000;
  }
  #input-form sl-input {
    margin-right: 10px;
  }
  #input-form sl-input::part(base) {
    border: 1px solid #e5e5e5;
    border-radius: var(--input-border-radius);
    color: var(--font-color);
    width: min(28em, 100%);
    max-width: 100%;
    font-size: 14px;
    height: 3em;
  }

  #input-form sl-input::part(input) {
    height: 3em;
  }

  #input-form .error::part(base){
    border-color: #eb5757;
    --sl-input-focus-ring-color: #eb575770;
    --sl-focus-ring-width: 3px;
    --sl-focus-ring: 0 0 0 var(--sl-focus-ring-width) var(--sl-input-focus-ring-color);
    --sl-input-border-color-focus: #eb5757ac;
  }

  .error-message {
    color: var(--error-color);
    font-size: var(--small-font-size);
    margin-top: 6px;
  }

  #input-form .navigation::part(base) {
    background-color: var(--font-color);
    color: white;
    font-size: 14px;
    height: 3em;
    min-height: unset;
    border-radius: 50px;
  }

  #input-form .navigation::part(label){
    display: flex;
    align-items: center;
  }

  #input-block {
    display: flex;
    flex-direction: column;
    flex: 0.8 1 0%;
    width: 100%;
  }
  #demo {
    font-size: 12px;
    color: var(--font-color);
    margin: 0;
    grid-area: 2 / 1 / auto / 2;
    place-self: start;
  }
  #demo-action {
    margin: 0;
    text-decoration: underline;
    font-weight: bold;
    background: none;
    border: none;
    padding: 0;
    font-size: 1em;
    margin-left: 1px;
    color: var(--font-color);
  }
  #demo-action:hover{
    cursor: pointer;
  }
  #home-header {
    max-width: 498px;
    line-height: 48px;
    letter-spacing: -0.015em;
    margin-bottom: 20px;
    font-size: var(--title-font-size);
  }
  /* 640px - 1023px */
  @media (min-width: ${BreakpointValues.largeLower}px) and (max-width: ${BreakpointValues.largeUpper}px) {
    #home-block {
      padding-left: 4.5em;
      background: url(/assets/new/Hero1024_withmani.png);
      background-position: center center;
      background-size: cover;
      background-repeat: no-repeat;
    }
    #wrapper {
      width: 825px;
    }
    #content-grid {
      column-gap: 1em;
    }
  }
  
  /* 480px - 639px */
  @media (min-width: ${BreakpointValues.mediumLower}px) and (max-width: ${BreakpointValues.mediumUpper}px) {
    #home-block {
      padding: 1.5em;
      padding-top: 4em;
      padding-bottom: 6em;
      background: url(/assets/new/Hero480_withmani.jpg);
      background-position: center bottom;
      background-size: cover;
      background-repeat: no-repeat;
    }
    #wrapper {
      width: 530px;
    }
    .intro-grid-item p {
      width: 13em;
    }
    #input-area {
      width: 100%;
      column-gap: 10px;
    }
    #input-and-error {
      margin-right: 10px;
      width: 100%;
    }
    sl-input {
      width: 100%;
      margin-right: 10px;
    }
    #input-form sl-input::part(base){
      width: 100%;
    }
    #input-form {
      width: 100%;
    }
    #home-header{
      font-size: 40px;
    }
    #input-form .navigation::part(base) {
      width: 8em;
    }
    #demo {
      grid-area: 2 / 1 / auto / 3;
    }
  }

  @media (min-width: 480px) and (max-width: 580px) {
    #wrapper {
      width: 400px;
    }

    #input-area {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
  }

  /* 321px - 479px */
  ${smallBreakPoint(css`
      #home-block {
        padding: 1em;
        padding-top: 3.5em;
        padding-bottom: 2em;
        background: url(/assets/new/Hero480_withmani.jpg);
        background-position: center bottom;
        background-size: cover;
        background-repeat: no-repeat;
      }
      #wrapper {
        width: min(350px, 95vw);
        max-width: 100%;
      }
      #home-header {
        font-size: 28px;
        line-height: 32px;
        text-align: center;
      }
      #content-grid {
        display: flex;
        flex-direction: column;
        row-gap: 1em;
      }
      .intro-grid-item {
        width: 100%;
        margin-right: 0;
      }
      .intro-grid-item p {
        width: 100%;
        text-align: center;
      }
      .grid-item-header {
        justify-content: center;
        font-size: 18px;
      }
      #input-area {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        row-gap: 8px;
      }
      #input-and-error {
        width: 100%;
        margin-right: 0;
      }
      #input-form sl-input::part(base) {
        width: 100%;
      }
      #input-form {
        width: 100%;
      }
      #input-form .navigation::part(base) {
        width: 100%;
      }
  `)}

  @media (min-width: 640px) and (max-width: 955px) {
    #home-block {
      background-position: center;
    }
    #wrapper {
      width: 600px;
    }
  }

  /*1024px - 1365px*/
  ${xLargeBreakPoint(css`
      #home-block {
        background: url(/assets/new/Hero1366_withmani.png);
        background-position: center center;
        background-size: cover;
        background-repeat: no-repeat;
      }
  `)}
    /* > 1920 */
  ${xxxLargeBreakPoint(css`
      #wrapper {
        width: 1160px;
      }
  `)}

  /* <= 320px - Extra small for 400% zoom */
  ${xSmallBreakPoint(css`
      #home-block {
        padding: 0.5em;
        padding-top: 3em;
        padding-bottom: 1.5em;
        background: none;
        background-color: var(--primary-background-color);
      }
      #wrapper {
        width: 100%;
        max-width: 100%;
        padding: 0 0.5em;
      }
      #home-header {
        font-size: 24px;
        line-height: 28px;
        max-width: 100%;
        text-align: center;
      }
      #content-grid {
        display: flex;
        flex-direction: column;
        row-gap: 0.75em;
        width: 100%;
      }
      .intro-grid-item {
        width: 100%;
        margin-right: 0;
      }
      .intro-grid-item p {
        width: 100%;
        max-width: 100%;
        text-align: center;
        font-size: 13px;
      }
      .grid-item-header {
        justify-content: center;
        flex-direction: column;
        text-align: center;
      }
      .grid-item-header a {
        font-size: 16px;
        margin: 0 0 0.25em 0;
      }
      #input-form {
        width: 100%;
        margin-top: 0.75em;
      }
      #input-header-holder {
        flex-direction: column;
        text-align: center;
      }
      #input-header-holder img {
        display: none;
      }
      #input-header {
        font-size: 16px;
        text-align: center;
      }
      #input-area {
        display: flex;
        flex-direction: column;
        row-gap: 8px;
        width: 100%;
        place-items: stretch;
      }
      #input-and-error {
        width: 100%;
        margin-right: 0;
      }
      #input-form sl-input::part(base) {
        width: 100%;
        min-width: 0;
        font-size: 13px;
        height: 2.75em;
      }
      #start-button {
        width: 100%;
        margin-top: 8px;
      }
      #input-form .navigation::part(base) {
        width: 100%;
        font-size: 13px;
        height: 2.75em;
        min-height: 2.75em;
      }
      #demo {
        text-align: center;
        font-size: 11px;
      }
  `)}
`;