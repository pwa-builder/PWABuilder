import generatePassword from 'password-generator';
import type { AndroidPackageOptions } from '../models/androidPackageOptions.js';
import type { AppPackageRequest } from '../models/appPackageRequest.js';
import type { SigningOptions } from '../models/signingOptions.js';
import { validateNewKeySigningOptions } from './signing-options-validation.js';

const malformedOptionsError =
    "Malformed argument. Coudn't find AndroidPackageOptions in body";

/**
 * Validates the untrusted request body for an Android package operation.
 */
export function validateAndroidOptionsRequest(body: unknown): AppPackageRequest {
    const validationErrors: string[] = [];
    const options = tryParseOptionsFromBody(body);
    if (!options) {
        return {
            options: null,
            validationErrors: [malformedOptionsError],
        };
    }

    // Coerce enableNotifications to a proper boolean to prevent Gradle build failures.
    // If the client sends undefined/null/empty, Bubblewrap generates invalid Groovy syntax.
    if (typeof options.enableNotifications !== 'boolean') {
        options.enableNotifications = Boolean(options.enableNotifications);
    }

    const requiredFields: Array<keyof AndroidPackageOptions> = [
        'appVersion',
        'appVersionCode',
        'backgroundColor',
        'display',
        'fallbackType',
        'host',
        'iconUrl',
        'launcherName',
        'navigationColor',
        'packageId',
        'signingMode',
        'startUrl',
        'themeColor',
        'webManifestUrl',
    ];

    if (options.isMetaQuest) {
        requiredFields.push('fullScopeUrl');
    }

    validationErrors.push(
        ...requiredFields
            .filter((field) => !options[field])
            .map((field) => `${field as string} is required`)
    );

    if (options.webManifestUrl) {
        try {
            const manifestUrl = new URL(
                options.webManifestUrl,
                options.fullScopeUrl
            );
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

    const signing = getSigningOptions(options, validationErrors);
    if (signing) {
        validateSigningOptions(options.signingMode, signing, validationErrors);
    }

    return {
        options,
        validationErrors,
    };
}

function tryParseOptionsFromBody(body: unknown): AndroidPackageOptions | null {
    if (!isNonArrayObject(body) || !body.packageId) {
        return null;
    }

    return body as AndroidPackageOptions;
}

function getSigningOptions(
    options: AndroidPackageOptions,
    validationErrors: string[]
): SigningOptions | null {
    if (options.signingMode === 'none') {
        return null;
    }

    const signing: unknown = options.signing;
    if (signing === undefined) {
        validationErrors.push(
            `Signing options are required when signing mode = '${options.signingMode}'`
        );
        return null;
    }

    if (!isNonArrayObject(signing)) {
        validationErrors.push('Signing options must be an object');
        return null;
    }

    return signing as unknown as SigningOptions;
}

function validateSigningOptions(
    signingMode: AndroidPackageOptions['signingMode'],
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

    validateRequiredStringField(signing, 'alias', validationErrors);

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

function validateRequiredStringField(
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

function isNonArrayObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
