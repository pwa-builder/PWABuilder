<template>
  <div>
    <ScoreHeader></ScoreHeader>
    <main id="sideBySide">
      <section id="leftSide">
        <header class="mastHead">
          <h2>{{ $t("generate.subtitle") }}</h2>
          <p>{{ $t("generate.instructions") }}</p>
        </header>

        <div id="dataSection">
          <div id="dataButtonsBlock">
            <div id="dataButtons">
              <button
                v-bind:class="{ active: showBasicSection }"
                @click="showBasicsSection()"
              >Basic Info</button>
              <button
                v-bind:class="{ active: showImagesSection }"
                @click="showImageSection()"
              >Images</button>
              <button
                v-bind:class="{ active: showSettingsSection }"
                @click="showSettingSection()"
              >Settings</button>
            </div>
          </div>

          <section class="animatedSection" v-if="showBasicSection">
            <div class="l-generator-field">
              <label class="l-generator-label">
                <h4 v-bind:class="{ fieldName: activeFormField === 'appName' }">{{ $t("generate.name") }}</h4>
                <p>Used for App lists or Store listings</p>
              </label>
              
              <input
                class="l-generator-input"
                v-model="manifest$.name"
                @change="onChangeSimpleInput()"
                type="text"
                v-on:focus="activeFormField = 'appName'"
              >
            </div>

            <div class="l-generator-field">
              <label class="l-generator-label">
                <h4 v-bind:class="{ fieldName: activeFormField === 'shortName' }">{{ $t("generate.short_name") }}</h4>
                <p>Used for tiles or home screens</p>
              </label>
              
              <input
                class="l-generator-input"
                v-model="manifest$.short_name"
                @change="onChangeSimpleInput()"
                name="short_name"
                type="text"
                v-on:focus="activeFormField = 'shortName'"
              >
            </div>

            <div class="l-generator-field">
              <label class="l-generator-label">
                <h4 v-bind:class="{ fieldName: activeFormField === 'appDesc' }">{{ $t("generate.description") }}</h4>
                <p>Used for App listings</p>
              </label>
              
              <textarea
                class="l-generator-textarea"
                v-model="manifest$.description"
                @change="onChangeSimpleInput()"
                name="description"
                type="text"
                v-on:focus="activeFormField = 'appDesc'"
              ></textarea>
            </div>

            <div class="l-generator-field">
              <label class="l-generator-label">
                <h4 v-bind:class="{ fieldName: activeFormField === 'startURL' }">{{ $t("generate.start_url") }}</h4>
                <p>This will be the first page that loads in your PWA.</p>
              </label>
              
              <input
                class="l-generator-input"
                v-model="manifest$.start_url"
                @change="onChangeSimpleInput()"
                type="text"
                v-on:focus="activeFormField = 'startURL'"
              >
            </div>
          </section>

          <section class="animatedSection" v-if="showImagesSection">
            <div class="l-generator-field logo-upload">
              <label class="l-generator-label">
                <h4 class="fieldName">{{ $t("generate.icon_url") }}</h4>
                <p>We suggest at least one image 512x512 or larger</p>
              </label>

              <div>
                <div class="button-holder icons">
                  <div class="l-inline">
                    <button
                      class="work-button l-generator-button"
                      @click="onClickUploadIcon()"
                    >{{ $t("generate.upload") }}</button>
                  </div>
                </div>

                <p class="l-generator-error" v-if="error">
                  <span class="icon-exclamation"></span>
                  {{ $t(error) }}
                </p>

                <div class="pure-g l-generator-table">
                  <div class="pure-u-10-24 l-generator-tableh">{{ $t("generate.preview") }}</div>
                  <div class="pure-u-8-24 l-generator-tableh">{{ $t("generate.size") }}</div>
                  <div class="pure-u-1-8"></div>
                  <div class="pure-u-1-8"></div>

                  <div class="pure-u-1" v-for="icon in icons" :key="icon.src">
                    <div class="pure-u-10-24 l-generator-tablec">
                      <a target="_blank" :href="icon.src">
                        <img class="icon-preview" :src="icon.src">
                      </a>
                    </div>

                    <div class="pure-u-8-24 l-generator-tablec">{{icon.sizes}}</div>

                    <div
                      class="pure-u-1-8 l-generator-tablec"
                      :title="$t('generate.icon_autogenerated')"
                    >
                      <span class="icon-magic" ng-if="icon.generated"></span>
                    </div>

                    <div
                      class="pure-u-1-8 l-generator-tablec l-generator-tablec--right"
                      @click="onClickRemoveIcon(icon)"
                    >
                      <span class="l-generator-close" :title="$t('generate.remove_icon')">
                        <i aria-hidden="true">
                          <span class="icon-times"></span>
                        </i>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="animatedSection" v-if="showSettingsSection">
            <div class="l-generator-field">
              <label class="l-generator-label">
                <h4 v-bind:class="{ fieldName: activeFormField === 'appScope' }">{{ $t("generate.scope") }}</h4>
                <p>scope determins what part of your website runs in the PWA</p>
              </label>
              
              <input
                class="l-generator-input"
                v-model="manifest$.scope"
                @change="onChangeSimpleInput()"
                type="text"
                v-on:focus="activeFormField = 'appScope'"
              >
            </div>

            <div class="l-generator-field">
              <label class="l-generator-label">
                <h4  v-bind:class="{ fieldName: activeFormField === 'displayMode' }">{{ $t("generate.display") }}</h4>
                <p>Display indetifies the browser components that should be included in your. "Standalone" appears as a traditional app</p>
              </label>
              
              <select
                class="l-generator-input l-generator-input--select"
                v-model="manifest$.display"
                @change="onChangeSimpleInput()"
                v-on:focus="activeFormField = 'displayMode'"
              >
                <option v-for="display in displaysNames" :value="display" :key="display">{{display}}</option>
              </select>
            </div>

            <div class="l-generator-field">
              <label class="l-generator-label">
                <h4 v-bind:class="{ fieldName: activeFormField === 'appOrientation' }">{{ $t("generate.orientation") }}</h4>
                <p>Orientation determines the perfered flow of your application</p>
              </label>
              
              <select
                class="l-generator-input l-generator-input--select"
                v-model="manifest$.orientation"
                @change="onChangeSimpleInput()"
                v-on:focus="activeFormField = 'appOrientation'"
              >
                <option
                  v-for="orientation in orientationsNames"
                  :value="orientation"
                  :key="orientation"
                >{{orientation}}</option>
              </select>
            </div>

            <div class="l-generator-field">
              <label class="l-generator-label">
                <h4 v-bind:class="{ fieldName: activeFormField === 'appLang' }">{{ $t("generate.language") }}</h4>
                <p>declare the language of your PWA</p>
              </label>
              
              <select class="l-generator-input l-generator-input--select" v-model="manifest$.lang">
                <option
                  v-for="language in languagesNames"
                  :value="language"
                  :key="language"
                  @change="onChangeSimpleInput()"
                  v-on:change="activeFormField = 'appLang'"
                >{{language}}</option>
              </select>
            </div>

            <div>
              <ColorSelector/>
            </div>

            <div>
              <input
                type="checkbox"
                id="related-applications-field"
                class="l-generator-togglecheck is-hidden"
              >
              
              <label class="l-generator-toggle" for="related-applications-field">
                <p
                  class="l-generator-subtitle l-generator-subtitle--toggleable"
                >{{ $t("generate.specify_application") }}</p>
              </label>

              <div class="l-generator-field l-generator-field--toggle">
                <RelatedApplications/>
              </div>
            </div>
          </section>
        </div>

        <div id="doneDiv">
          <!--<button id="doneButton">Done</button>-->
          <nuxt-link id="doneButton" to="reportCard">Done</nuxt-link>
        </div>
      </section>

      <section id="rightSide">
        <div id="exampleDiv">
          <a href="https://docs.microsoft.com/en-us/microsoft-edge/progressive-web-apps/get-started#web-app-manifest">
          Check our docs
          </a>

          for more info on how to use this manifest
        </div>
        <CodeViewer
          code-type="json"
          v-on:invalidManifest="invalidManifest()"
          v-on:editorValue="handleEditorValue($event)"
          v-if="seeEditor"
          :code="getCode()"
          :title="$t('generate.w3c_manifest')"
          :suggestions="suggestions"
          :suggestionsTotal="suggestionsTotal"
          :warnings="warnings"
          :warningsTotal="warningsTotal"
          :showToolbar="true"
          :showCopyButton="true"
        >
          <nuxt-link
            :to="$i18n.path('serviceworker')"
            class="pwa-button pwa-button--simple pwa-button--brand pwa-button--header"
            @click=" $awa( { 'referrerUri': 'https://www.pwabuilder.com/generator-nextStep-trigger' })"
          >{{ $t("serviceworker.next_step") }}</nuxt-link>
        </CodeViewer>
      </section>

      <Modal
        v-on:modalOpened="modalOpened()"
        v-on:modalClosed="modalClosed()"
        :title="$t('generate.upload_title')"
        ref="iconsModal"
        @submit="onSubmitIconModal"
        @cancel="onCancelIconModal"
      >
        <div class="l-generator-box image-upload">
          <span class="l-generator-label">{{ $t("generate.upload_image") }}</span>
          <label
            class="l-generator-input l-generator-input--fake is-disabled"
            for="modal-file"
          >{{ iconFile && iconFile.name ? iconFile.name : $t("generate.choose_file") }}</label>
          <input id="modal-file" @change="onFileIconChange" class="l-hidden" type="file">
        </div>

        <div class="l-generator-field">
          <label>
            <input type="checkbox" v-model="iconCheckMissing">
            {{ $t("generate.generate_missing") }}
          </label>
        </div>
      </Modal>
    </main>
  </div>
</template>



<script lang="ts">
import Vue from "vue";
import Component from "nuxt-class-component";
import { Action, State, Getter, namespace } from "vuex-class";

import GeneratorMenu from "~/components/GeneratorMenu.vue";
import Modal from "~/components/Modal.vue";
import CodeViewer from "~/components/CodeViewer.vue";
import RelatedApplications from "~/components/RelatedApplications.vue";
import CustomMembers from "~/components/CustomMembers.vue";
import StartOver from "~/components/StartOver.vue";
import ColorSelector from "~/components/ColorSelector.vue";
import GoodPWA from "~/components/GoodPWA.vue";
import ScoreHeader from "~/components/ScoreHeader.vue";

import * as generator from "~/store/modules/generator";

const GeneratorState = namespace(generator.name, State);
const GeneratorActions = namespace(generator.name, Action);
const GeneratorGetters = namespace(generator.name, Getter);

@Component({
  components: {
    GeneratorMenu,
    RelatedApplications,
    CustomMembers,
    ColorSelector,
    CodeViewer,
    StartOver,
    Modal,
    GoodPWA,
    ScoreHeader
  }
})
export default class extends Vue {
  public manifest$: generator.Manifest | null = null;
  public newIconSrc = "";
  public iconCheckMissing = true;
  private iconFile: File | null = null;
  public error: string | null = null;
  public seeEditor = true;
  public basicManifest = false;
  public showBasicSection = true;
  public showImagesSection = false;
  public showSettingsSection = false;
  public activeFormField = null;

  @GeneratorState manifest: generator.Manifest;
  @GeneratorState members: generator.CustomMember[];
  @GeneratorState icons: generator.Icon[];
  @GeneratorState suggestions: string[];
  @GeneratorState warnings: string[];

  @Getter orientationsNames: string[];
  @Getter languagesNames: string[];
  @Getter displaysNames: string[];

  @GeneratorActions removeIcon;
  @GeneratorActions addIconFromUrl;
  @GeneratorActions updateManifest;
  @GeneratorActions uploadIcon;
  @GeneratorActions generateMissingImages;

  @GeneratorGetters suggestionsTotal;
  @GeneratorGetters warningsTotal;

  public created(): void {
    this.manifest$ = { ...this.manifest };
  }

  async destroyed() {
    (this.$root.$el.closest("body") as HTMLBodyElement).classList.remove(
      "modal-screen"
    );
  }

  public onChangeSimpleInput(): void {
    try {
      console.log(this.manifest$);
      this.updateManifest(this.manifest$);
      // this.manifest$ = this.manifest;
    } catch (e) {
      this.error = e;
    }
  }

  public onClickRemoveIcon(icon: generator.Icon): void {
    this.removeIcon(icon);
  }

  public onClickAddIcon(): void {
    try {
      console.log("trying to add icon from URL", this.newIconSrc);
      this.addIconFromUrl(this.newIconSrc);
    } catch (e) {
      this.error = e;
      console.error(e);
    }
  }

  public onFileIconChange(e: Event): void {
    const target = e.target as HTMLInputElement;

    if (!target.files) {
      return;
    }

    this.iconFile = target.files[0];
  }

  private getIcons(): string {
    let icons = this.icons.map(icon => {
      return `
        {
            "src": "${
              icon.src.includes("data:image") ? "[Embedded]" : icon.src
            }",
            "sizes": "${icon.sizes}"
        }`;
    });

    return icons.toString();
  }

  private getCustomMembers(): string {
    if (this.members.length < 1) {
      return "";
    }

    let membersString = `,`;
    this.members.forEach((member, i) => {
      if (i === this.members.length - 1) {
        membersString += `"${member.name}" : "${member.value}"`;
      } else {
        membersString += `"${member.name}" : "${member.value}",
    `;
      }
    });

    return membersString;
  }

  private getManifestProperties(): string {
    let manifest = "";
    for (let property in this.manifest) {
      if (property !== "icons") {
        manifest += `"${property}" : "${this.manifest[property]}",
    `;
      }
    }
    manifest += `"icons" : [${this.getIcons()}
    ]`;
    manifest += this.getCustomMembers();
    return `{${manifest}}`;
  }

  public getCode(): string | null {
    return this.manifest ? this.getManifestProperties() : null;
  }

  public onClickUploadIcon(): void {
    (this.$refs.iconsModal as Modal).show();
  }

  public onClickShowGBB(): void {
    (this.$refs.nextStepModal as Modal).show();
  }

  public onClickHideGBB(): void {
    (this.$refs.nextStepModal as Modal).hide();
  }

  public async onSubmitIconModal(): Promise<void> {
    const $iconsModal = this.$refs.iconsModal as Modal;

    if (!this.iconFile) {
      return;
    }

    $iconsModal.showLoading();

    if (this.iconCheckMissing) {
      await this.generateMissingImages(this.iconFile);
    } else {
      await this.uploadIcon(this.iconFile);
    }

    $iconsModal.hide();
    $iconsModal.hideLoading();
    this.iconFile = null;
  }

  public onCancelIconModal(): void {
    this.iconFile = null;
  }

  public seeManifest() {
    this.seeEditor = true;
  }

  public seeGuidance() {
    this.seeEditor = false;
  }

  public invalidManifest() {
    console.log("invalid");
    this.basicManifest = false;
  }

  public handleEditorValue(ev) {
    console.log(ev);
    console.log(this.basicManifest);
    if (this.basicManifest !== false) {
      this.manifest$ = ev;
    }
  }

  public showBasicsSection() {
    this.showBasicSection = true;
    this.showImagesSection = false;
    this.showSettingsSection = false;
  }

  public showImageSection() {
    this.showImagesSection = true;
    this.showBasicSection = false;
    this.showSettingsSection = false;
  }

  public showSettingSection() {
    this.showSettingsSection = true;
    this.showImagesSection = false;
    this.showBasicSection = false;
  }

  public modalOpened() {
    (this.$root.$el.closest("body") as HTMLBodyElement).classList.add(
      "modal-screen"
    );
  }

  public modalClosed() {
    (this.$root.$el.closest("body") as HTMLBodyElement).classList.remove(
      "modal-screen"
    );
  }
}
</script>

<style lang="scss" scoped>
@import "~assets/scss/base/variables";
/* stylelint-disable */

#sideBySide {
  display: flex;
  justify-content: space-around;
  height: 100vh;

  #leftSide {
    flex: 1;
    background: white;
    height: 100%;

    .mastHead {
      padding-top: 40px;
      padding-right: 100px;
      padding-left: 164px;

      h2 {
        font-size: 32px;
        font-weight: bold;
        color: black;
        width: 376px;
      }

      p {
        margin-top: 20px;
        font-size: 18px;
        line-height: 28px;
        width: 376px;
      }
    }

    #dataSection {
      padding-top: 40px;
      padding-left: 164px;
      width: 642px;

      #dataButtonsBlock {
        display: flex;
        justify-content: center;
        padding-right: 6em;
      }

      #dataButtons {
        display: flex;
        margin-bottom: 2em;
        justify-content: space-between;
        width: 292px;
        background: #E2E2E2;
        border-radius: 22px;

        button {
          background: none;
          border: none;
          font-weight: bold;
          font-size: 14px;
          color: #8A8A8A;
          padding-top: 6px;
          padding-bottom: 7px;
          border-radius: 20px;
          width: 92px;
          height: 32px;
          box-shadow: none;
        }

        .active {
          background: $color-button-primary-purple-variant;
          color: white;
        }
      }
    }

    .animatedSection {
      .fieldName {
        color: $color-button-primary;
        font-size: 18px;
        font-weight: bold;
      }

      h4 {
        font-size: 18px;
        font-weight: bold;
        color: #2C2C2C;
        padding-top: 30px;
      }

      p {
        font-size: 14px;
        color: grey;
      }

      input {
        font-size: 18px;
        padding-left: 0;
      }
    }

    #doneDiv {
      display: flex;
      justify-content: center;
      margin-bottom: 62px;
      padding-left: 100px;

      #doneButton {
        background: $color-button-primary-purple-variant;
        width: 130px;
        height: 44px;
        border-radius: 20px;
        border: none;
        font-weight: bold;
        font-size: 18px;
        margin-top: 24px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
      }
    }
  }

  #rightSide {
    flex: 1;
    width: 4em;
    height: 120vh;
    background: #F0F0F0;
  }

  #exampleDiv {
    padding: 1em;
    font-weight: bold;
  }

  @media (min-width: 2559px) {
    .mastHead p {
      width: 534px !important;
    }
  }

  @media (max-width: 1290px) {
    #rightSide {
      height: 136vh;
    }
  }
}
</style>