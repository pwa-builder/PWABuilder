/**
 * Validates the DNS authority before normalizing the legacy HTTPS/path host format.
 * URL parsing alone is insufficient: it accepts quotes and strips some controls.
 */
export function normalizeAndroidHost(value: string): string | null {
    if (/['"\\?#\p{C}\p{Z}]/u.test(value)) {
        return null;
    }

    const hostAndPath = value.replace(/^https:\/\//iu, '');
    if (!hostAndPath || hostAndPath.startsWith('/') || hostAndPath.includes('://')) {
        return null;
    }

    let url: URL;
    try {
        url = new URL(`https://${hostAndPath}`);
    } catch {
        return null;
    }

    const hostname = url.hostname.replace(/\.$/u, '');
    if (url.username || url.password || hostAndPath.includes('@') ||
        hostname.length > 253 ||
        !hostname.split('.').every(label =>
            /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/iu.test(label))) {
        return null;
    }

    // Keep subpath-based PWAs working rather than silently replacing host with .hostname.
    return `${url.host}${url.pathname}`.replace(/\/+$/u, '');
}
