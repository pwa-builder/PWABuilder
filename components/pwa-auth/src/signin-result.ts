/**
 * The result of a sign in attempt.
 */
export interface SignInResult {
    /**
     * The user's email.
     */
    email?: string | null;

    /**
     * The user's first and last name.
     */
    name?: string | null;

    /**
     * The user's profile picture URL.
     */
    imageUrl?: string | null;

    /**
     * The access token from the provider. This may be stale if the sign-in was done via a stored credential.
     */
    accessToken?: string | null;

    /**
     * The expiration date of the access token.
     */
    accessTokenExpiration?: Date | null;

    /**
     * Additional details about the sign-in. Provider-specific.
     */
    providerData?: {[key: string]: any} | null;

    /**
     * The error that occurred during sign in process.
     */
    error: Error | null;

    /**
     * The name of the login provider.
     */
    provider: "Microsoft" | "Google" | "Facebook" | "Apple";
}