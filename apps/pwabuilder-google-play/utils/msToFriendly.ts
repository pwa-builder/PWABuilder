export function msToFriendly(ms: number): string {
    const sec = Math.floor((ms / 1000) % 60);
    const min = Math.floor((ms / (1000 * 60)) % 60);
    const hr = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const parts = [];
    if (hr) parts.push(`${hr} hour${hr !== 1 ? 's' : ''}`);
    if (min) parts.push(`${min} minute${min !== 1 ? 's' : ''}`);
    if (sec || parts.length === 0) parts.push(`${sec} second${sec !== 1 ? 's' : ''}`);
    return parts.join(', ');
}