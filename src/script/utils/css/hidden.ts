import { css } from 'lit-element';

export const hidden_sm = css`
  @media screen and (max-width: 479px) {
    .hidden-sm {
      display: none;
    }
  }
`;

export const hidden_med = css`
  @media screen and (min-width: 480px) and (max-width: 639px) {
    .hidden-med {
      display: none;
    }
  }
`;

export const hidden_lrg = css`
  @media screen and (min-width: 640px) and (max-width: 1023px) {
    .hidden-lrg {
      display: none;
    }
  }
`;

export const hidden_xlrg = css`
  @media screen and (min-width: 1024px) and (max-width: 1365px) {
    .hidden-xlrg {
      display: none;
    }
  }
`;

export const hidden_xxlrg = css`
  @media screen and (min-width: 1366px) and (max-width: 1919px) {
    .hidden-xxlrg {
      display: none;
    }
  }
`;

export const hidden_xxxlrg = css`
  @media screen and (min-width: 1920px) {
    .hidden-xxxlrg {
      display: none;
    }
  }
`;

export const hidden_all = css`
  ${hidden_sm}
  ${hidden_med}
  ${hidden_lrg}
  ${hidden_xlrg}
  ${hidden_xxlrg}
  ${hidden_xxxlrg}
`;
