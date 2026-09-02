import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { SigningOptions } from '../models/signingOptions.js';
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

test('accepts supported certificate subject characters and Unicode letters', () => {
    assert.deepEqual(validateNewKeySigningOptions(validSigningOptions), []);
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
