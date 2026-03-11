import { TemplateResult } from 'lit';
import { WindowsPackageOptions } from '../utils/win-validation';
import { AppPackageFormBase, FormInput } from './app-package-form-base';
import { PackageOptions } from '../utils/interfaces';
import '../components/arrow-link';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/radio/radio.js';
import '@shoelace-style/shoelace/dist/components/radio-group/radio-group.js';
import '@shoelace-style/shoelace/dist/components/details/details.js';
export declare class WindowsForm extends AppPackageFormBase {
    generating: boolean;
    showAdvanced: boolean;
    customSelected: boolean;
    initialBgColor: string;
    currentSelectedColor: string;
    packageOptions: WindowsPackageOptions;
    activeLanguages: string[];
    activeLanguageCodes: string[];
    userBackgroundColor: string;
    showUploadActionsFile: boolean;
    actionsFileError: string | null;
    supportCustomEntity: boolean;
    customEntitiesFileError: string | null;
    localizedEntitiesErrors: string[];
    static get styles(): import("lit").CSSResult[];
    constructor();
    connectedCallback(): Promise<void>;
    toggleSettings(settingsToggleValue: 'basic' | 'advanced'): void;
    get manifestUrl(): string | null | undefined;
    addOrRemoveDeviceFamily(val: string, checked: boolean): void;
    checkValidityForDeviceFamily(): void;
    updateActionsSelection(checked: boolean): Promise<void>;
    updateCustomEntitySelection(checked: boolean): Promise<void>;
    customEntitiesFileChanged(e: Event): Promise<void>;
    localizedEntitiesFolderChanged(e: Event): Promise<void>;
    openFolderPicker(): void;
    openActionsPicker(): void;
    openCustomEntitiesPicker(): void;
    base64ToArrayBuffer(b64: string): ArrayBuffer;
    actionsFileChanged(e: Event): Promise<void>;
    /**
     * Resets the actions upload zone to its default state
     */
    private resetActionsUploadZone;
    /**
     * Validates localized entities files for JSON format and proper naming conventions
     */
    private validateLocalizedEntitiesFiles;
    /**
     * Validates if a string is a proper BCP-47 language tag
     */
    private isValidLanguageTag;
    /**
     * Reads a file as text asynchronously
     */
    private readFileAsText;
    /**
     * Displays localized entities validation errors in the UI
     */
    private displayLocalizedEntitiesErrors;
    rotateZero(): void;
    rotateNinety(): void;
    getPackageOptions(): PackageOptions;
    getForm(): HTMLFormElement;
    renderMultiSelect(formInput: FormInput): TemplateResult;
    renderColorToggle(formInput: FormInput): TemplateResult;
    toggleIconBgRadios(): void;
    render(): TemplateResult<1>;
}
