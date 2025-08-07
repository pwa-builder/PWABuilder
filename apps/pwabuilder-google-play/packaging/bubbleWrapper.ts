import {
  AndroidSdkTools,
  Config,
  DigitalAssetLinks,
  GradleWrapper,
  JdkHelper,
  TwaGenerator,
  TwaManifest,
  JarSigner,
  ConsoleLog,
  SigningKeyInfo,
} from '@bubblewrap/core';
import { ShortcutInfo } from '@bubblewrap/core/dist/lib/ShortcutInfo.js';
import { findSuitableIcon } from '@bubblewrap/core/dist/lib/util.js';
import { AndroidPackageOptions } from './androidPackageOptions.js';
import fs from 'fs-extra';
import {
  KeyTool,
  CreateKeyOptions,
} from '@bubblewrap/core/dist/lib/jdk/KeyTool.js';
import { WebManifestShortcutJson } from '@bubblewrap/core/dist/lib/types/WebManifest.js';
import { LocalKeyFileSigningOptions } from './signingOptions.js';
import { GeneratedAppPackage } from './generatedAppPackage.js';
import { TwaManifestJson } from '@bubblewrap/core/dist/lib/TwaManifest.js';
import { fetchUtils } from '@bubblewrap/core';
import { FetchEngine } from '@bubblewrap/core/dist/lib/FetchUtils.js';
import generatePassword from 'password-generator';

/*
 * Wraps Google's bubblewrap to build a signed APK from a PWA.
 * https://github.com/GoogleChromeLabs/bubblewrap/tree/master/packages/core
 */
export class BubbleWrapper {
  private javaConfig: Config;
  private jdkHelper: JdkHelper;
  private androidSdkTools: AndroidSdkTools;

  /**
   *
   * @param apkSettings The settings for the APK generation.
   * @param projectDirectory The directory where to generate the project files and signed APK.
   * @param signingKeyInfo Information about the signing key.
   */
  constructor(
    private apkSettings: AndroidPackageOptions,
    private projectDirectory: string,
    private signingKeyInfo: LocalKeyFileSigningOptions | null,
    fetchEngine: FetchEngine
  ) {
    this.javaConfig = new Config(
      process.env.JDK8PATH!,
      process.env.ANDROIDTOOLSPATH!
    );
    this.jdkHelper = new JdkHelper(process, this.javaConfig);
    this.androidSdkTools = new AndroidSdkTools(
      process,
      this.javaConfig,
      this.jdkHelper
    );
    fetchUtils.setFetchEngine(fetchEngine);
  }

  /**
   * Generates app package from the PWA.
   */
  async generateAppPackage(): Promise<GeneratedAppPackage> {
    // Create an optimized APK.
    await this.generateTwaProject();
    const apkPath = await this.buildApk();

    // Do we have a signing key?
    // If so, sign the APK, generate digital asset links file, and generate an app bundle.
    if (this.apkSettings.signingMode !== 'none' && this.signingKeyInfo) {
      if (this.apkSettings.signingMode === "new") {
        // temporary workaround for https://github.com/GoogleChromeLabs/bubblewrap/issues/693
        const passToUse = generatePassword(12, false);

        this.signingKeyInfo.keyPassword = passToUse;
        this.signingKeyInfo.storePassword = passToUse;
      }

      const signedApkPath = await this.signApk(apkPath, this.signingKeyInfo);
      const assetLinksPath = await this.tryGenerateAssetLinks(
        this.signingKeyInfo
      );
      const appBundlePath = await this.buildAppBundle(this.signingKeyInfo);
      return {
        projectDirectory: this.projectDirectory,
        appBundleFilePath: appBundlePath,
        apkFilePath: signedApkPath,
        signingInfo: this.signingKeyInfo,
        assetLinkFilePath: assetLinksPath,
      };
    }

    // We generated an unsigned APK, so there will be no signing info, asset links, or app bundle.
    return {
      projectDirectory: this.projectDirectory,
      apkFilePath: apkPath,
      signingInfo: this.signingKeyInfo,
      assetLinkFilePath: null,
      appBundleFilePath: await this.buildAppBundle(),
    };
  }

  private async buildAppBundle(
    signingInfo?: LocalKeyFileSigningOptions
  ): Promise<string> {
    console.info('Generating app bundle');

    // Build the app bundle file (.aab)
    const gradleWrapper = new GradleWrapper(
      process,
      this.androidSdkTools,
      this.projectDirectory
    );
    await gradleWrapper.bundleRelease();

    // Sign the app bundle file.
    const appBundleDir = 'app/build/outputs/bundle/release';
    const inputFile = `${this.projectDirectory}/${appBundleDir}/app-release.aab`;

    if (!signingInfo) {
      // returning unsigned app bundle
      return inputFile;
    }

    //const outputFile = './app-release-signed.aab';
    const outputFile = `${this.projectDirectory}/${appBundleDir}/app-release-signed.aab`;
    const jarSigner = new JarSigner(this.jdkHelper);
    const jarSigningInfo: SigningKeyInfo = {
      path: signingInfo.keyFilePath,
      alias: signingInfo.alias,
    };
    await jarSigner.sign(
      jarSigningInfo,
      signingInfo.storePassword,
      signingInfo.keyPassword,
      inputFile,
      outputFile
    );
    return outputFile;
  }

  private async generateTwaProject(): Promise<TwaManifest> {
    const twaGenerator = new TwaGenerator();
    const twaManifest = this.createTwaManifest(this.apkSettings);
    await twaGenerator.createTwaProject(
      this.projectDirectory,
      twaManifest,
      new ConsoleLog()
    );
    return twaManifest;
  }

  private async createSigningKey(signingInfo: LocalKeyFileSigningOptions) {
    const keyTool = new KeyTool(this.jdkHelper);
    const overwriteExisting = true;
    if (
      !signingInfo.fullName ||
      !signingInfo.organization ||
      !signingInfo.organizationalUnit ||
      !signingInfo.countryCode
    ) {
      throw new Error(
        `Missing required signing info. Full name: ${signingInfo.fullName}, Organization: ${signingInfo.organization}, Organizational Unit: ${signingInfo.organizationalUnit}, Country Code: ${signingInfo.countryCode}.`
      );
    }

    const keyOptions: CreateKeyOptions = {
      path: signingInfo.keyFilePath,
      password: signingInfo.storePassword,
      keypassword: signingInfo.keyPassword,
      alias: signingInfo.alias,
      fullName: signingInfo.fullName,
      organization: signingInfo.organization,
      organizationalUnit: signingInfo.organizationalUnit,
      country: signingInfo.countryCode,
    };

    await keyTool.createSigningKey(keyOptions, overwriteExisting);
  }

  private async buildApk(): Promise<string> {
    const gradleWrapper = new GradleWrapper(
      process,
      this.androidSdkTools,
      this.projectDirectory
    );
    await gradleWrapper.assembleRelease();
    return `${this.projectDirectory}/app/build/outputs/apk/release/app-release-unsigned.apk`;
  }

  private async signApk(
    apkFilePath: string,
    signingInfo: LocalKeyFileSigningOptions
  ): Promise<string> {
    // Create a new signing key if necessary.
    if (this.apkSettings.signingMode === 'new') {
      await this.createSigningKey(signingInfo);
    }

    const outputFile = `${this.projectDirectory}/app-release-signed.apk`;
    console.info('Signing the APK...');
    await this.androidSdkTools.apksigner(
      signingInfo.keyFilePath,
      `"${signingInfo.storePassword}"`, // Escape the store password, otherwise passwords with spaces will break. See https://github.com/pwa-builder/PWABuilder/issues/5017#issuecomment-3049710075
      `"${signingInfo.alias}"`,
      `"${signingInfo.keyPassword}"`, // Escape the key password for the same reason.
      apkFilePath,
      outputFile
    );
    console.info('APK signed successfully');
    return outputFile;
  }

  async tryGenerateAssetLinks(
    signingInfo: LocalKeyFileSigningOptions
  ): Promise<string | null> {
    try {
      const result = await this.generateAssetLinks(signingInfo);
      return result;
    } catch (error) {
      console.warn(
        "Asset links couldn't be generated. Proceeding without asset links.",
        error
      );
      return null;
    }
  }

  async generateAssetLinks(
    signingInfo: LocalKeyFileSigningOptions
  ): Promise<string> {
    console.info('Generating asset links...');
    const keyTool = new KeyTool(this.jdkHelper);
    const assetLinksFilePath = `${this.projectDirectory}/app/build/outputs/apk/release/assetlinks.json`;
    const keyInfo = await keyTool.keyInfo({
      path: signingInfo.keyFilePath,
      alias: signingInfo.alias,
      keypassword: signingInfo.keyPassword,
      password: signingInfo.storePassword,
    });

    const sha256Fingerprint = keyInfo.fingerprints.get('SHA256');
    if (!sha256Fingerprint) {
      throw new Error("Couldn't find SHA256 fingerprint.");
    }

    const assetLinks = DigitalAssetLinks.generateAssetLinks(
      this.apkSettings.packageId,
      sha256Fingerprint
    );
    await fs.promises.writeFile(assetLinksFilePath, assetLinks);
    console.info(`Digital Asset Links file generated at ${assetLinksFilePath}`);
    return assetLinksFilePath;
  }

  private createTwaManifest(pwaSettings: AndroidPackageOptions): TwaManifest {
    // Bubblewrap expects a TwaManifest object.
    // We create one using our ApkSettings and signing key info.

    // Host without HTTPS: this is needed because the current version of Bubblewrap doesn't handle
    // a host with protocol specified. Remove the protocol here. See https://github.com/GoogleChromeLabs/bubblewrap/issues/227
    // NOTE: we cannot use new URL(pwaSettings.host).host, because this breaks PWAs located at subpaths, e.g. https://ics.hutton.ac.uk/gridscore
    let hostWithoutHttps = pwaSettings.host;
    const httpsProtocol = 'https://';
    if (hostWithoutHttps.startsWith(httpsProtocol)) {
      hostWithoutHttps = hostWithoutHttps.substring(httpsProtocol.length);
    }

    // Trim any trailing slash from the host. See https://github.com/pwa-builder/PWABuilder/issues/1221
    if (hostWithoutHttps.endsWith('/')) {
      hostWithoutHttps = hostWithoutHttps.substring(
        0,
        hostWithoutHttps.length - 1
      );
    }

    const signingKey = {
      path: this.signingKeyInfo?.keyFilePath || '',
      alias: this.signingKeyInfo?.alias || '',
    };

    // Alpha dependencies must be turned on if Google Play Billing is enabled.
    // See https://github.com/pwa-builder/PWABuilder/issues/1832#issuecomment-926616538
    const alphaDependencies = pwaSettings.features?.playBilling?.enabled
      ? { enabled: true }
      : undefined;
    const manifestJson: TwaManifestJson = {
      ...pwaSettings,
      host: hostWithoutHttps,
      shortcuts: this.createShortcuts(
        pwaSettings.shortcuts,
        pwaSettings.webManifestUrl
      ),
      signingKey: signingKey,
      generatorApp: 'PWABuilder',
      alphaDependencies: alphaDependencies,
    };
    const twaManifest = new TwaManifest(manifestJson);
    console.info('TWA manifest created', twaManifest);
    return twaManifest;
  }

  private createShortcuts(
    shortcutsJson: WebManifestShortcutJson[] | null | undefined,
    manifestUrl: string
  ): ShortcutInfo[] {
    if (!shortcutsJson) {
      return [];
    }
    if (!manifestUrl) {
      console.warn(
        'Skipping app shortcuts due to empty manifest URL',
        manifestUrl
      );
      return [];
    }

    const maxShortcuts = 4;
    return shortcutsJson
      .filter((s) => this.isValidShortcut(s))
      .map((s) => this.createShortcut(s, manifestUrl))
      .slice(0, 4);
  }

  private createShortcut(
    shortcut: WebManifestShortcutJson,
    manifestUrl: string
  ): ShortcutInfo {
    const shortNameMaxSize = 12;
    const name = shortcut.name || shortcut.short_name;
    const shortName =
      shortcut.short_name || shortcut.name!.substring(0, shortNameMaxSize);
    const url = new URL(shortcut.url!, manifestUrl).toString();
    const suitableIcon = findSuitableIcon(shortcut.icons!, 'any');
    const iconUrl = new URL(suitableIcon!.src, manifestUrl).toString();
    return new ShortcutInfo(name!, shortName!, url, iconUrl);
  }

  private isValidShortcut(
    shortcut: WebManifestShortcutJson | null | undefined
  ): boolean {
    if (!shortcut) {
      console.warn(
        'Shortcut is invalid due to being null or undefined',
        shortcut
      );
      return false;
    }
    if (!shortcut.icons) {
      console.warn(
        'Shorcut is invalid due to not having any icons specified',
        shortcut
      );
      return false;
    }
    if (!shortcut.url) {
      console.warn('Shortcut is invalid due to not having a URL', shortcut);
      return false;
    }
    if (!shortcut.name && !shortcut.short_name) {
      console.warn(
        'Shortcut is invalid due to having neither a name nor short_name',
        shortcut
      );
      return false;
    }
    if (!findSuitableIcon(shortcut.icons, 'any')) {
      console.warn(
        'Shortcut is invalid due to not finding a suitable icon',
        shortcut.icons
      );
      return false;
    }

    return true;
  }
}
