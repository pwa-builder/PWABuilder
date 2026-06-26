import { css } from "lit";

export const codeEditorStyles = css`

        :host {
          position: relative;
        }

        wa-button::part(base) {
          --wa-button-font-size-medium: 14px;
        }
        
        #copy-block {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 10px;
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .editor-container {
          font-size: 14px;
        }
      `;