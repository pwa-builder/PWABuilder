import { registerHooks } from 'node:module';

export const effects = { builds: 0, enqueued: [] };
const effectKey = Symbol.for('cloudapk-route-test-effects');
globalThis[effectKey] = effects;

// Load the real Express app/router, but prohibit builds and any production service access.
const sources = new Map(Object.entries({
    'analytics.js': 'export function trackEvent() {}',
    'packageCreator.js': `
        const effects = globalThis[Symbol.for('cloudapk-route-test-effects')];
        export class PackageCreator {
            addEventListener() {}
            async createZip() {
                effects.builds++;
                throw new Error('Builds are disabled in route tests');
            }
        }`,
    'packageJobQueue.js': `
        const effects = globalThis[Symbol.for('cloudapk-route-test-effects')];
        export const packageJobQueue = {
            async enqueue(options) {
                effects.enqueued.push(options);
                return 'test-job';
            }
        };`,
    'redisService.js': 'export const redisService = {};',
    'azureStorageBlobService.js': 'export const blobStorage = {};',
}).map(([file, source]) => [new URL(`../../services/${file}`, import.meta.url).href, source]));

const hooks = registerHooks({
    load(url, context, nextLoad) {
        const source = sources.get(url);
        return source === undefined ? nextLoad(url, context) :
            { format: 'module', source, shortCircuit: true };
    },
});

let app;
try {
    ({ default: app } = await import('../../app.js'));
} finally {
    hooks.deregister();
    delete globalThis[effectKey];
}

export { app };
