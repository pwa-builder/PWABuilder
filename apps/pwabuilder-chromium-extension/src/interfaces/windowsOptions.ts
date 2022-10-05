export interface WindowsOptions {
  url: string;
  name: string;
  packageId: string;
  version: string;
  allowSigning: boolean;
  classicPackage: {
    generate: boolean;
    version: string;
  };
  publisher: {
    displayName: string;
    commonName: string;
  };
}
