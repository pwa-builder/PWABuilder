/* eslint-disable @typescript-eslint/no-explicit-any */
// unfortunately deepmerge capitalizes on the ambiguity of any in the api and enforces it.

export function uniqueElements<T>(
  key: (curr: T) => string
): (x: any, y: any) => any {
  return (target: Array<T>, source: Array<T>) => {
    const map = new Map();
    const totalArr = target.concat(source);
    for (let i = 0; i < totalArr.length; i++) {
      const curr = totalArr[i];

      if (curr) {
        if (!map.has(key(curr))) {
          map.set(key(curr), curr);
        }
      }
    }

    return Array.from(map.values());
  };
}
