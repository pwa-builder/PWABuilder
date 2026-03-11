import { PropertyValueMap, TemplateResult } from 'lit';
import { ManifestContext, PackageOptions } from '../utils/interfaces';
import { AppPackageFormBase } from './app-package-form-base';
import '@shoelace-style/shoelace/dist/components/details/details.js';
export declare class AndroidForm extends AppPackageFormBase {
    analysisId: string | null;
    generating: boolean;
    isGooglePlayApk: boolean;
    showAdvanced: boolean;
    packageOptions: import("../utils/android-validation").AndroidPackageOptions;
    manifestContext: ManifestContext | undefined;
    static get styles(): import("lit").CSSResult[];
    constructor();
    firstUpdated(): Promise<void>;
    protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void;
    toggleSettings(settingsToggleValue: 'basic' | 'advanced'): void;
    /**
     * Called when the user changes the signing mode.
     */
    androidSigningModeChanged(mode: 'mine' | 'new' | 'none'): void;
    isMetaQuestChanged(checked: boolean): void;
    /**
     * Validates the package ID and updates the input's custom validity
     */
    validatePackageId(packageId: string, input: HTMLInputElement): void;
    androidSigningKeyUploaded(event: any): void;
    rotateZero(): void;
    rotateNinety(): void;
    getPackageOptions(): PackageOptions;
    getForm(): HTMLFormElement;
    render(): TemplateResult<1>;
    renderSigningKeyFields(): TemplateResult;
    renderNewSigningKeyFields(): TemplateResult;
    renderExistingSigningKeyFields(): TemplateResult;
    renderKeyAlias(): TemplateResult;
    renderKeyPassword(): TemplateResult;
    renderKeyStorePassword(): TemplateResult;
}
