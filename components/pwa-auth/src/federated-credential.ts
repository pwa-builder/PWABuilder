// Type definition for the new FederatedCredential. See https://developers.google.com/web/fundamentals/security/credential-management/
// We can delete this when TypeScript has this type built in.
export interface FederatedCredential extends Credential {
    iconURL?: string;
    name?: string;
    protocol?: string;
    provider?: string;
}