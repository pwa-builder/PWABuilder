import { css } from 'lit';

/**
 * Styles for the <app-index> root component: the router outlet transitions,
 * page layout wrapper, sidebar/main grid, and the fixed toast stack.
 */
export const appIndexStyles = css`
      #router-outlet > * {
        width: 100% !important;
      }

      #router-outlet > .leaving {
        animation: 160ms fadeOut ease-in-out;
      }

      #router-outlet > .entering {
        animation: 160ms fadeIn linear;
      }

      #router-outlet {
        position: relative;
      }

      #wrapper {
        display: flex;
        min-height: 100vh;
        flex-direction: column;
      }

      #content {
        flex: 1;
        background-color: rgb(242, 243, 251);
      }

      @media (min-width: 1920px) {
        #router-outlet {
          background: var(--primary-purple);
        }
      }

      @keyframes fadeOut {
        from {
          opacity: 1;
        }

        to {
          opacity: 0;
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0.2;
        }

        to {
          opacity: 1;
        }
      }
      /* To handle sidebar & main */
      .container {
        display: grid;
        grid-template-columns: minmax(280px, auto);
        grid-template-areas: 'sidebar main';
        margin: 0 auto;
        height: 100%;
        position: relative;
      }
      .container > .main {
        width: calc(100vw - 280px);
        grid-area: main;
      }
      .container > .sidebar {
        grid-area: sidebar;
      }

      /* Fixed-position container that stacks toasts in the top-right corner.
         pointer-events are disabled here so only the toasts themselves are
         interactive, letting clicks pass through the empty stack area. */
      .toast-stack {
        position: fixed;
        top: 1rem;
        inset-inline-end: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        z-index: 1000;
        max-width: min(28rem, calc(100vw - 2rem));
        pointer-events: none;
      }
    `;
