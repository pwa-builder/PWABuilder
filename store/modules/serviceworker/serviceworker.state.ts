export interface ServiceWorker {
    id: number;
    serviceworkerPreview: string | null;
    webPreview: string | null;
    description: string | null;
    title: string | null;
    disable: boolean | false;
}

export interface State {
    archive: string | null;
    serviceworker: number;
    serviceworkerPreview: string | null;
    webPreview: string | null;
    serviceworkers: ServiceWorker[];
}

export const state = (): State => ({
    archive: null,
    serviceworker: 1,
    serviceworkerPreview: null,
    webPreview: null,
    serviceworkers: []
});
