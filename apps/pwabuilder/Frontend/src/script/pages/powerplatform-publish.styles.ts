import { css } from "lit";

export const powerplatformPublishStyles = css`
        * {
          box-sizing: border-box;
          font-family: inherit;
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

        .skeleton-shapes wa-skeleton {
          display: inline-flex;
          width: 50px;
          height: 50px;
        }

        .skeleton-shapes .square::part(indicator) {
          --border-radius: var(--wa-border-radius-m);
        }

        .skeleton-shapes .circle::part(indicator) {
          --border-radius: var(--wa-border-radius-circle);
        }

        .skeleton-shapes .triangle::part(indicator) {
          --border-radius: 0;
          clip-path: polygon(50% 0, 0 100%, 100% 100%);
        }

        .skeleton-shapes .cross::part(indicator) {
          --border-radius: 0;
          clip-path: polygon(
            20% 0%,
            0% 20%,
            30% 50%,
            0% 80%,
            20% 100%,
            50% 70%,
            80% 100%,
            100% 80%,
            70% 50%,
            100% 20%,
            80% 0%,
            50% 30%
          );
        }

        .skeleton-shapes .comment::part(indicator) {
          --border-radius: 0;
          clip-path: polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%);
        }

        .skeleton-shapes wa-skeleton:not(:last-child) {
          margin-right: 0.5rem;
        }

      `;
