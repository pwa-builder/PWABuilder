import { randomUUID } from 'node:crypto';

/**
 * Factory that produces a unique identifier. Defaults to the crypto UUID generator, but can be
 * overridden in tests to inject a deterministic value.
 */
export type UuidFactory = () => string;

/**
 * Builds a package job ID from the PWA host and server-generated randomness.
 * The uniqueness of the ID derives solely from the UUID, ensuring request data never controls the identifier.
 * @param pwaUrl The URL of the PWA being packaged. Its host forms the human-readable segment of the ID.
 * @param createUuid Factory used to generate the unique suffix. Defaults to a cryptographically random UUID.
 * @returns A package job ID in the form `googleplaypackagejob:{host}:{uuid}`.
 */
export function createPackageJobId(pwaUrl: string, createUuid: UuidFactory = randomUUID): string {
    const pwaHost = new URL(pwaUrl).host;
    return `googleplaypackagejob:${pwaHost}:${createUuid()}`;
}
