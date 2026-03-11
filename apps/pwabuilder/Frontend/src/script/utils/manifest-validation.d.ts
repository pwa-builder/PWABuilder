import { ManifestContext, TestResult } from './interfaces';
export declare function validateScreenshotUrlsList(urls: Array<string | undefined>): boolean[];
export declare function runManifestChecks(context: ManifestContext): Promise<Array<TestResult>>;
