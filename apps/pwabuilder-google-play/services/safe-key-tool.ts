import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { redactSecretsFromError } from '../utils/redactSecrets.js';

export interface KeyOptions {
    path: string;
    password: string;
    keypassword: string;
    alias: string;
}

export interface CreateKeyOptions extends KeyOptions {
    fullName: string;
    organization: string;
    organizationalUnit: string;
    country: string;
}

export interface KeyInfo {
    fingerprints: Map<string, string>;
}

export interface KeyToolExecutionOptions {
    env: NodeJS.ProcessEnv;
    shell: false;
}

export type KeyToolExecutor = (
    executable: string,
    args: readonly string[],
    options: KeyToolExecutionOptions
) => Promise<{ stdout: string; stderr: string }>;

const defaultKeyToolExecutor: KeyToolExecutor = (executable, args, options) =>
    new Promise((resolve, reject) => {
        execFile(
            executable,
            [...args],
            {
                env: options.env,
                shell: false,
                encoding: 'utf8',
            },
            (error, stdout, stderr) => {
                if (error) {
                    reject(Object.assign(error, { stdout, stderr }));
                    return;
                }

                resolve({ stdout, stderr });
            }
        );
    });

export class SafeKeyTool {
    constructor(
        private readonly getEnvironment: () => NodeJS.ProcessEnv,
        private readonly executor: KeyToolExecutor = defaultKeyToolExecutor
    ) {}

    async createSigningKey(options: CreateKeyOptions, overwriteExisting: boolean): Promise<void> {
        if (existsSync(options.path)) {
            if (!overwriteExisting) {
                return;
            }

            await unlink(options.path);
        }

        const dname = [
            `CN=${options.fullName.trim()}`,
            `OU=${options.organizationalUnit.trim()}`,
            `O=${options.organization.trim()}`,
            `C=${options.country.trim().toUpperCase()}`,
        ].join(', ');
        const args: readonly string[] = [
            '-genkeypair',
            '-dname',
            dname,
            '-alias',
            options.alias,
            '-keypass',
            options.keypassword,
            '-keystore',
            options.path,
            '-storepass',
            options.password,
            '-validity',
            '20000',
            '-keyalg',
            'RSA',
        ];

        try {
            await this.executor('keytool', args, {
                env: this.getEnvironment(),
                shell: false,
            });
        } catch (error) {
            throw redactSecretsFromError(error, SafeKeyTool.getProtectedCreateValues(options));
        }
    }

    async keyInfo(options: KeyOptions): Promise<KeyInfo> {
        const output = await this.list(options);
        return {
            fingerprints: SafeKeyTool.parseFingerprints(output),
        };
    }

    private async list(options: KeyOptions): Promise<string> {
        if (!existsSync(options.path)) {
            throw new Error('Keystore file does not exist.');
        }

        const args: readonly string[] = [
            '-J-Duser.language=en',
            '-list',
            '-v',
            '-keystore',
            options.path,
            '-alias',
            options.alias,
            '-storepass',
            options.password,
            '-keypass',
            options.keypassword,
        ];

        try {
            const result = await this.executor('keytool', args, {
                env: this.getEnvironment(),
                shell: false,
            });
            return result.stdout;
        } catch (error) {
            throw redactSecretsFromError(error, [
                options.path,
                options.alias,
                options.keypassword,
                options.password,
            ]);
        }
    }

    private static getProtectedCreateValues(options: CreateKeyOptions): string[] {
        return [
            options.path,
            options.alias,
            options.keypassword,
            options.password,
            options.fullName,
            options.fullName.trim(),
            options.organization,
            options.organization.trim(),
            options.organizationalUnit,
            options.organizationalUnit.trim(),
            // Note: country is intentionally excluded. It is public certificate subject
            // metadata (not a secret) and is logged elsewhere. Treating a two-character
            // country code as a secret causes redactSecretsFromError's global substring
            // replacement to corrupt ordinary words that happen to contain that bigram
            // (e.g. country "in" corrupting "signing" and "using").
        ];
    }

    private static parseFingerprints(output: string): Map<string, string> {
        const fingerprints = new Map<string, string>();
        for (const line of output.split(/\r?\n/)) {
            const match = line.match(/^\s*(SHA1|SHA256):\s*(.+?)\s*$/);
            if (match) {
                fingerprints.set(match[1], match[2]);
            }
        }

        return fingerprints;
    }
}
