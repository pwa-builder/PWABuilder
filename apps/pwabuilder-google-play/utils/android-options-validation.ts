import generatePassword from 'password-generator';
import type { AndroidPackageOptions } from '../models/androidPackageOptions.js';
import type { AppPackageRequest } from '../models/appPackageRequest.js';
import type { SigningOptions } from '../models/signingOptions.js';
import { validateNewKeySigningOptions } from './signing-options-validation.js';

const malformedOptionsError =
    "Malformed argument. Coudn't find AndroidPackageOptions in body";

const requiredStringFields = [
    'appVersion',
    'backgroundColor',
    'host',
    'iconUrl',
    'launcherName',
    'navigationColor',
    'startUrl',
    'themeColor',
] as const;

const displayValues = [
    'standalone',
    'fullscreen',
    'fullscreen-sticky',
] as const;
const fallbackTypeValues = ['customtabs', 'webview'] as const;
const signingModeValues = ['new', 'none', 'mine'] as const;

type SigningMode = (typeof signingModeValues)[number];

/**
 * Validates the untrusted request body for an Android package operation.
 */
export function validateAndroidOptionsRequest(body: unknown): AppPackageRequest {
    if (!isNonArrayObject(body)) {
        return {
            options: null,
            validationErrors: [malformedOptionsError],
        };
    }

    const validationErrors: string[] = [];
    const packageId = validateRequiredStringField(
        body,
        'packageId',
        validationErrors
    );
    if (packageId === null) {
        return {
            options: null,
            validationErrors,
        };
    }

    const options = body as unknown as AndroidPackageOptions;

    for (const field of requiredStringFields) {
        validateRequiredStringField(body, field, validationErrors);
    }

    validateRequiredFiniteNumberField(
        body,
        'appVersionCode',
        validationErrors
    );
    validateEnumeratedField(
        body,
        'display',
        displayValues,
        validationErrors
    );
    validateEnumeratedField(
        body,
        'fallbackType',
        fallbackTypeValues,
        validationErrors
    );
    const signingMode = validateEnumeratedField(
        body,
        'signingMode',
        signingModeValues,
        validationErrors
    );
    const webManifestUrl = validateRequiredStringField(
        body,
        'webManifestUrl',
        validationErrors
    );
    const isMetaQuest = validateOptionalBooleanField(
        body,
        'isMetaQuest',
        validationErrors
    );
    const fullScopeUrl =
        isMetaQuest === true
            ? validateRequiredStringField(
                  body,
                  'fullScopeUrl',
                  validationErrors
              )
            : undefined;

    // Coerce enableNotifications to a proper boolean to prevent Gradle build failures.
    // If the client sends undefined/null/empty, Bubblewrap generates invalid Groovy syntax.
    if (typeof options.enableNotifications !== 'boolean') {
        options.enableNotifications = Boolean(options.enableNotifications);
    }

    if (webManifestUrl !== null && fullScopeUrl !== null) {
        try {
            const manifestUrl = new URL(webManifestUrl, fullScopeUrl);
            if (manifestUrl.protocol !== 'https:') {
                validationErrors.push(
                    'webManifestUrl must be an absolute HTTPS URL'
                );
            }
        } catch {
            validationErrors.push(
                'webManifestUrl must be an absolute HTTPS URL'
            );
        }
    }

    if (signingMode !== null) {
        const signing = getSigningOptions(
            signingMode,
            body.signing,
            validationErrors
        );
        if (signingMode === 'none') {
            options.signing = null;
        } else if (signing) {
            validateSigningOptions(signingMode, signing, validationErrors);
            options.signing = normalizeSigningOptions(signing);
        }
    }

    return {
        options,
        validationErrors,
    };
}

function normalizeSigningOptions(signing: SigningOptions): SigningOptions {
    return {
        file:
            typeof signing.file === 'string' || signing.file === null
                ? signing.file
                : null,
        alias: typeof signing.alias === 'string' ? signing.alias : '',
        fullName:
            typeof signing.fullName === 'string' || signing.fullName === null
                ? signing.fullName
                : null,
        organization:
            typeof signing.organization === 'string' ||
            signing.organization === null
                ? signing.organization
                : null,
        organizationalUnit:
            typeof signing.organizationalUnit === 'string' ||
            signing.organizationalUnit === null
                ? signing.organizationalUnit
                : null,
        countryCode:
            typeof signing.countryCode === 'string' ||
            signing.countryCode === null
                ? signing.countryCode
                : null,
        keyPassword:
            typeof signing.keyPassword === 'string' ? signing.keyPassword : '',
        storePassword:
            typeof signing.storePassword === 'string'
                ? signing.storePassword
                : '',
    };
}

function getSigningOptions(
    signingMode: SigningMode,
    signingValue: unknown,
    validationErrors: string[]
): SigningOptions | null {
    if (signingMode === 'none') {
        return null;
    }

    if (signingValue === undefined) {
        validationErrors.push(
            `Signing options are required when signing mode = '${signingMode}'`
        );
        return null;
    }

    if (!isNonArrayObject(signingValue)) {
        validationErrors.push('Signing options must be an object');
        return null;
    }

    return signingValue as unknown as SigningOptions;
}

function validateSigningOptions(
    signingMode: SigningMode,
    signing: SigningOptions,
    validationErrors: string[]
): void {
    if (signingMode === 'mine') {
        validateExistingKeySigningOptions(signing, validationErrors);
    }

    const passToUse = generatePassword(12, false);
    for (const field of ['keyPassword', 'storePassword'] as const) {
        const value: unknown = signing[field];
        if (value === undefined || value === '') {
            signing[field] = passToUse;
        } else if (typeof value !== 'string') {
            validationErrors.push(`Signing option ${field} must be a string`);
        }
    }

    validateRequiredSigningStringField(signing, 'alias', validationErrors);

    if (signingMode === 'new') {
        validationErrors.push(...validateNewKeySigningOptions(signing));
        for (const field of [
            'countryCode',
            'fullName',
            'organization',
            'organizationalUnit',
        ] as const) {
            const value: unknown = signing[field];
            if (value === undefined || value === null || value === '') {
                validationErrors.push(`Signing option ${field} is required`);
            }
        }
    }
}

function validateExistingKeySigningOptions(
    signing: SigningOptions,
    validationErrors: string[]
): void {
    const signingFile: unknown = signing.file;
    if (
        signingFile === undefined ||
        signingFile === null ||
        signingFile === ''
    ) {
        validationErrors.push(
            "You must supply a signing key file when signing mode = 'mine'"
        );
    } else if (typeof signingFile !== 'string') {
        validationErrors.push('Signing file must be a string');
    } else if (!signingFile.startsWith('data:')) {
        validationErrors.push(
            'Signing file must be a base64 encoded string containing the Android keystore file'
        );
    }

    if (signing.storePassword === undefined || signing.storePassword === '') {
        validationErrors.push(
            "You must supply a store password when signing mode = 'mine'"
        );
    }

    if (signing.keyPassword === undefined || signing.keyPassword === '') {
        validationErrors.push(
            "You must supply a key password when signing mode = 'mine'"
        );
    }
}

function validateEnumeratedField<const T extends string>(
    options: Record<string, unknown>,
    field: string,
    supportedValues: readonly T[],
    validationErrors: string[]
): T | null {
    const value = options[field];
    if (value === undefined || value === '') {
        validationErrors.push(`${field} is required`);
        return null;
    }

    if (!isSupportedValue(value, supportedValues)) {
        validationErrors.push(`${field} has an unsupported value`);
        return null;
    }

    return value;
}

function validateOptionalBooleanField(
    options: Record<string, unknown>,
    field: string,
    validationErrors: string[]
): boolean | undefined {
    const value = options[field];
    if (value === undefined) {
        return undefined;
    }

    if (typeof value !== 'boolean') {
        validationErrors.push(`${field} must be a boolean`);
        return undefined;
    }

    return value;
}

function validateRequiredFiniteNumberField(
    options: Record<string, unknown>,
    field: string,
    validationErrors: string[]
): number | null {
    const value = options[field];
    if (value === undefined || value === '') {
        validationErrors.push(`${field} is required`);
        return null;
    }

    if (typeof value !== 'number' || !Number.isFinite(value)) {
        validationErrors.push(`${field} must be a finite number`);
        return null;
    }

    return value;
}

function validateRequiredSigningStringField(
    signing: SigningOptions,
    field: 'alias',
    validationErrors: string[]
): void {
    const value: unknown = signing[field];
    if (value === undefined || value === '') {
        validationErrors.push(`Signing option ${field} is required`);
    } else if (typeof value !== 'string') {
        validationErrors.push(`Signing option ${field} must be a string`);
    }
}

function validateRequiredStringField(
    options: Record<string, unknown>,
    field: string,
    validationErrors: string[]
): string | null {
    const value = options[field];
    if (value === undefined || value === '') {
        validationErrors.push(`${field} is required`);
        return null;
    } else if (typeof value !== 'string') {
        validationErrors.push(`${field} must be a string`);
        return null;
    }

    return value;
}

function isSupportedValue<T extends string>(
    value: unknown,
    supportedValues: readonly T[]
): value is T {
    return (
        typeof value === 'string' &&
        supportedValues.some((supportedValue) => supportedValue === value)
    );
}

function isNonArrayObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
