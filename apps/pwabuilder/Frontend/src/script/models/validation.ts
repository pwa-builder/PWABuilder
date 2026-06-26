// Local copy of the Validation type originally sourced from
// @pwabuilder/manifest-validation. Copied here so the frontend can drop the
// runtime dependency on that package for type-only usage.

export interface Validation {
    infoString?: string;
    displayString?: string;
    category: string;
    member: string;
    defaultValue?: string | boolean | any[];
    docsLink?: string;
    errorString: string;
    quickFix: boolean;
    test?: Function;
    testRequired?: boolean;
    testName?: string;
    valid?: boolean;
}
