import { Manifest } from '@pwabuilder/manifest-validation';
import { ManifestContext, ProgressList, RawTestResult } from '../utils/interfaces';
export declare function getProgress(): ProgressList;
export declare function setProgress(newProgress: ProgressList): void;
export declare function setURL(url: string): void;
export declare function getURL(): string;
export declare function setResults(testResults: RawTestResult): void;
export declare function getResults(): RawTestResult | undefined;
/**
 * Gets contextual information about the current manifest.
 * If no manifest has been detected, an empty manifest will be returned.
 * @returns
 */
export declare function getManifestContext(): ManifestContext;
/**
 * Sets the current manifest context.
 * @param val The manifest.
 */
export declare function setManifestContext(val: ManifestContext): void;
export declare function getManifestUrl(): string;
export declare function isManifestEdited(originalMani: Manifest, newMani: Manifest): void;
export declare function doubleCheckManifest(maniContext: ManifestContext): Promise<{
    startURL: boolean;
    name: boolean;
    shortName: boolean;
    icon: boolean;
}>;
