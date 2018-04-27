export interface Item {
    title: string | null;
    image: string | null;
    id: string | null;
    parms: string;
    url: string | null;
    hash: string | null;
    included: boolean | false;
    comments: string | null;
}