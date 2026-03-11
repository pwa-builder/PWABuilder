import { Manifest, Icon } from '@pwabuilder/manifest-validation';
import { LitElement, PropertyValueMap, TemplateResult } from 'lit';
import "./manifest-field-tooltip";
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import { Lazy } from "../../utils/interfaces";
interface PlatformInformation {
    label: string;
    value: string;
}
export declare class ManifestIconsForm extends LitElement {
    manifest: Manifest;
    manifestURL: string;
    focusOn: string;
    analysisId: string;
    imageProxyUrl: string;
    uploadSelectedImageFile: Lazy<File>;
    canWeGenerate: boolean;
    generatingZip: boolean;
    zipGenerated: boolean;
    uploadImageObjectUrl: string;
    errored: boolean;
    selectedPlatforms: PlatformInformation[];
    srcList: Icon[];
    private shouldValidateAllFields;
    private validationPromise;
    private errorCount;
    static get styles(): import("lit").CSSResult;
    constructor();
    protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): Promise<void>;
    private requestValidateAllFields;
    validateAllFields(): Promise<void>;
    enterFileSystem(): void;
    handleModalInputFileChange(): Promise<void>;
    validIconInput(): string | undefined;
    iconSrcListParse(): Promise<void>;
    testImage(url: string): Promise<unknown>;
    handleImageUrl(icon: Icon): string | undefined;
    handlePlatformChange(e: any, platform: PlatformInformation): void;
    generateZip(): Promise<void>;
    downloadZip(zipUrl: string, fileName: string): void;
    decideFocus(field: string): {
        focus: boolean;
    };
    render(): TemplateResult<1>;
    renderIcons(): TemplateResult;
    renderIcon(i: Icon): TemplateResult;
}
export {};
