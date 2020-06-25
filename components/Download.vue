<template>
  <button
    :class="{
      'pwa-button--brand': isBrand,
      'pwa-button--total_right': isRight,
    }"
    :disabled="downloadDisabled"
    @click="buildArchive(platform, parameters)"
  >
    <span v-if="isReady">
      <i v-if="!showMessage" class="fas fa-long-arrow-alt-down"></i>

      <span v-if="showMessage">{{ message$ }}</span>
    </span>

    <div id="colorSpinner" v-if="!isReady">
      <div class="flavor">
        <div class="colorbands"></div>
      </div>
      <div class="icon">
        <div class="lds-dual-ring"></div>
      </div>
    </div>

    <div id="errorDiv" v-if="errorMessage">{{ errorMessage }}</div>
  </button>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "nuxt-class-component";
import Loading from "~/components/Loading.vue";
import { Prop } from "vue-property-decorator";
import { Action, State, namespace } from "vuex-class";

import * as publish from "~/store/modules/publish";

const PublishState = namespace(publish.name, State);
const PublishAction = namespace(publish.name, Action);

import * as generator from "~/store/modules/generator";
const GeneratorState = namespace(generator.name, State);

import { generatePackageId } from "../utils/packageID";

@Component({
  components: {
    Loading
  }
})
export default class extends Vue {
  public isReady = true;
  public errorMessage = "";
  public siteHref: string = "/";

  @Prop({ type: String, default: "" })
  public readonly platform: string;

  @Prop({ type: String, default: "" })
  public readonly packageName: string;

  @Prop({
    type: Array,
    default: function() {
      return [];
    }
  })
  public readonly parameters: string[];

  @Prop({ type: Boolean, default: false })
  public readonly isBrand: boolean;

  @Prop({ type: Boolean, default: false })
  public readonly isRight: boolean;

  @Prop({ type: String, default: "" })
  private readonly message: string;
  public message$ = "";

  @Prop({ type: Boolean, default: false })
  public showMessage: boolean;

  @PublishState archiveLink: string;
  @PublishState downloadDisabled: boolean;

  @PublishAction build;
  @PublishAction buildTeams;

  @GeneratorState manifest: generator.Manifest;
  @GeneratorState manifestUrl: string;

  public created(): void {
    this.message$ = this.message;

    try {
      const sessionRef = sessionStorage.getItem("currentURL");
      if (sessionRef) {
        this.siteHref = sessionRef;
      }
    } catch (err) {
      console.error(err);
    }
  }

  async handleTWA() {
    this.isReady = false;

    const goodIcon = await this.getGoodIcon();

    let maskIcon = this.getMaskableIcon();

    if (goodIcon.message !== undefined) {
      this.isReady = true;
      this.errorMessage = goodIcon.message;
    } else {
      this.callTWA(goodIcon, maskIcon);
    }
  }

  public async callTWA(goodIcon, maskIcon) {
    const packageid = this.packageName || generatePackageId((this.manifest.short_name as string) || (this.manifest.name as string));

    let startURL = (this.manifest.start_url as string).replace(
      `https://${new URL(this.siteHref).hostname}`,
      ""
    );

    let manifestStartUrl = new URL(this.manifest.start_url as string);
    if (manifestStartUrl.search && startURL.length > 0) {
      startURL = `${startURL}${manifestStartUrl.search}`;
    }

    const packageGenArgs = JSON.stringify({
      packageId: this.packageName ||  `com.${packageid
        .split(" ")
        .join("_")
        .toLowerCase()}`,
      host: new URL(this.siteHref).hostname,
      name: this.manifest.short_name || this.manifest.name,
      themeColor: this.manifest.theme_color || this.manifest.background_color,
      navigationColor:
        this.manifest.theme_color || this.manifest.background_color,
      backgroundColor:
        this.manifest.background_color || this.manifest.theme_color,
      startUrl:
        startURL && startURL.length > 0
          ? startURL
          : `${manifestStartUrl.search ? "/" + manifestStartUrl.search : "/"}`,
      iconUrl: goodIcon.src,
      maskableIconUrl: maskIcon ? maskIcon.src : null,
      appVersion: "1.0.0",
      useBrowserOnChromeOS: true,
      splashScreenFadeOutDuration: 300,
      enableNotifications: false,
      shortcuts: this.manifest.shortcuts || [],
      webManifestUrl: this.manifestUrl,
      signingInfo: {
        fullName: "PWABuilder User",
        organization: "pwabuilder",
        organizationalUnit: "Engineering Department",
        countryCode: "US"
      }
    });

    const packageGenUrl = new URL("/generateSignedApkZip", process.env.androidPackageGeneratorUrl);
    const postBody = {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: packageGenArgs
    };
    try {
      const response = await fetch(packageGenUrl.toString(), postBody);
      if(response.status === 200) {
        const data = await response.blob();

        let url = window.URL.createObjectURL(data);
        window.location.assign(url);
      }
      else {
        this.errorMessage = `Status code: ${response.status}, Error: ${response.statusText}`;
      }
    } catch (err) {
      this.errorMessage =
        `Status code: ${err.status}, Error: ${err.statusText}` || err;
    } finally {
      this.isReady = true;
    }
  }

  public getMaskableIcon() {
    // make copy of icons so nuxt does not complain
    const icons = [...(this.manifest as any).icons];

    let found;

    icons.forEach(icon => {
      if (icon.purpose && icon.purpose === "maskable") {
        found = icon;
      }
    });

    return found;
  }

  public async getGoodIcon(): Promise<any> {
    return new Promise<any>(async resolve => {
      // make copy of icons so nuxt does not complain
      const icons = [...(this.manifest as any).icons];

      // we prefer large icons first, so sort array from largest to smallest
      const sortedIcons = icons.sort((a, b) => {
        // convert icon.sizes to a legit integer we can use to sort
        let aSize = parseInt(a.sizes.split("x").pop());
        let bSize = parseInt(b.sizes.split("x").pop());

        return bSize - aSize;
      });

      let goodIcon = sortedIcons.find(icon => {
        // look for 512 icon first, this is the best case
        if (icon.sizes.includes("512") && !icon.src.includes("data:image")) {
          return icon;
        }
        // 192 icon up next if we cant find a 512. This may end up with the icon on the splashscreen
        // looking a little blurry, but better than no icon
        else if (
          icon.sizes.includes("192") &&
          !icon.src.includes("data:image")
        ) {
          return icon;
        }
        // cant find a good icon
        else {
          return null;
        }
      });

      if (goodIcon) {
        await this.isValidUrl(goodIcon.src).then(
          function fulfilled() {
            resolve(goodIcon);
          },

          function rejected() {
            // Continue to iterate icons collection to find a good icon.
          }
        );
      }

      let i = 0;
      for (i; i < (this.manifest as any).icons.length; i++) {
        goodIcon = (this.manifest as any).icons[i];
        var imageFound = false;
        if (!goodIcon.src.includes("data:image")) {
          await this.isValidUrl(goodIcon.src).then(
            function fulfilled() {
              imageFound = true;
            },

            function rejected() {
              imageFound = false;
            }
          );
          if (imageFound) {
            break;
          }
        }
      }


      if (i === (this.manifest as any).icons.length) {
        resolve({ isValidUrl: false, message: `${goodIcon.src} is not found` });
      } else {
        resolve(goodIcon);
      }
    });
  }

  public async isValidUrl(url) {
    const imgPromise = new Promise(function imgPromise(resolve, reject) {
      const imgElement = new Image();

      // When image is loaded, resolve the promise
      imgElement.addEventListener("load", function imgOnLoad() {
        resolve(this);
      });

      // When there's an error during load, reject the promise
      imgElement.addEventListener("error", function imgOnError() {
        reject();
      });

      imgElement.src = url;
    });

    return imgPromise;
  }

  public imageFound() {
    return { isValidUrl: true };
  }

  public imageNotFound() {
    return { isValidUrl: false };
  }

  public async buildArchive(
    platform: string,
    parameters: string[]
  ): Promise<void> {
    if (!this.isReady) {
      return;
    }

    if (platform === "androidTWA") {
      await this.handleTWA();
    } else {
      try {
        this.isReady = false;

        if (platform === "msteams") {
          await this.buildTeams({
            href: this.siteHref,
            options: parameters
          });
        } else {
          await this.build({
            platform: platform,
            href: this.siteHref,
            options: parameters
          });
        }

        if (this.archiveLink) {
          window.location.href = this.archiveLink;
        }

        // Because browser delay
        setTimeout(() => (this.isReady = true), 3000);
      } catch (e) {
        this.isReady = true;
        this.errorMessage = e;
      }
    }

    const overrideValues = {
      uri: window.location.href,
      pageName: `download/${platform}`,
      pageHeight: window.innerHeight
    };

    if (this.$awa) {
      this.$awa(overrideValues);
    }
  }
}

declare var awa: any;

Vue.prototype.$awa = function(config) {
  if (awa) {
    awa.ct.capturePageView(config);
  }

  return;
};
</script>

<style lang="scss" scoped>
button:disabled {
  background: rgba(60, 60, 60, .1);
  cursor: pointer;
}

#errorDiv {
  position: absolute;
  color: white;
  width: 15em;
  text-align: start;
  font-size: 14px;
  position: fixed;
  bottom: 2em;
  right: 2em;
  background: #3c3c3c;
  padding: 1em;
  border-radius: 4px;
}

#colorSpinner {
  margin-top: -1px !important;
  height: 32px;
}

@-moz-document url-prefix() {
  #colorSpinner {
    margin-top: 38px !important;
    margin-left: 10px !important;
  }
}

.flavor {
  width: 32px;
  height: 32px;
  border-radius: 40px;
  overflow: hidden;
}

.flavor > .colorbands {
  position: relative;
  top: 0%;
  left: -20%;

  width: 140%;
  height: 800%;

  background-image: linear-gradient(
    0deg,
    #1fc2c8 25%,
    #9337d8 50%,
    #9337d8 75%,
    #1fc2c8 100%
  );
  background-position: 0px 0px;
  background-repeat: repeat-y;

  animation: colorbands 100s linear infinite;
  transform: rotate(180deg);
}

@keyframes colorbands {
  to {
    background-position: 0 -1000vh;
  }
}

.icon {
  position: relative;
  color: white;
  top: -25px;
  left: 7px;

  .lds-dual-ring {
    display: inline-block;
    width: 32px;
    height: 32px;
  }

  .lds-dual-ring:after {
    content: " ";
    display: block;
    width: 16px;
    height: 16px;
    margin: 1px;
    border-radius: 50%;
    border: 5px solid #fff;
    border-color: #fff transparent #fff transparent;
    animation: lds-dual-ring 1.2s linear infinite;
  }

  @keyframes lds-dual-ring {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
}
</style>
