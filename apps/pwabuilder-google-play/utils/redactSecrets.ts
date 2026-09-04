const REDACTED_PLACEHOLDER = '***REDACTED***';

/**
 * Redacts sensitive values (e.g. keystore passwords, key aliases) from an error's
 * message, cmd, stdout, stderr, stack, and spawnargs properties.
 *
 * This is needed because when a shell command (e.g. apksigner) fails, Node.js's
 * child_process error includes the full command line - including any secrets that were
 * passed as arguments - in the thrown error's message, cmd, stdout, stderr, and
 * spawnargs properties.
 * Without redaction, these secrets could end up in logs. See
 * https://github.com/pwa-builder/PWABuilder/issues/6311
 * @param error The error to redact. It's mutated in place and also returned for convenience.
 * @param secrets The secret values to redact from the error.
 */
export function redactSecretsFromError<T>(error: T, secrets: (string | undefined | null)[]): T {
    const secretValues = [
        ...new Set(secrets.filter((secret): secret is string => typeof secret === 'string' && secret.length > 0)),
    ].sort((left, right) => right.length - left.length);
    if (secretValues.length === 0 || !error || typeof error !== 'object') {
        return error;
    }

    const redact = (value: string): string =>
        secretValues.reduce((result, secret) => result.split(secret).join(REDACTED_PLACEHOLDER), value);

    const errorAsRecord = error as unknown as Record<string, unknown>;
    for (const prop of ['message', 'cmd', 'stdout', 'stderr', 'stack']) {
        const value = errorAsRecord[prop];
        if (typeof value === 'string') {
            errorAsRecord[prop] = redact(value);
        }
    }

    const spawnargs = errorAsRecord.spawnargs;
    if (Array.isArray(spawnargs)) {
        errorAsRecord.spawnargs = spawnargs.map(argument =>
            typeof argument === 'string' ? redact(argument) : argument
        );
    }

    return error;
}
