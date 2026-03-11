import { LitElement } from 'lit';
import { Lazy } from '../utils/interfaces';
import { FileInputElement } from '../utils/interfaces.components';
import '@shoelace-style/shoelace/dist/components/button/button.js';
export declare class FileInput extends LitElement implements FileInputElement {
    inputId: string;
    accept?: string;
    fileInput: Lazy<HTMLInputElement>;
    buttonText: string;
    static get styles(): import("lit").CSSResult[];
    get input(): any;
    get value(): any;
    get files(): any;
    constructor();
    render(): import("lit-html").TemplateResult<1>;
    clickModalInput(): void;
    handleModalInputFileChosen(): void;
    clearInput(): void;
}
