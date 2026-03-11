interface DownloadConfig {
    id?: string;
    fileName: string;
    url?: string;
    blob?: Blob;
}
export declare function download(config: DownloadConfig): Promise<void>;
export {};
