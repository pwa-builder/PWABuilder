export function base64ToBuffer(base64: string): Buffer {
    const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        throw new Error('Invalid base 64 string');
    }

    return Buffer.from(matches[2], 'base64');
}