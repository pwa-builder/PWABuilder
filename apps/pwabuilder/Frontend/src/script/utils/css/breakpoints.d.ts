import { CSSResultGroup } from 'lit';
export declare enum BreakpointValues {
    xSmallUpper = 320,
    smallLower = 321,
    smallUpper = 479,
    mediumLower = 480,
    mediumUpper = 639,
    largeLower = 640,
    largeUpper = 1023,
    xLargeLower = 1024,
    xLargeUpper = 1365,
    xxLargeLower = 1366,
    xxLargeUpper = 1919,
    xxxLargeLower = 1920
}
type BoundModification = 'both' | 'no-lower' | 'no-upper';
export declare function customBreakPoint(styles: CSSResultGroup, lower?: number | undefined, upper?: number | undefined): import("lit").CSSResult;
export declare function xSmallBreakPoint(styles: CSSResultGroup): import("lit").CSSResult;
export declare function smallBreakPoint(styles: CSSResultGroup): import("lit").CSSResult;
export declare function mediumBreakPoint(styles: CSSResultGroup, editBound?: BoundModification): import("lit").CSSResult;
export declare function largeBreakPoint(styles: CSSResultGroup, editBound?: BoundModification): import("lit").CSSResult;
export declare function xLargeBreakPoint(styles: CSSResultGroup, editBound?: BoundModification): import("lit").CSSResult;
export declare function xxLargeBreakPoint(styles: CSSResultGroup, editBound?: BoundModification): import("lit").CSSResult;
export declare function xxxLargeBreakPoint(styles: CSSResultGroup): import("lit").CSSResult;
export {};
