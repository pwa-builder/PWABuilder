import { Manifest } from '@pwabuilder/manifest-validation';
import { ManifestContext, ManifestDetectionResult } from '../utils/interfaces';
export declare const emitter: EventTarget;
export declare let initialManifest: Manifest | undefined;
export declare let emptyManifest: Manifest;
export declare function resetInitialManifest(): void;
export declare function getManifest(url: string): Promise<ManifestDetectionResult | null>;
/**
 * Fetches the manifest for the specified URL and updates the app's current manifest state.
 * If no manifest is found, it will be created from the page.
 * If unable to create a manifest from the page, an empty manifest will be created.
 * @param url The URL to fetch the manifest for. If null or omitted, the current site URL will be used.
 * @returns The manifest context.
 */
export declare function fetchOrCreateManifest(url?: string | null | undefined): Promise<ManifestContext | undefined>;
export declare function createManifestContextFromEmpty(url: string): Promise<ManifestContext>;
export declare function updateManifest(manifestUpdates: Partial<Manifest>): Manifest;
export declare function updateManifestEvent<T extends Partial<Manifest>>(detail: T): CustomEvent<T>;
