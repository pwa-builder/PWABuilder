import { LitElement } from 'lit';
import { FastButtonAppearance } from '../utils/fast-element';
import { AppButtonElement } from '../utils/interfaces.components';
export declare class AppButton extends LitElement implements AppButtonElement {
    type: string;
    colorMode: string;
    appearance: FastButtonAppearance;
    disabled: boolean;
    static get styles(): import("lit").CSSResult[];
    constructor();
    render(): import("lit-html").TemplateResult<1>;
}
