import { html, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getManifestContext, getManifestUrl } from '../services/app-info';
import {
    createWindowsPackageOptionsFromManifest,
    emptyWindowsPackageOptions,
    windowsLanguages,
} from '../services/publish/windows-publish';
import { WindowsPackageOptions } from '../utils/win-validation';
import { AppPackageFormBase, FormInput } from './app-package-form-base';
import { fetchOrCreateManifest } from '../services/manifest';
import { ManifestContext, PackageOptions } from '../utils/interfaces';
import { AppNameInputPattern } from '../utils/constants';
import '../components/arrow-link';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { classMap } from 'lit/directives/class-map.js';
import { windowsFormStyles } from "./windows-form.styles";
import "@awesome.me/webawesome/dist/components/details/details.js";
import "@awesome.me/webawesome/dist/components/select/select.js";
import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/radio-group/radio-group.js";
import "@awesome.me/webawesome/dist/components/radio/radio.js";
import "@awesome.me/webawesome/dist/components/option/option.js";
import '@awesome.me/webawesome/dist/components/color-picker/color-picker.js';

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
let actionsSchemaValidation: any = null;
let customEntitySchemaValidation: any = null;

const CUSTOM_ENTITY_SCHEMA_ID = "https://pwa-builder.com/schemas/custom-entities.json";
const CUSTOM_ENTITY_SCHEMA = {
    "type": "object",
    "properties": {
        "version": {
            "type": "number",
            "const": 1
        },
        "entityDefinitions": {
            "type": "object",
            "minProperties": 1,
            "additionalProperties": {
                "oneOf": [
                    {
                        "type": "string",
                        "pattern": "^ms-resource://.+"
                    },
                    {
                        "type": "object",
                        "minProperties": 1,
                        "additionalProperties": {
                            "type": "object",
                            "additionalProperties": {
                                "type": "string"
                            }
                        }
                    }
                ]
            }
        }
    },
    "required": ["version", "entityDefinitions"]
};

@customElement('windows-form')

export class WindowsForm extends AppPackageFormBase {
    @property({ type: Boolean }) generating: boolean = false;
    @state() showAdvanced = false;
    @state() customSelected = false;
    @state() initialBgColor: string = '';
    @state() currentSelectedColor: string = '';
    @state() packageOptions: WindowsPackageOptions = emptyWindowsPackageOptions();
    @state() activeLanguages: string[] = [];
    @state() activeLanguageCodes: string[] = [];
    @state() userBackgroundColor: string = "";
    @state() showUploadActionsFile: boolean = false;
    @state() actionsFileError: string | null = null;
    @state() supportCustomEntity: boolean = false;
    @state() customEntitiesFileError: string | null = null;
    @state() localizedEntitiesErrors: string[] = [];

    static get styles() {
        return [
            ...super.styles,
            windowsFormStyles
        ];
    }

    constructor() {
        super();
    }

    async connectedCallback(): Promise<void> {
        super.connectedCallback();

        let manifestContext: ManifestContext | undefined = getManifestContext();
        if (manifestContext.isGenerated) {
            manifestContext = await fetchOrCreateManifest();
        }

        this.packageOptions = createWindowsPackageOptionsFromManifest(
            manifestContext!.manifest
        );

        this.packageOptions.targetDeviceFamilies = ['Desktop', 'Holographic'];

        this.customSelected = this.packageOptions.images?.backgroundColor != 'transparent';
        this.currentSelectedColor = this.packageOptions.images?.backgroundColor!;
        if (manifestContext?.manifest.background_color) {
            this.initialBgColor = manifestContext!.manifest.background_color;
        } else {
            this.initialBgColor = "#000000";
        }
    }

    toggleSettings(settingsToggleValue: 'basic' | 'advanced') {
        if (settingsToggleValue === 'advanced') {
            this.showAdvanced = true;
        } else if (settingsToggleValue === 'basic') {
            this.showAdvanced = false;
        } else {
            this.showAdvanced = false;
        }
    }

    get manifestUrl(): string | null | undefined {
        return getManifestUrl();
    }

    addOrRemoveDeviceFamily(val: string, checked: boolean) {
        if (checked) {
            if (!this.packageOptions.targetDeviceFamilies?.includes(val)) {
                this.packageOptions.targetDeviceFamilies?.push(val);
            }
        } else {
            let index: any = this.packageOptions.targetDeviceFamilies?.indexOf(
                val,
                0
            );
            if (index > -1) {
                this.packageOptions.targetDeviceFamilies?.splice(index, 1);
            }
        }
        this.checkValidityForDeviceFamily();
    }

    checkValidityForDeviceFamily() {
        const container = this.shadowRoot?.querySelector(
            '#target-device-families'
        );
        const checkboxes = Array.from(container?.querySelectorAll('wa-checkbox') ?? []);
        const checkedCheckboxes = checkboxes.filter(cb => (cb as unknown as { checked: boolean }).checked);
        const desktopCheckbox = this.shadowRoot?.querySelector(
            '#device-family-input-desktop'
        ) as unknown as { setCustomValidity(message: string): void };
        if (checkedCheckboxes.length === 0) {
            desktopCheckbox.setCustomValidity(
                'Please select at least one device family'
            );
        } else {
            desktopCheckbox.setCustomValidity('');
        }
    }

    async updateActionsSelection(checked: boolean) {
        this.showUploadActionsFile = checked;

        if (!checked) {
            delete this.packageOptions.windowsActions;
            actionsSchemaValidation = null;
            this.supportCustomEntity = false;
        } else {
            try {
                const SCHEMA_ID = "https://aka.ms/appactions.schema.json";
                const SCHEMA_URL = "https://raw.githubusercontent.com/microsoft/App-Actions-On-Windows-Samples/refs/heads/main/schema/ActionsSchema.json";

                if (!ajv.getSchema(SCHEMA_ID)) {
                    const response = await fetch(SCHEMA_URL);
                    const actionsSchema = await response.json();

                    // Modify the schema to allow additional properties in Input
                    if (actionsSchema.$defs && actionsSchema.$defs.Input) {
                        actionsSchema.$defs.Input.additionalProperties = true;
                    }

                    ajv.addSchema(actionsSchema, SCHEMA_ID);
                }

                actionsSchemaValidation = ajv.getSchema(SCHEMA_ID);
                this.actionsFileError = null;
            } catch (err) {
                this.actionsFileError = "Schema setup failed.";
            }
        }
    }

    async updateCustomEntitySelection(checked: boolean) {
        // Check if actions file has been uploaded before allowing custom entity selection
        if (checked && !this.packageOptions.windowsActions?.manifest) {
            this.supportCustomEntity = false;
            this.customEntitiesFileError = "Please upload an ActionsManifest.json file first before enabling Custom Entity support.";

            // Reset the checkbox to unchecked
            const customEntityCheckbox = this.shadowRoot?.querySelector('#custom-entity-checkbox') as HTMLInputElement;
            if (customEntityCheckbox) {
                customEntityCheckbox.checked = false;
            }
            return;
        }

        this.supportCustomEntity = checked;

        if (!checked) {
            if (this.packageOptions.windowsActions) {
                delete this.packageOptions.windowsActions.customEntities;
                delete this.packageOptions.windowsActions.customEntitiesLocalizations;
            }
            customEntitySchemaValidation = null;
            this.customEntitiesFileError = null;
            this.localizedEntitiesErrors = [];
        } else {
            try {
                if (!ajv.getSchema(CUSTOM_ENTITY_SCHEMA_ID)) {
                    ajv.addSchema(CUSTOM_ENTITY_SCHEMA, CUSTOM_ENTITY_SCHEMA_ID);
                }

                customEntitySchemaValidation = ajv.getSchema(CUSTOM_ENTITY_SCHEMA_ID);
                this.customEntitiesFileError = null;

            } catch (err) {
                this.customEntitiesFileError = "Custom Entity schema setup failed.";
            }
        }
    }

    async customEntitiesFileChanged(e: Event): Promise<void> {
        if (!e) return;

        if (!customEntitySchemaValidation) {
            this.customEntitiesFileError = "Custom Entity schema validation not available. Please try again.";
            return;
        }

        const input = e.target as HTMLInputElement;
        const file = input.files?.[0];

        if (file) {
            // Update the display text to show the selected file name
            const customEntitiesText = this.shadowRoot?.querySelector('#custom-entities-picker-text');
            const customEntitiesButton = this.shadowRoot?.querySelector('#custom-entities-file-picker')?.parentElement;

            if (customEntitiesText) {
                customEntitiesText.textContent = file.name;
            }

            // Clear any previous states
            if (customEntitiesButton) {
                customEntitiesButton.classList.remove('has-file', 'has-error');
                customEntitiesButton.classList.add('has-file');
            }

            const reader = new FileReader();

            reader.onload = (): void => {
                try {
                    const text: string = reader.result as string;
                    const parsed = JSON.parse(text);

                    const isValid = customEntitySchemaValidation(parsed);
                    if (!isValid) {
                        const errorDetails = ajv.errorsText(customEntitySchemaValidation.errors, { separator: '\n' });
                        throw new Error(`Custom Entity schema validation failed:\n${errorDetails}`);
                    }

                    // Store the valid custom entities content
                    if (!this.packageOptions.windowsActions) {
                        this.packageOptions.windowsActions = { manifest: {} };
                    }
                    this.packageOptions.windowsActions.customEntities = parsed;
                    this.customEntitiesFileError = null;

                    // Show success state
                    if (customEntitiesButton) {
                        customEntitiesButton.classList.remove('has-error');
                        customEntitiesButton.classList.add('has-file');
                    }

                } catch (err) {
                    this.customEntitiesFileError = (err as Error).message;

                    // Show error state but keep filename
                    if (customEntitiesButton) {
                        customEntitiesButton.classList.remove('has-file');
                        customEntitiesButton.classList.add('has-error');
                    }
                }
            };

            reader.onerror = (): void => {
                this.customEntitiesFileError = 'Failed to read the file. Please try again.';

                // Show error state but keep filename
                if (customEntitiesButton) {
                    customEntitiesButton.classList.remove('has-file');
                    customEntitiesButton.classList.add('has-error');
                }
            };

            reader.readAsText(file);
        } else {
            // No file selected - reset the display
            const customEntitiesText = this.shadowRoot?.querySelector('#custom-entities-picker-text');
            const customEntitiesButton = this.shadowRoot?.querySelector('#custom-entities-file-picker')?.parentElement;

            if (customEntitiesText) {
                customEntitiesText.textContent = 'No file chosen';
            }

            if (customEntitiesButton) {
                customEntitiesButton.classList.remove('has-file', 'has-error');
            }

            this.customEntitiesFileError = null;
        }
    }

    async localizedEntitiesFolderChanged(e: Event) {
        if (!e) return;

        const input = e.target as HTMLInputElement;
        const files = input.files;
        const folderText = this.shadowRoot?.querySelector('#folder-picker-text');
        const folderWrapper = this.shadowRoot?.querySelector('#localized-entities-folder-picker')?.parentElement;

        if (files && files.length > 0) {
            // Reset any previous error states and clear errors
            this.localizedEntitiesErrors = [];
            if (folderWrapper) {
                folderWrapper.classList.remove('has-file', 'has-error');
            }

            // Update the display text to show validation in progress
            if (folderText) {
                folderText.textContent = `${files.length} files selected - validating...`;
            }

            // Start immediate pre-validation
            const validationResults = await this.validateLocalizedEntitiesFiles(files);

            if (validationResults.isValid) {
                // All files are valid
                if (folderText) {
                    folderText.textContent = `✅ All ${files.length} files are valid`;
                }
                if (folderWrapper) {
                    folderWrapper.classList.add('has-file');
                }

                // Store the valid files in packageOptions
                if (!this.packageOptions.windowsActions) {
                    this.packageOptions.windowsActions = { manifest: {} };
                }
                this.packageOptions.windowsActions.customEntitiesLocalizations = validationResults.validFiles.map(file => ({
                    fileName: file.name,
                    contents: JSON.parse(file.content)
                }));
            } else {
                // Some files failed validation
                const validCount = validationResults.validFiles.length;
                const totalCount = files.length;
                const failedCount = totalCount - validCount;

                if (folderText) {
                    folderText.textContent = `❌ ${failedCount} of ${totalCount} files failed validation`;
                }
                if (folderWrapper) {
                    folderWrapper.classList.add('has-error');
                }

                // Display validation errors immediately
                this.displayLocalizedEntitiesErrors(validationResults.errors);
            }
        } else {
            // No files selected - reset the display
            if (folderText) {
                folderText.textContent = 'No folder selected';
            }
            if (folderWrapper) {
                folderWrapper.classList.remove('has-file', 'has-error');
            }

            // Clear any stored errors
            this.localizedEntitiesErrors = [];
        }
    }

    openFolderPicker() {
        const folderInput = this.shadowRoot?.querySelector('#localized-entities-folder-picker') as HTMLInputElement;
        if (folderInput) {
            folderInput.click();
        }
    }

    openActionsPicker() {
        const actionsInput = this.shadowRoot?.querySelector('#actions-file-picker') as HTMLInputElement;
        if (actionsInput) {
            actionsInput.click();
        }
    }

    openCustomEntitiesPicker() {
        const customEntitiesInput = this.shadowRoot?.querySelector('#custom-entities-file-picker') as HTMLInputElement;
        if (customEntitiesInput) {
            customEntitiesInput.click();
        }
    }

    base64ToArrayBuffer(b64: string) {
        const binStr = atob(b64);
        const len = binStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binStr.charCodeAt(i);
        }
        return bytes.buffer;
    }

    async actionsFileChanged(e: Event): Promise<void> {
        if (!e) {
            return;
        }

        if (!actionsSchemaValidation) {
            this.actionsFileError = "Schema validation not available. Please try again.";
            return;
        }

        const input = e.target as HTMLInputElement;
        const file = input.files?.[0];

        if (file) {
            // Update the upload zone to show the selected file name
            const uploadZone = this.shadowRoot?.querySelector('.actions-file-upload-zone') as HTMLElement;
            const uploadText = uploadZone?.querySelector('.upload-text') as HTMLElement;

            if (uploadZone && uploadText) {
                uploadZone.classList.add('has-file');
                uploadZone.classList.remove('has-error'); // Clear any previous error state
                uploadText.textContent = file.name;
            }

            const reader = new FileReader();

            reader.onload = (): void => {
                try {
                    const text: string = reader.result as string;
                    const parsed = JSON.parse(text);

                    const isValid = actionsSchemaValidation(parsed);

                    if (!isValid) {
                        const errorDetails = ajv.errorsText(actionsSchemaValidation.errors, { separator: '\n' });
                        throw new Error(`Schema validation failed:\n${errorDetails}`);
                    }

                    this.packageOptions = {
                        ...this.packageOptions,
                        windowsActions: { manifest: parsed }
                    };
                    this.actionsFileError = null;

                    // Clear any error state and show success state
                    if (uploadZone) {
                        uploadZone.classList.remove('has-error');
                        uploadZone.classList.add('has-file');
                    }

                } catch (err) {
                    this.actionsFileError = (err as Error).message;

                    // Keep the filename displayed but add error styling
                    if (uploadZone) {
                        uploadZone.classList.remove('has-file');
                        uploadZone.classList.add('has-error');
                    }
                }
            };

            reader.onerror = (): void => {
                this.actionsFileError = 'Failed to read the file. Please try again.';

                // Keep the filename displayed but add error styling
                if (uploadZone) {
                    uploadZone.classList.remove('has-file');
                    uploadZone.classList.add('has-error');
                }
            };

            reader.readAsText(file);
        } else {
            // No file selected - reset the display
            this.resetActionsUploadZone();
            this.actionsFileError = null;
        }
    }

    /**
     * Resets the actions upload zone to its default state
     */
    private resetActionsUploadZone(): void {
        const uploadZone = this.shadowRoot?.querySelector('.actions-file-upload-zone') as HTMLElement;
        const uploadText = uploadZone?.querySelector('.upload-text') as HTMLElement;

        if (uploadZone && uploadText) {
            uploadZone.classList.remove('has-file');
            uploadText.textContent = 'Click to upload ActionsManifest.json';
        }
    }

    /**
     * Validates localized entities files for JSON format and proper naming conventions
     */
    private async validateLocalizedEntitiesFiles(files: FileList): Promise<{
        isValid: boolean;
        validFiles: Array<{ name: string; content: string; languageTag: string }>;
        errors: string[];
    }> {
        const validFiles: Array<{ name: string; content: string; languageTag: string }> = [];
        const errors: string[] = [];

        // Filename pattern for localized custom entities
        // Pattern 1: {basename}.json (for default/base files)
        // Pattern 2: {basename}.language-{language-tag}.json (for localized files)
        const baseFilePattern = /^(.+)\.json$/;
        const localizedFilePattern = /^(.+)\.language-([a-z]{2,3}(-[A-Z][a-z]{3})?(-[A-Z]{2}|[0-9]{3})?)\.json$/i;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileName = file.name;

            try {
                // Step 1: Check if filename follows either valid pattern
                const baseMatch = baseFilePattern.exec(fileName);
                const localizedMatch = localizedFilePattern.exec(fileName);

                if (!baseMatch && !localizedMatch) {
                    const error = `"${fileName}" - Invalid filename format. Expected format: "ExampleFile.json" or "ExampleFile.language-{language-tag}.json" (e.g., "CustomEntity.json" or "CustomEntity.language-en.json")`;
                    errors.push(error);
                    continue;
                }

                // Step 2: Extract and validate language tag if it's a localized file
                let languageTag = 'default'; // Default for base files without language tag

                if (localizedMatch) {
                    // This is a localized file with language tag
                    languageTag = localizedMatch[2]; // The language tag part after "language-"

                    // Validate that it's a proper BCP-47 format
                    if (!this.isValidLanguageTag(languageTag)) {
                        const error = `"${fileName}" - Invalid language tag "${languageTag}". Must be valid BCP-47 format like "en", "en-US", "fr-CA", or "zh-Hans-CN"`;
                        errors.push(error);
                        continue;
                    }
                } else if (baseMatch) {
                    // This is a base file - check it doesn't look like it should be a localized file
                    const suspiciousPattern = /^(.+)\.[a-z]{2}(-[A-Z]{2})?\.json$/i;
                    if (suspiciousPattern.test(fileName)) {
                        const error = `"${fileName}" - This looks like a localized file but is missing the "language-" prefix. Did you mean "${fileName.replace(/\.([a-z]{2}(-[A-Z]{2})?)\.json$/i, '.language-$1.json')}"?`;
                        errors.push(error);
                        continue;
                    }
                }

                // Step 3: Read and validate JSON content
                let content: string;
                try {
                    content = await this.readFileAsText(file);
                } catch (readError) {
                    const error = `"${fileName}" - Failed to read file: ${(readError as Error).message}`;
                    errors.push(error);
                    continue;
                }

                // Step 4: Validate JSON structure
                try {
                    JSON.parse(content); // Just validate it's proper JSON

                    // File is valid
                    validFiles.push({
                        name: fileName,
                        content: content,
                        languageTag: languageTag
                    });

                } catch (jsonError) {
                    const error = `"${fileName}" - Invalid JSON format: ${(jsonError as Error).message}`;
                    errors.push(error);
                }

            } catch (unexpectedError) {
                const error = `"${fileName}" - Unexpected error during validation: ${(unexpectedError as Error).message}`;
                errors.push(error);
            }
        }

        const result = {
            isValid: errors.length === 0,
            validFiles,
            errors
        };

        return result;
    }

    /**
     * Validates if a string is a proper BCP-47 language tag
     */
    private isValidLanguageTag(tag: string): boolean {
        // BCP-47 language tag validation
        // Format: language[-script][-region]
        // language: 2-3 lowercase letters (required)
        // script (optional): 4 letters, first uppercase, rest lowercase
        // region (optional): 2 uppercase letters OR 3 digits

        const parts = tag.split('-');

        if (parts.length === 0 || parts.length > 3) {
            return false;
        }

        // Validate language subtag (required)
        const language = parts[0];
        if (!/^[a-z]{2,3}$/.test(language)) {
            return false;
        }

        // If there are more parts, validate script and/or region
        if (parts.length >= 2) {
            const secondPart = parts[1];

            // Check if second part is script (4 letters, first uppercase)
            const isScript = /^[A-Z][a-z]{3}$/.test(secondPart);

            // Check if second part is region (2 uppercase letters or 3 digits)
            const isRegion = /^([A-Z]{2}|[0-9]{3})$/.test(secondPart);

            if (!isScript && !isRegion) {
                return false;
            }

            // If there's a third part, validate it
            if (parts.length === 3) {
                const thirdPart = parts[2];

                // Third part should be region if second was script
                if (isScript) {
                    if (!/^([A-Z]{2}|[0-9]{3})$/.test(thirdPart)) {
                        return false;
                    }
                } else {
                    // If second part was region, third part is not expected in our basic validation
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Reads a file as text asynchronously
     */
    private readFileAsText(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                resolve(reader.result as string);
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsText(file);
        });
    }

    /**
     * Displays localized entities validation errors in the UI
     */
    private displayLocalizedEntitiesErrors(errors: string[]): void {
        this.localizedEntitiesErrors = errors;
    }

    public getPackageOptions(): PackageOptions {
        return this.packageOptions;
    }

    public getForm(): HTMLFormElement {
        return this.shadowRoot!.querySelector("form")!;
    }

    renderMultiSelect(formInput: FormInput): TemplateResult {
        return html`
      <label for="${formInput.inputId}">
        ${formInput.label}
        ${this.renderTooltip(formInput)}
      </label>
      <div id="multiSelectBox">
        <div class="multi-wrap">
          <p class="sub-multi">Select Multiple Languages</p>
          <wa-select id="languageDrop"
            placeholder="Select one or more languages"
            @change=${(e: any) => this.packageOptions.resourceLanguage = e.target.value}
            value=${this.packageOptions.resourceLanguage!}
            multiple
            .maxOptionsVisible=${5}
            size="s"
          >
          ${windowsLanguages.map((lang: any) =>
            html`
              ${lang.codes.map((code: string) =>
                html`
                  <wa-option value=${code}>${lang.name} - ${code}</wa-option>
                `
            )}
            `
        )}
          </wa-select>
        </div>
      </div>
    `;
    }

    renderColorToggle(formInput: FormInput): TemplateResult {
        return html`
      <label for="${formInput.inputId}">
        ${formInput.label}
        ${this.renderTooltip(formInput)}
      </label>
      <div id="iconColorPicker">
        <div class="color-wrap">
          <p class="sub-multi">Select your Windows icons background color</p>
          <wa-radio-group
            id="icon-bg-radio-group"
            .value=${'transparent'}
            @change=${() => this.toggleIconBgRadios()}
          >
            <wa-radio class="color-radio" size="s" value="transparent">Transparent</wa-radio>
            <wa-radio class="color-radio" size="s" value="custom">Custom Color</wa-radio>
          </wa-radio-group>
          ${this.customSelected ? html`
            ${this.renderFormInput(formInput)}
          ` : null}
        </div>
      </div>
    `;
    }

    toggleIconBgRadios() {
        let input = (this.shadowRoot?.getElementById("icon-bg-radio-group") as any);
        let selected = input.value;

        // update values
        if (this.customSelected) {
            this.packageOptions.images!.backgroundColor = 'transparent';
        } else {
            this.packageOptions.images!.backgroundColor = this.initialBgColor;
            this.currentSelectedColor = this.initialBgColor;
        }

        // switch flag which will trigger update
        this.customSelected = selected !== 'transparent';
    }

    render() {
        const customEntitiesClass = `no-form-data-restoration ${this.packageOptions.windowsActions?.manifest ? "" : " d-none"}`;
        return html`
    <div id="form-holder">
      <form
        id="windows-options-form"
        slot="modal-form"
        style="width: 100%"
      >
        <div id="form-layout">
          <div class="basic-settings">
            <div class="form-group">
              ${this.renderFormInput({
            label: 'Package ID',
            tooltip: `The Package ID uniquely identifying your app in the Microsoft Store. Get this value from Microsoft Partner Center.`,
            tooltipLink:
                'https://blog.pwabuilder.com/docs/finding-your-windows-publisher-info/',
            inputId: 'package-id-input',
            required: true,
            placeholder: 'MyCompany.MyApp',
            value: this.packageOptions.packageId,
            minLength: 3,
            maxLength: 50,
            spellcheck: false,
            pattern: '[a-zA-Z0-9.\\-]*$',
            validationErrorMessage:
                'Package ID must contain only letters, numbers, period, or hyphen.',
            inputHandler: (val: string) =>
                (this.packageOptions.packageId = val),
        })}
            </div>
            <div class="form-group">
              ${this.renderFormInput({
            label: 'Publisher ID',
            tooltip: `The ID of your app's publisher. Get this value from Microsoft Partner Center.`,
            tooltipLink:
                'https://blog.pwabuilder.com/docs/finding-your-windows-publisher-info/',
            inputId: 'publisher-id-input',
            placeholder: 'CN=3a54a224-05dd-42aa-85bd-3f3c1478fdca',
            value: this.packageOptions.publisher.commonName,
            validationErrorMessage:
                'Publisher ID must be in the format CN=XXXX. Get your publisher ID from Partner Center.',
            pattern: 'CN=.+',
            required: true,
            spellcheck: false,
            minLength: 4,
            inputHandler: (val: string) =>
                (this.packageOptions.publisher.commonName = val),
        })}
            </div>
            <div class="form-group">
              ${this.renderFormInput({
            label: 'Publisher display name',
            tooltip: `The display name of your app's publisher. Gets this value from Microsoft Partner Center.`,
            tooltipLink:
                'https://blog.pwabuilder.com/docs/finding-your-windows-publisher-info/',
            inputId: 'publisher-display-name-input',
            required: true,
            minLength: 3,
            spellcheck: false,
            value: this.packageOptions.publisher.displayName,
            validationErrorMessage:
                'Publisher display name must be at least 3 characters. Get this value from Microsoft Partner Center.',
            placeholder: 'Contoso Inc',
            inputHandler: (val: string) => this.packageOptions.publisher.displayName = val,
        })}
            </div>
          </div>
          <!-- "all settings" section of the modal -->
          <wa-details>
            <div class="details-summary" slot="summary">
              All Settings
            </div>
            <div class="adv-settings">
              <div class="form-group">
                ${this.renderFormInput({
            label: 'App name',
            tooltip: `The name of your app. This is displayed to users in the Store.`,
            tooltipLink:
                'https://docs.microsoft.com/en-us/uwp/schemas/appxpackage/uapmanifestschema/element-displayname',
            inputId: 'app-name-input',
            required: true,
            minLength: 1,
            maxLength: 256,
            value: this.packageOptions.name,
            placeholder: 'My Awesome PWA',
            pattern: AppNameInputPattern,
            validationErrorMessage:
                'App name must not include special characters and be between 1 and 256 characters',
            inputHandler: (val: string) =>
                (this.packageOptions.name = val),
        })}
              </div>
              <div class="form-group">
                ${this.renderFormInput({
            label: 'App version',
            tooltip: `Your app version in the form of '1.0.0'. It must not start with zero and must be greater than classic package version. For new apps, this should be set to 1.0.1`,
            tooltipLink:
                'https://blog.pwabuilder.com/docs/what-is-a-classic-package/',
            inputId: 'version-input',
            required: true,
            minLength: 5,
            value: this.packageOptions.version,
            placeholder: '1.0.1',
            spellcheck: false,
            pattern: '^[^0]+\\d*.\\d+.\\d+$',
            validationErrorMessage:
                "Version must be in the form of '1.0.0', cannot start with zero, and must be greater than classic version",
            inputHandler: (val: string) =>
                (this.packageOptions.version = val),
        })}
              </div>
              <div class="form-group">
                ${this.renderFormInput({
            label: 'Classic app version',
            tooltip: `The version of your app that runs on older versions of Windows. Must be in the form of '1.0.0', it cannot start with zero, and must be less than app version. For new apps, this should be set to 1.0.0`,
            tooltipLink:
                'https://blog.pwabuilder.com/docs/what-is-a-classic-package/',
            inputId: 'classic-version-input',
            required: true,
            minLength: 5,
            value: this.packageOptions.classicPackage?.version,
            placeholder: '1.0.0',
            pattern: '^[^0]+\\d*.\\d+.\\d+$',
            validationErrorMessage:
                "Classic app version must be in the form of '1.0.0', cannot start with zero, and must be less than than app version",
            inputHandler: (val: string) =>
                (this.packageOptions.classicPackage!.version = val),
        })}
              </div>
              <div class="form-group">
                ${this.renderFormInput({
            label: 'Icon URL',
            tooltip: `The URL of an icon to use for your app. This should be a 512x512 or larger, square PNG image. Additional Windows image sizes will be fetched from your manifest, and any missing Windows image sizes will be generated by PWABuilder. The URL can be an absolute path or relative to your manifest.`,
            tooltipLink:
                'https://blog.pwabuilder.com/docs/image-recommendations-for-windows-pwa-packages/',
            inputId: 'icon-url-input',
            required: true,
            type: 'text', // NOTE: can't use URL here, because we allow relative paths.
            minLength: 2,
            validationErrorMessage:
                'Must be an absolute URL or a URL relative to your manifest',
            value: this.packageOptions.images?.baseImage || '',
            placeholder: '/images/512x512.png',
            inputHandler: (val: string) =>
                (this.packageOptions.images!.baseImage = val),
        })}
              </div>
              <div class="form-group">
                ${this.renderColorToggle({
            label: 'Icon Background Color',
            tooltip: `Optional. The background color of the Windows icons that will be generated with your .msix.`,
            tooltipLink:
                'https://learn.microsoft.com/en-us/windows/apps/design/style/iconography/app-icon-design#color-contrast',
            inputId: 'icon-bg-color-input',
            type: 'color',
            value: this.packageOptions.images?.backgroundColor!,
            placeholder: 'transparent',
            inputHandler: (val: string) => this.packageOptions.images!.backgroundColor = val,
        })}
              </div>
              <div class="form-group">
                ${this.renderMultiSelect({
            label: 'Language',
            tooltip: `Optional. Select as many languages as your app supports. Additional languages can be specified in Microsoft Partner Center. If empty, EN-US will be used.`,
            tooltipLink:
                'https://docs.microsoft.com/en-us/windows/uwp/publish/supported-languages',
            inputId: 'language-input',
            value: this.packageOptions.resourceLanguage,
            placeholder: 'EN-US',
            inputHandler: (val: string) =>
                (this.packageOptions.resourceLanguage = val),
        })}
              </div>
              <div class="form-group" id="target-device-families">
                <label>Target device families</label>
                <div class="form-check">
                  ${this.renderFormInput({
            label: 'Desktop',
            value: 'Desktop',
            tooltip:
                'Identifies the device family that your package targets. Both Desktop and Holographic are enabled by default',
            tooltipLink:
                'https://docs.microsoft.com/en-us/uwp/schemas/appxpackage/uapmanifestschema/element-targetdevicefamily',
            inputId: 'device-family-input-desktop',
            type: 'checkbox',
            checked: true,
            inputHandler: (val: string, checked: boolean) => {
                this.addOrRemoveDeviceFamily(val, checked);
            },
        })}
                </div>
                <div class="form-check">
                  ${this.renderFormInput({
            label: 'Holographic (HoloLens)',
            value: 'Holographic',
            tooltip:
                'Identifies the device family that your package targets. Both Desktop and Holographic are enabled by default',
            tooltipLink:
                'https://docs.microsoft.com/en-us/uwp/schemas/appxpackage/uapmanifestschema/element-targetdevicefamily',
            inputId: 'device-family-input-holographic',
            type: 'checkbox',
            checked: true,
            inputHandler: (val: string, checked: boolean) => {
                this.addOrRemoveDeviceFamily(val, checked);
            },
        })}
                </div>
                <div class="form-check">
                  ${this.renderFormInput({
            label: 'Surface Hub (Team)',
            value: 'Team',
            tooltip:
                'Identifies the device family that your package targets.',
            tooltipLink:
                'https://docs.microsoft.com/en-us/uwp/schemas/appxpackage/uapmanifestschema/element-targetdevicefamily',
            inputId: 'device-family-input-team',
            type: 'checkbox',
            checked: false,
            inputHandler: (val: string, checked: boolean) => {
                this.addOrRemoveDeviceFamily(val, checked);
            },
        })}
                </div>
              </div>
              <div class="form-group" id="widgets-picker">
                <label>Widgets</label>
                <div class="form-check">
                  ${this.renderFormInput({
            label: 'Enable Widgets',
            value: 'Widgets',
            tooltip:
                'Enables your Windows package to serve the widgets listed in your web manifest to the Widgets Panel.',
            tooltipLink:
                'https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/widgets',
            inputId: 'widget-checkbox',
            type: 'checkbox',
            checked: this.packageOptions.enableWebAppWidgets,
            disabled: !this.packageOptions.enableWebAppWidgets,
            disabledTooltipText: "You must have widgets set up in your web manifest to enable Widgets for your Windows package.",
            inputHandler: (_val: string, checked: boolean) =>
                (this.packageOptions.enableWebAppWidgets = checked),
        })}
                </div>
              </div>
              <div class="form-group" id="actions-picker">
                <label>Actions</label>
                <div class="form-check">
                  ${this.renderFormInput({
            classes: "no-form-data-restoration",
            label: 'Enable Actions',
            value: 'Actions',
            tooltip:
                'Enables your Windows package to serve the actions listed in your ActionsManifest.json.',
            tooltipLink:
                'https://aka.ms/pwa-winaction',
            inputId: 'actions-checkbox',
            type: 'checkbox',
            checked: this.showUploadActionsFile,
            disabled: (!this.packageOptions.manifest?.share_target || !this.packageOptions.manifest?.protocol_handlers),
            disabledTooltipText: "You must have both share_target and protocol_handlers set up in your web manifest to enable Actions.",
            inputHandler: (_val: string, checked: boolean) => this.updateActionsSelection(checked),
        })}
                </div>
                ${this.showUploadActionsFile ?
                html`
                    <div class="actions-nested-content">
                      <div class="actions-file-upload-zone" @click=${this.openActionsPicker}>
                        <div class="upload-icon">📄</div>
                        <div class="upload-text">Upload ActionsManifest.json</div>
                        <input id="actions-file-picker" class="no-form-data-restoration ${classMap({ 'actions-error': this.actionsFileError !== null })}" type="file" accept=".json" @change=${(e: Event) => this.actionsFileChanged(e)} style="display: none;"/>
                      </div>
                      ${this.actionsFileError ? html`<div class="actions-error-message">${this.actionsFileError}</div>` : ''}
                      <div class="form-check">
                        ${this.renderFormInput({
                    classes: customEntitiesClass,
                    label: this.packageOptions?.windowsActions?.manifest ? 'Support Custom Entity' : '',
                    value: 'CustomEntity',
                    tooltip: this.packageOptions?.windowsActions?.manifest ? 'Enables support for custom entities in your Actions manifest.' : '',
                    tooltipLink:
                        'https://aka.ms/pwa-winaction',
                    inputId: 'custom-entity-checkbox',
                    type: 'checkbox',
                    checked: this.supportCustomEntity,
                    disabledTooltipText: "You must upload an ActionsManifest.json file first before enabling Custom Entity support.",
                    inputHandler: (_val: string, checked: boolean) =>
                        (this.updateCustomEntitySelection(checked)),
                })}
                      </div>
                      ${this.supportCustomEntity ?
                        html`
                          <div class="custom-entity-uploads">
                            <div class="form-group">
                              <label for="custom-entities-file-picker">Upload JSON file for CustomEntities:</label>
                              <div class="file-picker-wrapper">
                                <wa-button type="button" appearance="outlined" size="s" class="file-picker-button" @click=${this.openCustomEntitiesPicker}>Choose File</wa-button>
                                <input id="custom-entities-file-picker" class="no-form-data-restoration" type="file" accept=".json" @change=${(e: Event) => this.customEntitiesFileChanged(e)} style="display: none;"/>
                                <span class="file-picker-text" id="custom-entities-picker-text">No file chosen</span>
                              </div>
                              ${this.customEntitiesFileError ? html`<div class="custom-entities-error-message">${this.customEntitiesFileError}</div>` : ''}
                            </div>
                            <div class="form-group">
                              <label for="localized-entities-folder-picker">Upload localized custom entities files (optional):</label>
                              <div class="folder-picker-wrapper">
                                <wa-button type="button" appearance="outlined" size="s" class="folder-picker-button" @click=${this.openFolderPicker}>Select Folder</wa-button>
                                <input id="localized-entities-folder-picker" class="no-form-data-restoration" type="file" webkitdirectory multiple @change=${(e: Event) => this.localizedEntitiesFolderChanged(e)} style="display: none;"/>
                                <span class="folder-picker-text" id="folder-picker-text">No folder selected</span>
                              </div>
                              ${this.localizedEntitiesErrors.length > 0 ?
                                html`
                                  <div class="localized-entities-errors">
                                    <h4>File Validation Errors:</h4>
                                    <ul>
                                      ${this.localizedEntitiesErrors.map(error => html`<li>${error}</li>`)}
                                    </ul>
                                  </div>
                                ` :
                                ''
                            }
                            </div>
                          </div>
                        ` :
                        null
                    }
                    </div>
                  ` :
                null
            }
              </div>
              <div class="form-group" id="app-uri-handler-picker">
                <label>App URI Handler</label>
                <div class="form-check">
                  ${this.renderFormInput({
                label: 'Enable App URI Handler',
                value: 'AppUriHandler',
                tooltip:
                    'Enables your Windows package to handle URIs for your app. This also allows your app to check if your Windows package is installed.',
                tooltipLink:
                    'https://developer.chrome.com/docs/capabilities/get-installed-related-apps#check-windows',
                inputId: 'app-uri-handler-checkbox',
                type: 'checkbox',
                checked: this.packageOptions.extensions === 'appurihandler',
                inputHandler: (_val: string, checked: boolean) =>
                    (this.packageOptions.extensions = checked ? 'appurihandler' : undefined),
            })}
                </div>
              </div>
            </div>
          </wa-details>
        </div>
      </form>
    </div>
    `;
    }
}