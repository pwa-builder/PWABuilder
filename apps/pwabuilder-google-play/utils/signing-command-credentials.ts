import { escapeDoubleQuotedShellString } from '@bubblewrap/core/dist/lib/util.js';
import type { SigningOptions } from '../models/signingOptions.js';
import { redactSecretsFromError } from './redactSecrets.js';

export interface SigningCommandCredentials {
    alias: string;
    keyPassword: string;
    storePassword: string;
    redactError<T>(error: T): T;
}

export function createSigningCommandCredentials(
    options: Pick<SigningOptions, 'alias' | 'keyPassword' | 'storePassword'>
): SigningCommandCredentials {
    const alias = `"${escapeDoubleQuotedShellString(options.alias)}"`;
    const keyPassword = `"${escapeDoubleQuotedShellString(options.keyPassword)}"`;
    const storePassword = `"${escapeDoubleQuotedShellString(options.storePassword)}"`;
    const protectedValues = [
        options.alias,
        options.keyPassword,
        options.storePassword,
        alias,
        keyPassword,
        storePassword,
    ];

    return {
        alias,
        keyPassword,
        storePassword,
        redactError: <T>(error: T): T => redactSecretsFromError(error, protectedValues),
    };
}
