export interface infoPanel {
    description: String[];
    purpose?: string | null;
    example?: String[] | null;
    code?: string;
    required: boolean;
    location?: "info" | "settings" | "platform" | "icons" | "screenshots" | "share" | "handlers";
    docs_link?: string;
    image?: string;
}
export declare const manifest_fields: {
    [field: string]: infoPanel;
};
export declare const service_worker_fields: {
    [field: string]: infoPanel;
};
