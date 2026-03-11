import { AppPackageFormBase } from './app-package-form-base';
import { PackageOptions } from '../utils/interfaces';
import '@shoelace-style/shoelace/dist/components/details/details.js';
export declare class IOSForm extends AppPackageFormBase {
    generating: boolean;
    showAllSettings: boolean;
    packageOptions: import("../utils/ios-validation").IOSAppPackageOptions;
    static get styles(): import("lit").CSSResult[];
    constructor();
    firstUpdated(): Promise<void>;
    rotateZero(): void;
    rotateNinety(): void;
    getPackageOptions(): PackageOptions;
    getForm(): HTMLFormElement;
    render(): import("lit-html").TemplateResult<1>;
    getInputValue(target: EventTarget | null): string;
}
