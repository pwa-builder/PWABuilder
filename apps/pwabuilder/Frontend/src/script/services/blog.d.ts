import { Platform } from "./publish";
export interface BlogPost {
    title: string;
    description: string;
    date: string;
    imageUrl: string;
    shareUrl: string;
    clickUrl: string;
    tags: Array<string>;
    relatedPlatform?: Platform;
}
export declare const allPosts: Array<BlogPost>;
