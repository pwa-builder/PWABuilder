import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import type { AndroidPackageOptions } from '../models/androidPackageOptions.js';
import type { SigningOptions } from '../models/signingOptions.js';
import { validateAndroidOptionsRequest } from '../utils/android-options-validation.js';
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
const allowedSigningFields = [
    'file',
    'alias',
    'fullName',
    'organization',
    'organizationalUnit',
    'countryCode',
    'keyPassword',
    'storePassword',
] as const;

const malformedSubjectValues: readonly unknown[] = [
    { untrusted: 'object-value' },
    ['array-value'],
    0,
    false,
];

const malformedSigningValues: readonly unknown[] = [
    42,
    'untrusted-signing-value',
    ['array-signing-value'],
    null,
];

const truthyMalformedSigningFieldValues: readonly unknown[] = [
    { untrusted: 'object-value' },
    ['array-value'],
    42,
    true,
];

const malformedCredentialValues: readonly unknown[] = [
    ...truthyMalformedSigningFieldValues,
    null,
    0,
    false,
];

const malformedFileValues: readonly unknown[] = [
    ...truthyMalformedSigningFieldValues,
    false,
];

const requiredStringFields = [
    'appVersion',
    'backgroundColor',
    'host',
    'iconUrl',
    'launcherName',
    'navigationColor',
    'packageId',
    'startUrl',
    'themeColor',
    'webManifestUrl',
] as const;

const malformedRequiredStringValues: readonly unknown[] = [
    { untrusted: 'object-value' },
    ['array-value'],
    42,
    false,
];

const enumeratedFields = [
    'display',
    'fallbackType',
    'signingMode',
] as const;

const malformedEnumeratedValues: readonly unknown[] = [
    { untrusted: 'object-value' },
    ['array-value'],
    42,
    false,
    'unsupported-value',
];

const malformedVersionCodeValues: readonly unknown[] = [
    { untrusted: 'object-value' },
    ['array-value'],
    '1',
    false,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
];

const malformedMetaQuestValues: readonly unknown[] = [
    { untrusted: 'object-value' },
    ['array-value'],
    1,
    'true',
    null,
];

const malformedFullScopeUrlValues: readonly unknown[] = [
    { untrusted: 'object-value' },
    ['array-value'],
    42,
    false,
];

const acceptedSubjectValues = [
    "Ben & Jerry's",
    'Acme: Home',
    'Bob\u2019s Burgers',
    'Rocket \u{1F680}',
    'Cafe\u0301',
    '\u6771\u4EAC',
    '\u0634\u0631\u0643\u0629 \u062A\u0642\u0646\u064A\u0629',
    '\u0928\u092E\u0938\u094D\u0924\u0947',
    'Dollar $value',
    'Backtick `value',
    'Pipe | value',
    'Ampersand & value',
] as const;

const invalidDNameCharacters = [
    ',',
    '=',
    '+',
    '<',
    '>',
    '#',
    ';',
    '"',
    '\\',
    ...Array.from({ length: 0x20 }, (_, codePoint) =>
        String.fromCodePoint(codePoint)
    ),
    ...Array.from({ length: 0x21 }, (_, offset) =>
        String.fromCodePoint(0x7f + offset)
    ),
    '\u200B',
    '\u200E',
    '\u202A',
    '\u202E',
    '\u2066',
    '\u2069',
    '\uFEFF',
    '\u2028',
    '\u2029',
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

function createValidRequestBody(
    signing: SigningOptions = { ...validSigningOptions }
): AndroidPackageOptions {
    return {
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
        signing,
        signingMode: 'new',
        splashScreenFadeOutDuration: 0,
        startUrl: '/',
        themeColor: '#ffffff',
        webManifestUrl: 'https://example.com/manifest.json',
    };
}

function assertRequestValidationError(
    body: unknown,
    expectedErrors: readonly string[],
    submittedValue: unknown
): void {
    let errors: string[] = [];

    assert.doesNotThrow(() => {
        errors = validateAndroidOptionsRequest(body).validationErrors;
    });

    assert.deepEqual(errors, expectedErrors);
    const submittedRepresentations = [
        typeof submittedValue === 'string' ? submittedValue : undefined,
        JSON.stringify(submittedValue),
    ].filter((value): value is string => Boolean(value));
    assert.equal(
        errors.some((error) =>
            submittedRepresentations.some((value) => error.includes(value))
        ),
        false
    );
}

test('accepts common, international, and shell-metacharacter subject text', () => {
    for (const field of subjectFields) {
        for (const value of acceptedSubjectValues) {
            assert.deepEqual(
                validateNewKeySigningOptions(withSubjectValue(field, value)),
                []
            );
        }
    }
});

test('request validation has no service or server dependencies', async () => {
    const moduleSource = await readFile(
        new URL('../utils/android-options-validation.js', import.meta.url),
        'utf8'
    );
    const runtimeImports = new Set(
        [...moduleSource.matchAll(/\bfrom\s+['"]([^'"]+)['"]/gu)].map(
            (match) => match[1]
        )
    );

    assert.deepEqual(
        runtimeImports,
        new Set([
            'password-generator',
            './signing-options-validation.js',
        ])
    );
});

test('request validation discards signing input for unsigned packages', () => {
    const body = createValidRequestBody();
    body.signingMode = 'none';
    Reflect.set(body, 'signing', {
        keyFilePath: 'client-supplied.keystore',
        unexpectedOption: 'unexpected-value',
    });

    const result = validateAndroidOptionsRequest(body);

    assert.deepEqual(result.validationErrors, []);
    assert.equal(result.options?.signing, null);
});

test('request validation allowlists new-key signing options and preserves generated passwords', () => {
    const signing = { ...validSigningOptions };
    Reflect.deleteProperty(signing, 'keyPassword');
    Reflect.deleteProperty(signing, 'storePassword');
    Reflect.set(signing, 'keyFilePath', 'client-supplied.keystore');
    Reflect.set(signing, 'unexpectedOption', 'unexpected-value');

    const result = validateAndroidOptionsRequest(
        createValidRequestBody(signing)
    );
    const normalizedSigning = result.options?.signing;

    assert.deepEqual(result.validationErrors, []);
    assert.ok(normalizedSigning);
    assert.deepEqual(Object.keys(normalizedSigning), allowedSigningFields);
    assert.equal(Reflect.has(normalizedSigning, 'keyFilePath'), false);
    assert.equal(Reflect.has(normalizedSigning, 'unexpectedOption'), false);
    assert.equal(normalizedSigning.keyPassword.length, 12);
    assert.equal(normalizedSigning.storePassword.length, 12);
    assert.equal(normalizedSigning.keyPassword, signing.keyPassword);
    assert.equal(normalizedSigning.storePassword, signing.storePassword);
    assert.deepEqual(normalizedSigning, {
        file: validSigningOptions.file,
        alias: validSigningOptions.alias,
        fullName: validSigningOptions.fullName,
        organization: validSigningOptions.organization,
        organizationalUnit: validSigningOptions.organizationalUnit,
        countryCode: validSigningOptions.countryCode,
        keyPassword: signing.keyPassword,
        storePassword: signing.storePassword,
    });
});

test('request validation allowlists uploaded-key signing options', () => {
    const signing: SigningOptions = {
        ...validSigningOptions,
        file: 'data:application/octet-stream;base64,AA==',
    };
    Reflect.set(signing, 'keyFilePath', 'client-supplied.keystore');
    Reflect.set(signing, 'unexpectedOption', 'unexpected-value');
    const body = createValidRequestBody(signing);
    body.signingMode = 'mine';

    const result = validateAndroidOptionsRequest(body);
    const normalizedSigning = result.options?.signing;

    assert.deepEqual(result.validationErrors, []);
    assert.ok(normalizedSigning);
    assert.deepEqual(Object.keys(normalizedSigning), allowedSigningFields);
    assert.equal(Reflect.has(normalizedSigning, 'keyFilePath'), false);
    assert.equal(Reflect.has(normalizedSigning, 'unexpectedOption'), false);
    assert.deepEqual(normalizedSigning, {
        file: 'data:application/octet-stream;base64,AA==',
        alias: validSigningOptions.alias,
        fullName: validSigningOptions.fullName,
        organization: validSigningOptions.organization,
        organizationalUnit: validSigningOptions.organizationalUnit,
        countryCode: validSigningOptions.countryCode,
        keyPassword: validSigningOptions.keyPassword,
        storePassword: validSigningOptions.storePassword,
    });
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

test('request validation rejects a non-string DName value without throwing', () => {
    const malformedValue = {
        untrusted: 'route-value',
    };
    const signingOptions = withMalformedSubjectValue(
        'fullName',
        malformedValue
    );
    assertRequestValidationError(
        createValidRequestBody(signingOptions),
        ['Signing option fullName contains unsupported characters'],
        malformedValue
    );
});

for (const malformedBody of [
    null,
    ['array-body-value'],
    42,
    'untrusted-body-value',
] as const) {
    test(`request validation rejects a malformed body (${JSON.stringify(malformedBody)}) without throwing`, () => {
        assertRequestValidationError(
            malformedBody,
            ["Malformed argument. Coudn't find AndroidPackageOptions in body"],
            malformedBody
        );
    });
}

test('request validation rejects an object body without packageId', () => {
    const malformedBody = { untrusted: 'object-body-value' };
    assertRequestValidationError(
        malformedBody,
        ['packageId is required'],
        malformedBody
    );
});

for (const field of requiredStringFields) {
    for (const malformedValue of malformedRequiredStringValues) {
        test(`request validation rejects malformed ${field} (${JSON.stringify(malformedValue)}) without throwing`, () => {
            const body = createValidRequestBody();
            Reflect.set(body, field, malformedValue);

            assertRequestValidationError(
                body,
                [`${field} must be a string`],
                malformedValue
            );
        });
    }

    for (const state of ['missing', 'empty'] as const) {
        test(`request validation rejects a ${state} ${field}`, () => {
            const body = createValidRequestBody();
            if (state === 'missing') {
                Reflect.deleteProperty(body, field);
            } else {
                Reflect.set(body, field, '');
            }

            assertRequestValidationError(
                body,
                [`${field} is required`],
                state === 'missing' ? undefined : ''
            );
        });
    }
}

for (const malformedValue of malformedVersionCodeValues) {
    test(`request validation rejects malformed appVersionCode (${JSON.stringify(malformedValue)}) without throwing`, () => {
        const body = createValidRequestBody();
        Reflect.set(body, 'appVersionCode', malformedValue);

        assertRequestValidationError(
            body,
            ['appVersionCode must be a finite number'],
            malformedValue
        );
    });
}

for (const field of enumeratedFields) {
    for (const malformedValue of malformedEnumeratedValues) {
        test(`request validation rejects unsupported ${field} (${JSON.stringify(malformedValue)}) without throwing`, () => {
            const body = createValidRequestBody();
            Reflect.set(body, field, malformedValue);
            if (field === 'signingMode') {
                Reflect.deleteProperty(body, 'signing');
            }

            assertRequestValidationError(
                body,
                [`${field} has an unsupported value`],
                malformedValue
            );
        });
    }
}

test('request validation rejects a signingMode object with no toString without throwing', () => {
    const malformedValue = { toString: null };
    const body = createValidRequestBody();
    Reflect.set(body, 'signingMode', malformedValue);
    Reflect.deleteProperty(body, 'signing');

    assertRequestValidationError(
        body,
        ['signingMode has an unsupported value'],
        malformedValue
    );
});

for (const malformedValue of malformedMetaQuestValues) {
    test(`request validation rejects malformed isMetaQuest (${JSON.stringify(malformedValue)}) without throwing`, () => {
        const body = createValidRequestBody();
        Reflect.set(body, 'isMetaQuest', malformedValue);

        assertRequestValidationError(
            body,
            ['isMetaQuest must be a boolean'],
            malformedValue
        );
    });
}

for (const malformedValue of malformedFullScopeUrlValues) {
    test(`request validation rejects malformed fullScopeUrl (${JSON.stringify(malformedValue)}) without throwing`, () => {
        const body = createValidRequestBody();
        Reflect.set(body, 'isMetaQuest', true);
        Reflect.set(body, 'fullScopeUrl', malformedValue);

        assertRequestValidationError(
            body,
            ['fullScopeUrl must be a string'],
            malformedValue
        );
    });
}

for (const state of ['missing', 'empty'] as const) {
    test(`request validation rejects a ${state} fullScopeUrl for Meta Quest`, () => {
        const body = createValidRequestBody();
        Reflect.set(body, 'isMetaQuest', true);
        if (state === 'missing') {
            Reflect.deleteProperty(body, 'fullScopeUrl');
        } else {
            Reflect.set(body, 'fullScopeUrl', '');
        }

        assertRequestValidationError(
            body,
            ['fullScopeUrl is required'],
            state === 'missing' ? undefined : ''
        );
    });
}

for (const malformedSigning of malformedSigningValues) {
    test(`request validation rejects malformed signing options (${JSON.stringify(malformedSigning)}) without throwing`, () => {
        const body = createValidRequestBody();
        Reflect.set(body, 'signing', malformedSigning);

        assertRequestValidationError(
            body,
            ['Signing options must be an object'],
            malformedSigning
        );
    });
}

for (const malformedFile of malformedFileValues) {
    test(`request validation rejects a non-string signing file (${JSON.stringify(malformedFile)}) without throwing`, () => {
        const signing = { ...validSigningOptions };
        Reflect.set(signing, 'file', malformedFile);
        const body = createValidRequestBody(signing);
        body.signingMode = 'mine';

        assertRequestValidationError(
            body,
            ['Signing file must be a string'],
            malformedFile
        );
    });
}

for (const field of ['alias', 'keyPassword', 'storePassword'] as const) {
    for (const malformedValue of malformedCredentialValues) {
        test(`request validation rejects a non-string ${field} (${JSON.stringify(malformedValue)}) without throwing`, () => {
            const signing = { ...validSigningOptions };
            Reflect.set(signing, field, malformedValue);

            assertRequestValidationError(
                createValidRequestBody(signing),
                [`Signing option ${field} must be a string`],
                malformedValue
            );
        });
    }
}

for (const passwordState of ['absent', 'empty'] as const) {
    test(`request validation generates passwords when they are ${passwordState}`, () => {
        const signing = { ...validSigningOptions };
        if (passwordState === 'absent') {
            Reflect.deleteProperty(signing, 'keyPassword');
            Reflect.deleteProperty(signing, 'storePassword');
        } else {
            signing.keyPassword = '';
            signing.storePassword = '';
        }

        const result = validateAndroidOptionsRequest(
            createValidRequestBody(signing)
        );

        assert.deepEqual(result.validationErrors, []);
        assert.equal(typeof result.options?.signing?.keyPassword, 'string');
        assert.equal(typeof result.options?.signing?.storePassword, 'string');
        assert.equal(result.options?.signing?.keyPassword.length, 12);
        assert.equal(result.options?.signing?.storePassword.length, 12);
        assert.equal(
            result.options?.signing?.keyPassword,
            result.options?.signing?.storePassword
        );
    });
}

for (const field of subjectFields) {
    test(`rejects X.500 delimiters and Unicode control characters in ${field}`, () => {
        for (const character of invalidDNameCharacters) {
            const submittedValue = `before${character}after`;
            const errors = validateNewKeySigningOptions(
                withSubjectValue(field, submittedValue)
            );

            assert.deepEqual(errors, [
                `Signing option ${field} contains unsupported characters`,
            ]);
            assert.equal(errors.some((error) => error.includes(submittedValue)), false);
        }
    });

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
            validateNewKeySigningOptions(
                withSubjectValue(field, '\u{1F680}'.repeat(129))
            ),
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
                withSubjectValue(field, '\u{1F680}'.repeat(128))
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
