import { SigningOptions } from '../models/signingOptions.js';

const maxSubjectLength = 128;
const supportedSubjectCharacters = /^[\p{L}\p{N} .'_()-]+$/u;
const subjectFields = [
    'fullName',
    'organization',
    'organizationalUnit',
] as const;

/**
 * Validates user-provided certificate subject fields for a new signing key.
 */
export function validateNewKeySigningOptions(
    signing: SigningOptions
): string[] {
    const validationErrors: string[] = [];

    for (const field of subjectFields) {
        const value = signing[field];
        if (!value) {
            continue;
        }

        const trimmedValue = value.trim();
        if (!trimmedValue) {
            validationErrors.push(`Signing option ${field} must not be blank`);
        } else if ([...value].length > maxSubjectLength) {
            validationErrors.push(
                `Signing option ${field} must contain at most ${maxSubjectLength} characters`
            );
        } else if (!supportedSubjectCharacters.test(value)) {
            validationErrors.push(
                `Signing option ${field} contains unsupported characters`
            );
        }
    }

    if (
        signing.countryCode &&
        (signing.countryCode.length !== 2 ||
            !/^[A-Za-z]{2}$/u.test(signing.countryCode))
    ) {
        validationErrors.push(
            'Signing option countryCode must contain exactly two letters'
        );
    }

    return validationErrors;
}
