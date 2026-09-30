import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const packageAccessLifetimeSeconds = 72 * 60 * 60;

export interface PackageJobAccess {
    tokenHash: string;
    expiresAt: number;
}

export function createPackageJobAccess(): { accessToken: string; access: PackageJobAccess } {
    const accessToken = randomBytes(32).toString("base64url");
    return {
        accessToken,
        access: {
            tokenHash: createHash("sha256").update(accessToken).digest("hex"),
            expiresAt: Date.now() + packageAccessLifetimeSeconds * 1000
        }
    };
}

export function canAccessPackageJob(authorization: string | undefined, access: PackageJobAccess | null): boolean {
    if (!access || !Number.isFinite(access.expiresAt) || access.expiresAt <= Date.now()
        || !/^[a-f0-9]{64}$/.test(access.tokenHash)) {
        return false;
    }
    const token = /^Bearer ([A-Za-z0-9_-]{43})$/.exec(authorization || "")?.[1];
    if (!token) {
        return false;
    }
    const candidate = createHash("sha256").update(token).digest();
    return timingSafeEqual(Uint8Array.from(candidate), Uint8Array.from(Buffer.from(access.tokenHash, "hex")));
}
