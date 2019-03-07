export interface Manifest {
    background_color: string | null;
    description: string | null;
    dir: string | null;
    display: string;
    lang: string | null;
    name: string | null;
    orientation: string | null;
    prefer_related_applications: boolean;
    related_applications: RelatedApplication[];
    scope: string | null;
    short_name: string | null;
    start_url: string | null;
    theme_color: string | null;
    generated: boolean | null;
}

export interface StaticContent {
    code: string;
    name: string;
}

export interface Icon {
    src: string;
    generated?: boolean;
    sizes: string;
}

export interface Asset {
    filename: string;
    data: Blob;
}

export interface RelatedApplication {
    platform: string | null;
    url: string | null;
    id: string | null;
}

export interface CustomMember {
    name: string;
    value: string;
}

export interface ColorOptions {
    colorOption: string;
    color: string;
}

export interface CodeIssue {
    code: string;
    description: string;
    platform: string;
}

export interface CodeError {
    member: string;
    issues: CodeIssue[];
}

export interface State {
    url: string | null;
    manifest: Manifest | null;
    manifestId: string | null;
    siteServiceWorkers: any;
    icons: Icon[];
    members: CustomMember[];
    suggestions: CodeError[] | null;
    warnings: CodeError[] | null;
    errors: string[] | null;
    assets: Asset[] | null;
    generated: boolean | null;
}

export const state = (): State => ({
    url: null,
    manifest: null,
    manifestId: null,
    siteServiceWorkers: null,
    icons: [],
    members: [],
    suggestions: null,
    warnings: null,
    errors: null,
    assets: null,
    generated: null
});