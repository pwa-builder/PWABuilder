interface PackageReceipt {
    id: string;
    supportReference: string;
    accessToken: string;
}

interface OwnerStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
}

export function savePackageReceipt(receipt: unknown, storage: OwnerStorage): string {
    if (!isPackageReceipt(receipt)) {
        throw new Error("The packaging service returned an invalid job receipt.");
    }
    storage.setItem(`package-owner:${receipt.id}`, receipt.accessToken);
    storage.setItem(`package-support:${receipt.id}`, receipt.supportReference);
    return receipt.id;
}

export function getPackageAuthorization(jobId: string, storage: OwnerStorage): string {
    const token = storage.getItem(`package-owner:${jobId}`);
    if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
        throw new Error("This job is only accessible in the browser tab that created it. Please create a new package.");
    }
    return `Bearer ${token}`;
}

export function packageSupportIssueBody(reference: string | null): string {
    const link = reference && /^[0-9a-f-]{36}$/i.test(reference)
        ? `\n\n[Private support diagnostics](https://www.pwabuilder.com/admin/package-jobs/${encodeURIComponent(reference)})`
        : "";
    return `I encountered an error creating a Google Play package.${link}\n\nPlease describe what happened. Do not include signing keys, passwords, or package download links.`;
}

function isPackageReceipt(value: unknown): value is PackageReceipt {
    return typeof value === "object" && value !== null
        && "id" in value && typeof value.id === "string" && value.id.startsWith("googleplaypackagejob:")
        && "supportReference" in value && typeof value.supportReference === "string" && /^[0-9a-f-]{36}$/i.test(value.supportReference)
        && "accessToken" in value && typeof value.accessToken === "string" && /^[A-Za-z0-9_-]{43}$/.test(value.accessToken);
}
