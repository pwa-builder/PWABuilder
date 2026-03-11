export interface CardData {
    imageUrl: string;
    title: string;
    description: string;
    linkUrl: string;
}
export declare const resourceCards: Array<CardData>;
export declare function landingCards(): CardData[];
export declare function publishCards(): CardData[];
