interface Flag {
  [key: string]: boolean;
}

const flags: Flag = {
  "analytics": false
};

export function setFlag(flag: string, value: boolean): void {
  flags[flag] = value;
};

export function getFlag(flag: string): boolean {
  return flags[flag];
};