export interface checkResults {
    validURL: boolean;
    manifest: boolean;
    baseIcon: boolean;
    offline: boolean;
}
export declare function finalCheckForPublish(): Promise<checkResults>;
