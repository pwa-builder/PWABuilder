import { Screenshot } from "@pwabuilder/manifest-validation";
export declare function generateScreenshots(screenshotsList: Array<string>): Promise<Array<Screenshot> | undefined>;
export declare function downloadScreenshotZip(): Promise<void>;
export declare function getColorScheme(): Promise<void>;
