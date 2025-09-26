export interface SigningOptions {
    /**
     * The data of the Android keystore signing file encoded as a base64 string.
     */
    file: string | null;
    alias: string;
    fullName?: string | null;
    organization?: string | null;
    organizationalUnit?: string | null;
    countryCode: string | null;
    keyPassword: string;
    storePassword: string;
}

export interface LocalKeyFileSigningOptions extends SigningOptions {
    keyFilePath: string;
}