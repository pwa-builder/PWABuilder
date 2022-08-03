export interface Flag {
    [key: string]: boolean;
}

// feature flags
export const flags: Flag = {
    "analytics": true
};

// function to set a flag
export function setFlag(flag: string, value: boolean): void {
    flags[flag] = value;
};

// function to get a flag
export function getFlag(flag: string): boolean {
    return flags[flag];
};