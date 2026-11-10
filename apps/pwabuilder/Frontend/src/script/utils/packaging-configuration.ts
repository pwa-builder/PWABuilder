/**
 * Resolve each operation against the current slot, including tabs opened before a swap.
 * Never cache an endpoint or fall back to production when runtime configuration fails.
 */
export async function getAndroidServiceUrl(isDevelopment: boolean, request: typeof fetch = fetch): Promise<string> {
    const response = await request('/api/packaging/config', {
        cache: 'no-store',
        credentials: 'omit',
        redirect: 'error'
    });
    if (!response.ok) {
        throw new Error('Android packaging configuration is unavailable. Please retry later.');
    }
    const config: unknown = await response.json();
    const endpoint = typeof config === 'object' && config !== null && 'androidPackageGeneratorUrl' in config
        ? config.androidPackageGeneratorUrl : undefined;
    if (endpoint === 'https://pwabuilder-cloudapk.azurewebsites.net'
        || endpoint === 'https://pwabuilder-cloudapk-staging.azurewebsites.net'
        || (isDevelopment && endpoint === 'http://localhost:5858')) {
        return endpoint;
    }
    throw new Error('Android packaging is not configured for this environment.');
}
