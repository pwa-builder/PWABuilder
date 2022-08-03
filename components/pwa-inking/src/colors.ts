import { css, CSSResult } from 'lit-element';
    
// toolbar colors defined once, retrieved for css paexport constte display and sending to canvas
export const black: CSSResult = css`#000000`;
export const white: CSSResult = css`#ffffff`;
export const silver: CSSResult = css`#d1d3d4`;
export const gray: CSSResult = css`#a7a9ac`;
export const darkGray: CSSResult = css`#808285`;
export const charcoal: CSSResult = css`#58595b`;
export const magenta: CSSResult = css`#b31564`;
export const red: CSSResult = css`#e61b1b`;
export const redOrange: CSSResult = css`#ff5500`;
export const orange: CSSResult = css`#ffaa00`;
export const gold: CSSResult = css`#ffce00`;
export const yellow: CSSResult = css`#ffe600`;
export const grassGreen: CSSResult = css`#a2e61b`;
export const green: CSSResult = css`#26e600`;
export const darkGreen: CSSResult = css`#008055`;
export const teal: CSSResult = css`#00aacc`;
export const blue: CSSResult = css`#004de6`;
export const indigo: CSSResult = css`#3d00b8`;
export const violet: CSSResult = css`#6600cc`;
export const purple: CSSResult = css`#600080`;
export const beige: CSSResult = css`#f7d7c4`;
export const lightBrown: CSSResult = css`#bb9167`;
export const brown: CSSResult = css`#8e562e`;
export const darkBrown: CSSResult = css`#613d30`;
export const pastelPink: CSSResult = css`#ff80ff`;
export const pastelOrange: CSSResult = css`#ffc680`;
export const pastelYellow: CSSResult = css`#ffff80`;
export const pastelGreen: CSSResult = css`#80ff9e`;
export const pastelBlue: CSSResult = css`#80d6ff`;
export const pastelPurple: CSSResult = css`#bcb3ff`;
export const colorPaletteBackground: CSSResult = css`#f2f2f2`;

// toolbar colors specific to highlighter
export const lightBlue: CSSResult = css`#44c8f5`;
export const pink: CSSResult = css`#ec008c`;

// background color used in toolbar
export const lightGray: CSSResult = css`#e8e8e8`;

// create quick way to retrieve a color value based on its css class
export function getColors() {

    const colors = new Map<string, CSSResult>();

    colors.set('black', black);
    colors.set('white', white);
    colors.set('silver', silver);
    colors.set('gray', gray);
    colors.set('darkGray', darkGray);
    colors.set('charcoal', charcoal);
    colors.set('magenta', magenta);
    colors.set('red', red);
    colors.set('redOrange', redOrange);
    colors.set('orange', orange);
    colors.set('gold', gold);
    colors.set('yellow', yellow);
    colors.set('grassGreen', grassGreen);
    colors.set('green', green);
    colors.set('darkGreen', darkGreen);
    colors.set('teal', teal);
    colors.set('blue', blue);
    colors.set('indigo', indigo);
    colors.set('violet', violet);
    colors.set('purple', purple);
    colors.set('beige', beige);
    colors.set('lightBrown', lightBrown);
    colors.set('brown', brown);
    colors.set('darkBrown', darkBrown);
    colors.set('pastelPink', pastelPink);
    colors.set('pastelOrange', pastelOrange);
    colors.set('pastelYellow', pastelYellow);
    colors.set('pastelGreen', pastelGreen);
    colors.set('pastelBlue', pastelBlue);
    colors.set('pastelPurple', pastelPurple);
    colors.set('lightBlue',  lightBlue);
    colors.set('pink', pink);

    return colors;
}