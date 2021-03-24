import { android_generated } from "./publish/android-publish";
import { web_generated } from "./publish/web-publish";
import { windows_generated } from "./publish/windows-publish";

export function getPlatformsGenerated() {
    const android = android_generated;
    const windows = windows_generated;
    const web = web_generated;

    return {
        android,
        windows,
        web
    }
}