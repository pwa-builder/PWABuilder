import { unsafeCSS, CSSResult } from 'lit-element';

const constructionToken = Symbol();

export function smallBreakPoint(styles: CSSResult) {
  return unsafeCSS(`
    @media screen and (max-width: 479px) {
      ${styles}
    }
  `);
}

export function mediumBreakPoint(styles: CSSResult) {
  return unsafeCSS(`
    @media screen and (min-width: 480px) and (max-width: 639px) {
      ${styles}
    }
  `);
}

export function largeBreakPoint(styles: CSSResult) {
  return unsafeCSS(`
    @media screen and (min-width: 640px) and (max-width: 1023px) {
      ${styles}
    }
  `);
}

export function xLargeBreakPoint(styles: CSSResult) {
  return unsafeCSS(`
    @media screen and (min-width: 1024px) and (max-width: 1365px) {
      ${styles}
    }
  `);
}

export function xxLargeBreakPoint(styles: CSSResult) {
  return unsafeCSS(`
    @media screen and (min-width: 1366px) and (max-width: 1919px) {
      ${styles}
    }
  `);
}

export function xxxLargeBreakPoint(styles: CSSResult) {
  return unsafeCSS(`
    @media screen and (min-width: 1920px) {
      ${styles}
    }
  `);
}
