import { css, unsafeCSS, CSSResult } from 'lit-element'

const constructionToken = Symbol()

export function smallBreakPoint(template: TemplateStringsArray, ...values: (CSSResult | number)[]) {
  return css`
    @media screen and (max-width: 479px) {
      ${reducer(template, ...values)}
    }
  `
}

export function mediumBreakPoint(template: TemplateStringsArray, ...values: (CSSResult|number)[]) {
  return css`
    @media screen and (min-width: 480px) and (max-width: 639px) {
      ${reducer(template, ...values)}
    }
  `
}

export function largeBreakPoint(template: TemplateStringsArray, ...values: (CSSResult|number)[]) {
  return css`
    @media screen and (min-width: 640px) and (max-width: 1023px) {
      ${reducer(template, ...values)}
    }
  `
}

export function xLargeBreakPoint(template: TemplateStringsArray, ...values: (CSSResult|number)[]) {
  return css`
    @media screen and (min-width: 1024px) and (max-width: 1365px) {
      ${reducer(template, ...values)}
    }
  `
}

export function xxLargeBreakPoint(template: TemplateStringsArray, ...values: (CSSResult|number)[]) {
  return css`
    @media screen and (min-width: 1366px) and (max-width: 1919px) {
      ${reducer(template, ...values)}
    }
  `
}

export function xxxLargeBreakPoint(template: TemplateStringsArray, ...values: (CSSResult|number)[]) {
  return css`
    @media screen and (min-width: 1920px) {
      ${reducer(template, ...values)}
    }
  `
}

function reducer(template: TemplateStringsArray, ...values: (CSSResult | number)[]) {
  return unsafeCSS(values.reduce(
    (acc, v, idx) => acc + templateText(v) + template[idx + 1],
    template[0]
  ));
}

function templateText(value: CSSResult | number) {
  if (value instanceof CSSResult) {
    return value.cssText
  } else if (typeof value === "number") {
    return String(value)
  } else {
    throw Error("Unsafe usage of template literal")
  }
}
