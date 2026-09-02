import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { AndroidPackageOptions } from '../models/androidPackageOptions.js';
import type { SigningOptions } from '../models/signingOptions.js';
import { validateAndroidOptionsRequest } from '../routes/project.js';
import { validateNewKeySigningOptions } from '../utils/signing-options-validation.js';

const validSigningOptions: SigningOptions = {
    file: null,
    alias: 'release-key',
    fullName: "Jos\u00e9 O'Connor-Smith_2 (Lead).",
    organization: 'Contoso.Labs_2 (Europe)',
    organizationalUnit: '\u00c9quipe Num\u00e9ro 2',
    countryCode: 'US',
    keyPassword: 'key-password',
    storePassword: 'store-password',
};

const subjectFields = [
    'fullName',
    'organization',
    'organizationalUnit',
] as const;
const signingSubjectFields = [...subjectFields, 'countryCode'] as const;

const malformedSubjectValues: readonly unknown[] = [
    { untrusted: 'object-value' },
    ['array-value'],
    0,
    false,
];

const unsupportedCharacters = [
    '"',
    ',',
    '=',
    ';',
    '|',
    '&',
    '$',
    '`',
    '\n',
    '\t',
    '\\',
] as const;

function withSubjectValue(
    field: (typeof subjectFields)[number],
    value: string
): SigningOptions {
    return {
        ...validSigningOptions,
        [field]: value,
    };
}

function withMalformedSubjectValue(
    field: (typeof signingSubjectFields)[number],
    value: unknown
): SigningOptions {
    const signingOptions = { ...validSigningOptions };
    Reflect.set(signingOptions, field, value);
    return signingOptions;
}

test('accepts supported certificate subject characters and Unicode letters', () => {
    assert.deepEqual(validateNewKeySigningOptions(validSigningOptions), []);
});

for (const field of signingSubjectFields) {
    for (const malformedValue of malformedSubjectValues) {
        test(`rejects a non-string ${field} value (${JSON.stringify(malformedValue)}) without throwing`, () => {
            const signingOptions = withMalformedSubjectValue(
                field,
                malformedValue
            );
            let errors: string[] = [];

            assert.doesNotThrow(() => {
                errors = validateNewKeySigningOptions(signingOptions);
            });

            const expectedError =
                field === 'countryCode'
                    ? 'Signing option countryCode must contain exactly two letters'
                    : `Signing option ${field} contains unsupported characters`;
            assert.deepEqual(errors, [expectedError]);

            const serializedValue = JSON.stringify(malformedValue);
            assert.equal(
                errors.some((error) => error.includes(serializedValue)),
                false
            );
        });
    }
}

test('route validation rejects a non-string DName value without throwing', () => {
    const malformedValue = {
        untrusted: 'route-value',
    };
    const signingOptions = withMalformedSubjectValue(
        'fullName',
        malformedValue
    );
    const body: AndroidPackageOptions = {
        analysisId: null,
        appVersion: '1.0.0',
        appVersionCode: 1,
        backgroundColor: '#ffffff',
        display: 'standalone',
        enableNotifications: true,
        fallbackType: 'customtabs',
        host: 'example.com',
        iconUrl: 'https://example.com/icon.png',
        includeSourceCode: false,
        launcherName: 'Example',
        name: 'Example',
        navigationColor: '#000000',
        packageId: 'com.example.app',
        pwaUrl: 'https://example.com/',
        signing: signingOptions,
        signingMode: 'new',
        splashScreenFadeOutDuration: 0,
        startUrl: '/',
        themeColor: '#ffffff',
        webManifestUrl: 'https://example.com/manifest.json',
    };
    let errors: string[] = [];

    assert.doesNotThrow(() => {
        errors = validateAndroidOptionsRequest({ body }).validationErrors;
    });

    assert.deepEqual(errors, [
        'Signing option fullName contains unsupported characters',
    ]);
    assert.equal(
        errors.some((error) => error.includes(JSON.stringify(malformedValue))),
        false
    );
});

for (const field of subjectFields) {
    for (const character of unsupportedCharacters) {
        test(`rejects an unsupported character in ${field}`, () => {
            const submittedValue = `before${character}after`;
            const errors = validateNewKeySigningOptions(
                withSubjectValue(field, submittedValue)
            );

            assert.deepEqual(errors, [
                `Signing option ${field} contains unsupported characters`,
            ]);
            assert.equal(errors.some((error) => error.includes(submittedValue)), false);
        });
    }

    test(`rejects a leading tab in ${field}`, () => {
        assert.deepEqual(
            validateNewKeySigningOptions(
                withSubjectValue(field, '\tCertificate subject')
            ),
            [`Signing option ${field} contains unsupported characters`]
        );
    });

    test(`rejects a trailing newline in ${field}`, () => {
        assert.deepEqual(
            validateNewKeySigningOptions(
                withSubjectValue(field, 'Certificate subject\n')
            ),
            [`Signing option ${field} contains unsupported characters`]
        );
    });

    test(`rejects a whitespace-only ${field}`, () => {
        assert.deepEqual(
            validateNewKeySigningOptions(withSubjectValue(field, ' \t ')),
            [`Signing option ${field} must not be blank`]
        );
    });

    test(`rejects ${field} values longer than 128 code points`, () => {
        assert.deepEqual(
            validateNewKeySigningOptions(withSubjectValue(field, 'a'.repeat(129))),
            [`Signing option ${field} must contain at most 128 characters`]
        );
    });

    test(`rejects ${field} values with 128 letters and one ASCII space`, () => {
        assert.deepEqual(
            validateNewKeySigningOptions(
                withSubjectValue(field, `${'a'.repeat(128)} `)
            ),
            [`Signing option ${field} must contain at most 128 characters`]
        );
    });

    test(`accepts ${field} values containing exactly 128 code points`, () => {
        assert.deepEqual(
            validateNewKeySigningOptions(
                withSubjectValue(field, `${'a'.repeat(127)} `)
            ),
            []
        );
    });
}

for (const countryCode of [
    'U',
    'USA',
    '1A',
    'U$',
    ' US',
    '\nUS',
    'U\n',
    'US\n',
]) {
    test('rejects a country code that is not exactly two ASCII letters', () => {
        const errors = validateNewKeySigningOptions({
            ...validSigningOptions,
            countryCode,
        });

        assert.deepEqual(errors, [
            'Signing option countryCode must contain exactly two letters',
        ]);
        assert.equal(errors.some((error) => error.includes(countryCode)), false);
    });
}
