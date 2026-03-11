export interface CardData {
    imageUrl: string;
    stat: string;
    description: string;
    value: string;
    company: string;
    source: string;
}
export declare const communityCards: Array<CardData>;
export declare function getCards(): CardData[];
