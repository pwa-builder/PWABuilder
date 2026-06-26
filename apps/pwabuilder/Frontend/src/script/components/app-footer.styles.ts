import { css } from "lit";
import {
  xSmallBreakPoint,
  smallBreakPoint,
  mediumBreakPoint,
  xxxLargeBreakPoint,
} from '../utils/css/breakpoints';

export const appFooterStyles = css`
      footer {
        /*temp color*/
        background: var(--font-color);
        color: #ffffff;
        fill: #ffffff;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 16px;
        padding-bottom: 16px;
        padding-left: 37px;
        padding-right: 37px;
        font-weight: 700;
        font-size: var(--footer-font-size);
      }


      wa-icon {
        font-size: var(--font-size);
        color: #ffffff;
        pointer-events: none;
      }

      span {
        max-width: 672px;
        display: block;
      }

      #icons {
        width: 8em;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      #links {
        margin-top: 8px;
      }

      #links a {
        margin-right: 12px;
        color: #ffffff;
      }

      #links a:visited {
        color: #ffffff;
      }

      @media screen and (-ms-high-contrast: black-on-white) {
          /* All high contrast styling rules */
          wa-icon {
            color: var(--font-color);
          }
      } 

      ${xxxLargeBreakPoint(
        css`
          footer {
            justify-content: center;
          }

          /* 30em here to line up with rest of
          layout at this size */
          #footer-top {
            margin-right: 30em;
          }
        `
      )}

      ${mediumBreakPoint(
        css`
          footer {
            flex-direction: column;
          }

          #footer-top {
            align-items: center;
            text-align: center;
            display: flex;
            flex-direction: column;
          }

          #links {
            margin-top: 30px;
            margin-bottom: 30px;
          }

          #icons {
            color: #ffffff;
            width: 10em;
          }

          #icons a {
            margin-right: 46px;
          }

          #icons wa-icon {
            font-size: 27px;
            color: #ffffff;
          }
        `
      )}

      ${xSmallBreakPoint(css`
        footer {
          align-items: center;
          display: flex;
          flex-direction: column;
          text-align: center;
          padding: 12px 10px;
          font-size: 10px;
        }

        #icons {
          margin-top: 8px;
        }

        #footer-top span {
          font-size: 10px;
          line-height: 1.4;
        }

        #links {
          margin-top: 8px;
        }

        #links a {
          font-size: 10px;
          margin: 0 6px;
        }
      `)}

      ${smallBreakPoint(css`
        footer {
          align-items: center;
          display: flex;
          flex-direction: column;
          text-align: center;
        }

        #icons {
          margin-top: 10px;
        }
      `)}
    `;
