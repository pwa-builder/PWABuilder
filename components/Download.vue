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
import { validateAndroidOptions } from "../utils/android-utils";

const PublishState = namespace(publish.name, State);
const PublishAction = namespace(publish.name, Action);

import * as generator from "~/store/modules/generator";

const GeneratorState = namespace(generator.name, State);

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

  @Prop({ type: Object })
  public readonly androidOptions: publish.AndroidApkOptions | null;

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

    const sessionRef = sessionStorage.getItem("currentURL");
    if (sessionRef) {
      this.siteHref = sessionRef;
    }
  }

  public async generateAndroidPackage() {    
    const validationErrors = validateAndroidOptions(this.androidOptions);
    if (validationErrors.length > 0 || !this.androidOptions) {
      this.errorMessage = "Invalid Android options. " + validationErrors.map(a => a.error).join(", ");
      return;
    }
    
    this.isReady = false;
    const generateApkUrl = `${process.env.androidPackageGenerator}/generateApkZip`;
    try {
      const response = await fetch(generateApkUrl, {
        method: "POST",
        headers: new Headers({'content-type': 'application/json'}),
        body: JSON.stringify(this.androidOptions)
      });

      if (response.status === 200) {
        const data = await response.blob();
        const url = window.URL.createObjectURL(data);
        window.location.assign(url);
      } else {
        const responseText = await response.text();
        this.errorMessage = `Status code: ${response.status}, Error: ${response.statusText}, Details: ${responseText}`;
      }
    } catch (err) {
      this.errorMessage = `Status code: ${err.status}, Error: ${err.statusText}` || err;
    } finally {
      this.isReady = true;
    }
  }

  public async buildArchive(
    platform: string,
    parameters: string[]
  ): Promise<void> {
    if (!this.isReady) {
      return;
    }

    if (platform === "androidTWA") {
      await this.generateAndroidPackage();
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
  margin-left: -7px;
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
