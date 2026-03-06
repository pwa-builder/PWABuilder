import { css } from "lit";

export const manifestFieldTooltipStyles = css`

      .mic-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 16px;
        width: 16px;
      }

      .info-box {
        background-color: #292c3a;
        width: 220px;
        color: #ffffff;
        padding: 10px;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }

      .info-box p {
        margin: 0;
        font-size: 16px;
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

      .mic-actions {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        width: 100%;
        gap: 5px;
        margin-bottom: 5px;
      }

      .mic-actions > * {
        color: #ffffff;
        font-size: 14px;
        font-weight: bold;
        font-family: var(--font-family);
      }

      .mic-actions a {
        line-height: 17px;
      }

      .mic-actions a:visited, .mic-actions a:active, .mic-actions a:link {
        color: #ffffff;
      }
`;