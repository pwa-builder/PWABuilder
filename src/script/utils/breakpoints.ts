import { unsafeCSS, CSSResult } from 'lit-element';

enum BreakpointValues {
  smallUpper = 479,
  mediumLower = 480,
  mediumUpper = 639,
  largeLower = 640,
  largeUpper = 1023,
  xLargeLower = 1024,
  xLargeUpper = 1365,
  xxLargeLower = 1366,
  xxLargeUpper = 1919,
  xxxLargeLower = 1920,
}

export function customBreakPoint(
  styles: CSSResult,
  lower: number | undefined = undefined,
  upper: number | undefined = undefined
) {
  return unsafeCSS(`
    @media screen ${breakPoints({ lower, upper })} {
      ${styles}
    }
  `);
}

export function smallBreakPoint(styles: CSSResult) {
  const upper = BreakpointValues.smallUpper;
  return unsafeCSS(`
    @media screen ${breakPoints({ upper })} {
      ${styles}
    }
  `);
}

export function mediumBreakPoint(
  styles: CSSResult,
  includeLower = true,
  includeUpper = true
) {
  const lower = includeLower ? BreakpointValues.mediumLower : undefined;
  const upper = includeUpper ? BreakpointValues.mediumUpper : undefined;
  return unsafeCSS(`
    @media screen ${breakPoints({ lower, upper })} {
      ${styles}
    }
  `);
}

export function largeBreakPoint(
  styles: CSSResult,
  includeLower = true,
  includeUpper = true
) {
  const lower = includeLower ? BreakpointValues.largeLower : undefined;
  const upper = includeUpper ? BreakpointValues.largeUpper : undefined;
  return unsafeCSS(`
    @media screen ${breakPoints({ lower, upper })} {
      ${styles}
    }
  `);
}

export function xLargeBreakPoint(
  styles: CSSResult,
  includeLower = true,
  includeUpper = true
) {
  const lower = includeLower ? BreakpointValues.xLargeLower : undefined;
  const upper = includeUpper ? BreakpointValues.xLargeUpper : undefined;
  return unsafeCSS(`
    @media screen ${breakPoints({ lower, upper })} {
      ${styles}
    }
  `);
}

export function xxLargeBreakPoint(
  styles: CSSResult,
  includeLower = true,
  includeUpper = true
) {
  const lower = includeLower ? BreakpointValues.xxLargeLower : undefined;
  const upper = includeUpper ? BreakpointValues.xxLargeUpper : undefined;
  return unsafeCSS(`
    @media screen ${breakPoints({ lower, upper })} {
      ${styles}
    }
  `);
}

export function xxxLargeBreakPoint(styles: CSSResult) {
  const lower = BreakpointValues.xxxLargeLower;
  return unsafeCSS(`
    @media screen ${breakPoints({ lower })} {
      ${styles}
    }
  `);
}

interface Bound {
  lower?: number;
  upper?: number;
}

function breakPoints({ lower, upper }: Bound) {
  const output = [];

  if (!lower && !upper) {
    return '';
  }

  if (lower) {
    output.push(`(min-width: ${lower}px)`);
  }

  if (upper) {
    output.push(`(max-width: ${upper}px)`);
  }

  return 'and ' + output.join(' and ');
}
