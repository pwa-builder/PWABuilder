import { LitElement, TemplateResult } from 'lit';
import { IOSAppPackageOptions } from '../utils/ios-validation';
import { WindowsPackageOptions } from '../utils/win-validation';
import { AndroidPackageOptions } from '../utils/android-validation';
import { Platform } from '../services/publish';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import './windows-form';
import './android-form';
import './ios-form';
export declare class TestPublishPane extends LitElement {
    generating: boolean;
    selectedStore: string;
    readyToDownload: boolean;
    blob: Blob | File | null | undefined;
    testBlob: Blob | File | null | undefined;
    downloadFileName: string | null;
    feedbackMessages: TemplateResult[];
    readonly platforms: ICardData[];
    static get styles(): import("lit").CSSResult[];
    constructor();
    firstUpdated(): void;
    renderWindowsDownloadButton(): TemplateResult;
    generateWindowsTestPackage(): Promise<void>;
    generate(platform: Platform, options?: AndroidPackageOptions | IOSAppPackageOptions | WindowsPackageOptions): Promise<void>;
    renderErrorMessage(err: any): void;
    renderSuccessMessage(): void;
    copyText(text: string): void;
    downloadPackage(): Promise<void>;
    renderContentCards(): TemplateResult[];
    hideDialog(e: any): Promise<void>;
    render(): TemplateResult<1>;
}
interface ICardData {
    title: 'Windows' | 'Android' | 'iOS' | "Meta Quest";
    factoids: string[];
    isActionCard: boolean;
    icon: string;
    renderDownloadButton: () => TemplateResult;
}
export {};
