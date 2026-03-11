export interface CardData {
    imageUrl: string;
    title: string;
    description: string;
    links: link[];
    company: string;
}
export interface link {
    link: string;
    text: string;
}
export declare const communityCards: Array<CardData>;
export declare function getCards(): CardData[];
