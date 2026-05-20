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
} from '@meta-quest/bubblewrap-core';
import { ShortcutInfo } from '@meta-quest/bubblewrap-core/dist/lib/ShortcutInfo.js';
import { findSuitableIcon } from '@meta-quest/bubblewrap-core/dist/lib/util.js';
import { MetaHorizonPackageOptions } from '../models/metaHorizonPackageOptions.js';
import fs from 'fs-extra';
import { KeyTool, CreateKeyOptions } from '@meta-quest/bubblewrap-core/dist/lib/jdk/KeyTool.js';
import { WebManifestShortcutJson } from '@meta-quest/bubblewrap-core/dist/lib/types/WebManifest.js';
import { LocalKeyFileSigningOptions } from '../models/signingOptions.js';
import { GeneratedAppPackage } from '../models/generatedAppPackage.js';
import { TwaManifestJson } from '@meta-quest/bubblewrap-core/dist/lib/TwaManifest.js';
import { fetchUtils } from '@meta-quest/bubblewrap-core';
import { FetchEngine } from '@meta-quest/bubblewrap-core/dist/lib/FetchUtils.js';
import generatePassword from 'password-generator';
import { PackageCreationProgress } from "../models/packageCreationProgress.js";
import EventEmitter from "events";

/*
 * Wraps Meta Quest's bubblewrap to build a signed APK / AAB from a PWA, ready for the Meta Horizon Store.
 * https://github.com/meta-quest/bubblewrap
 */
export class BubbleWrapper {
    private javaConfig: Config;
    private jdkHelper: JdkHelper;
    private androidSdkTools: AndroidSdkTools;
    private readonly eventEmitter = new EventEmitter();

    /**
     * @param packageSettings The settings for the Meta Horizon package generation.
     * @param projectDirectory The directory where to generate the project files and signed APK.
     * @param signingKeyInfo Information about the signing key.
     */
    constructor(
        private packageSettings: MetaHorizonPackageOptions,
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

    addEventListener(type: "progress", listener: (e: PackageCreationProgress) => void) {
        this.eventEmitter.addListener(type, listener);
    }

    removeEventListener(type: "progress", listener: (e: PackageCreationProgress) => void) {
        this.eventEmitter.removeListener(type, listener);
    }

    /**
     * Generates app package from the PWA, suitable for the Meta Horizon Store.
     */
    async generateAppPackage(): Promise<GeneratedAppPackage> {
        this.dispatchProgressEvent('Creating Trusted Web Activity (TWA) project for Meta Horizon...');
        await this.generateTwaProject();

        const apkPath = await this.buildApk();

        // Do we have a signing key?
        if (this.packageSettings.signingMode !== 'none' && this.signingKeyInfo) {
            if (this.packageSettings.signingMode === "new") {
                // temporary workaround for https://github.com/GoogleChromeLabs/bubblewrap/issues/693
                const passToUse = generatePassword(12, false);

                this.signingKeyInfo.keyPassword = passToUse;
                this.signingKeyInfo.storePassword = passToUse;
            }

            this.dispatchProgressEvent('Signing APK...');
            const signedApkPath = await this.signApk(apkPath, this.signingKeyInfo);
            const assetLinksPath = await this.tryGenerateAssetLinks(
                this.signingKeyInfo
            );

            this.dispatchProgressEvent('Building App Bundle...');
            const appBundlePath = await this.buildAppBundle(this.signingKeyInfo);
            this.dispatchProgressEvent("App bundle built successfully.");
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
        this.dispatchProgressEvent('Generating app bundle');

        const gradleWrapper = new GradleWrapper(
            process,
            this.androidSdkTools,
            this.projectDirectory
        );
        await gradleWrapper.bundleRelease();

        const appBundleDir = 'app/build/outputs/bundle/release';
        const inputFile = `${this.projectDirectory}/${appBundleDir}/app-release.aab`;

        if (!signingInfo) {
            return inputFile;
        }

        const outputFile = `${this.projectDirectory}/${appBundleDir}/app-release-signed.aab`;
        const jarSigner = new JarSigner(this.jdkHelper);
        // JarSigner.sign invokes jarsigner via execFile (no shell), so args
        // must be passed raw — see signApk for the same fix.
        const jarSigningInfo: SigningKeyInfo = {
            path: signingInfo.keyFilePath,
            alias: signingInfo.alias,
        };

        try {
            await jarSigner.sign(
                jarSigningInfo,
                signingInfo.storePassword,
                signingInfo.keyPassword,
                inputFile,
                outputFile
            );
            return outputFile;
        } catch (signingError) {
            const signingErrorStr = `${signingError}`;
            if (signingErrorStr.includes("toDerInputStream rejects tag type 75")) {
                this.dispatchProgressEvent("Error signing the app bundle due to what appears to be an invalid signing key file.", "error");
            } else {
                this.dispatchProgressEvent("Error signing the app bundle.", "error");
            }

            console.error("Error signing the app bundle", signingError);
            throw signingError;
        }
    }

    private async generateTwaProject(): Promise<TwaManifest> {
        const twaGenerator = new TwaGenerator();
        const twaManifest = this.createTwaManifest(this.packageSettings);
        try {
            await twaGenerator.createTwaProject(
                this.projectDirectory,
                twaManifest,
                new ConsoleLog()
            );
        } catch (error) {
            if (error instanceof Error && error.message.includes("Unexpected token '<'")) {
                this.dispatchProgressEvent("It appears your web app manifest is broken. When PWABuilder's Meta Horizon platform went to fetch it, your web app returned HTML instead of JSON. Make sure your web manifest can be loaded directly. Try opening your web app in the browser, open F12 dev tools -> Application -> Manifest, and ensure your web manifest is loading properly.", "error");
            } else if (error instanceof Error && error.message.includes("Could not find MIME for Buffer")) {
                this.dispatchProgressEvent("PWABuilder's Bubblewrap couldn't figure out the MIME type for one of the images in your web manifest. We recommend all your web manifest images should be PNG or JPG.", "error");
            }

            throw error;
        }
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
        this.dispatchProgressEvent("Building the app package with Gradle. This can take a few minutes...");
        await gradleWrapper.assembleRelease();
        return `${this.projectDirectory}/app/build/outputs/apk/release/app-release-unsigned.apk`;
    }

    private async signApk(
        apkFilePath: string,
        signingInfo: LocalKeyFileSigningOptions
    ): Promise<string> {
        if (this.packageSettings.signingMode === 'new') {
            await this.createSigningKey(signingInfo);
        }

        const outputFile = `${this.projectDirectory}/app-release-signed.apk`;
        this.dispatchProgressEvent('Signing the app package...');
        // androidSdkTools.apksigner invokes apksigner via execFile (no shell),
        // so the args must be passed raw — wrapping in literal double quotes
        // bakes the quotes into the password and breaks keystore loading.
        await this.androidSdkTools.apksigner(
            signingInfo.keyFilePath,
            signingInfo.storePassword,
            signingInfo.alias,
            signingInfo.keyPassword,
            apkFilePath,
            outputFile
        );
        this.dispatchProgressEvent('App package signed successfully');
        return outputFile;
    }

    async tryGenerateAssetLinks(
        signingInfo: LocalKeyFileSigningOptions
    ): Promise<string | null> {
        try {
            const result = await this.generateAssetLinks(signingInfo);
            return result;
        } catch (error) {
            this.dispatchProgressEvent(`Asset links couldn't be generated. Proceeding without asset links. Error: ${error}`);
            return null;
        }
    }

    async generateAssetLinks(
        signingInfo: LocalKeyFileSigningOptions
    ): Promise<string> {
        this.dispatchProgressEvent('Generating asset links...');
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
            this.packageSettings.packageId,
            sha256Fingerprint
        );
        await fs.promises.writeFile(assetLinksFilePath, assetLinks);
        this.dispatchProgressEvent(`Digital Asset Links file generated at ${assetLinksFilePath}`);
        return assetLinksFilePath;
    }

    private createTwaManifest(pwaSettings: MetaHorizonPackageOptions): TwaManifest {
        // Bubblewrap expects a TwaManifest object.
        // We create one using our package settings and signing key info.

        // Host without HTTPS: this is needed because the current version of Bubblewrap doesn't handle
        // a host with protocol specified. Remove the protocol here.
        let hostWithoutHttps = pwaSettings.host;
        const httpsProtocol = 'https://';
        if (hostWithoutHttps.startsWith(httpsProtocol)) {
            hostWithoutHttps = hostWithoutHttps.substring(httpsProtocol.length);
        }

        // Trim any trailing slash from the host.
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

        // Alpha dependencies must be turned on if Play Billing or Horizon Billing is enabled.
        const alphaDependencies = (pwaSettings.features?.playBilling?.enabled ||
            pwaSettings.features?.horizonBilling?.enabled)
            ? { enabled: true }
            : undefined;

        // Meta Horizon (Quest) requires API level 23+ at minimum.
        const minSdkVersion = pwaSettings.minSdkVersion ?? 23;

        // In the @meta-quest/bubblewrap-core fork, `applicationId` on TwaManifest is NOT the Android
        // applicationId (that is `packageId`). For Meta Quest, it's the OCULUS_APP_ID emitted into
        // AndroidManifest as the `com.meta.horizon.platform.ovr.OCULUS_APP_ID` meta-data, used by
        // the Meta Horizon Store (in-app purchase, platform SDK). It comes from the Meta Developer
        // Dashboard. Bubblewrap's own `fromWebManifestJson` defaults this to '0'.
        const metaHorizonAppId = pwaSettings.metaHorizonAppId || '0';

        const manifestJson: TwaManifestJson = {
            ...pwaSettings,
            applicationId: metaHorizonAppId,
            host: hostWithoutHttps,
            shortcuts: this.createShortcuts(
                pwaSettings.shortcuts,
                pwaSettings.webManifestUrl
            ),
            signingKey: signingKey,
            generatorApp: 'PWABuilder',
            alphaDependencies: alphaDependencies,
            isMetaQuest: true,
            minSdkVersion,
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
            this.dispatchProgressEvent(`Shortcut is invalid due to being null or undefined ${shortcut}`);
            return false;
        }
        if (!shortcut.icons) {
            this.dispatchProgressEvent(`Shortcut is invalid due to not having any icons specified ${shortcut}`);
            return false;
        }
        if (!shortcut.url) {
            this.dispatchProgressEvent(`Shortcut is invalid due to not having a URL ${shortcut}`);
            return false;
        }
        if (!shortcut.name && !shortcut.short_name) {
            this.dispatchProgressEvent(`Shortcut is invalid due to having neither a name nor short_name ${shortcut}`);
            return false;
        }
        if (!findSuitableIcon(shortcut.icons, 'any')) {
            this.dispatchProgressEvent(`Shortcut is invalid due to not finding a suitable icon ${shortcut.icons}`);
            return false;
        }

        return true;
    }

    private dispatchProgressEvent(message: string, level: "info" | "warn" | "error" = "info"): void {
        const ev: PackageCreationProgress = { message, level };
        this.eventEmitter.emit("progress", ev);
    }
}
