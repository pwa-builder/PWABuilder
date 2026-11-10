import { registerHooks } from 'node:module';

export const effects = { builds: 0, enqueued: [], stored: new Map(), expirations: new Map(), downloads: 0 };
const effectKey = Symbol.for('cloudapk-route-test-effects');
globalThis[effectKey] = effects;

// Load the real Express app/router, but prohibit builds and any production service access.
const sources = new Map(Object.entries({
    'analytics.js': 'export function trackEvent() {}',
    'packageCreator.js': `
        const effects = globalThis[Symbol.for('cloudapk-route-test-effects')];
        export class PackageCreator {
            addEventListener() {}
            removeEventListener() {}
            async createZip() {
                effects.builds++;
                throw new Error('Builds are disabled in route tests');
            }
        }`,
    'azureQueueService.js': `
        const effects = globalThis[Symbol.for('cloudapk-route-test-effects')];
        export const azureQueue = {
            async enqueue(job) {
                effects.enqueued.push(job.packageOptions);
                return effects.enqueued.length;
            }
        };`,
    'redisService.js': `
        const effects = globalThis[Symbol.for('cloudapk-route-test-effects')];
        export const redisService = {
            async getJson(key) { return effects.stored.get(key) ?? null; },
            async save(key, value, ttl) {
                effects.stored.set(key, JSON.parse(JSON.stringify(value)));
                effects.expirations.set(key, ttl);
            },
            async indexDiagnosticFailure() {}
        };`,
    'azureStorageBlobService.js': `
        import { Readable } from 'node:stream';
        const effects = globalThis[Symbol.for('cloudapk-route-test-effects')];
        export const blobStorage = {
            async uploadFile() { return 'private-artifact.zip'; },
            async downloadFileStream() {
                effects.downloads++;
                return Readable.from(['test zip']);
            }
        };`,
}).map(([file, source]) => [new URL(`../../services/${file}`, import.meta.url).href, source]));

const hooks = registerHooks({
    load(url, context, nextLoad) {
        const source = sources.get(url);
        return source === undefined ? nextLoad(url, context) :
            { format: 'module', source, shortCircuit: true };
    },
});

let app, PackageJobProcessor;
try {
    ({ default: app } = await import('../../app.js'));
    ({ PackageJobProcessor } = await import('../../services/packageJobProcessor.js'));
} finally {
    hooks.deregister();
    delete globalThis[effectKey];
}

export { app, PackageJobProcessor };
