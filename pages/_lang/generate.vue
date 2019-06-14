<template>
  <div>
    <HubHeader :showSubHeader="true"></HubHeader>

    <div v-if="showingIconModal" class="has-acrylic-40 is-dark" id="modalBackground"></div>

    <main id="sideBySide">
      <section id="leftSide">
        <header class="mastHead">
          <h2>{{ $t("generate.subtitle") }}</h2>
          <p>{{ $t("generate.instructions") }}</p>
        </header>

        <div id="dataSection">
          <div id="dataButtonsBlock">
            <div id="dataButtons">
              <button v-bind:class="{ active: showBasicSection }" @click="showBasicsSection()">Info</button>
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
                <h4
                  v-bind:class="{ fieldName: activeFormField === 'appName' }"
                >{{ $t("generate.name") }}</h4>
                <p>Used for App lists or Store listings</p>
              </label>

              <input
                class="l-generator-input"
                v-model="manifest$.name"
                @change="onChangeSimpleInput()"
                type="text"
                v-on:focus="activeFormField = 'appName'"
                placeholder="App Name"
              >
            </div>

            <div class="l-generator-field">
              <label class="l-generator-label">
                <h4
                  v-bind:class="{ fieldName: activeFormField === 'shortName' }"
                >{{ $t("generate.short_name") }}</h4>
                <p>Used for tiles or home screens</p>
              </label>

              <input
                class="l-generator-input"
                v-model="manifest$.short_name"
                @change="onChangeSimpleInput()"
                name="short_name"
                type="text"
                v-on:focus="activeFormField = 'shortName'"
                placeholder="App Short Name"
              >
            </div>

            <div class="l-generator-field">
              <label class="l-generator-label">
                <h4
                  v-bind:class="{ fieldName: activeFormField === 'appDesc' }"
                >{{ $t("generate.description") }}</h4>
                <p>Used for App listings</p>
              </label>

              <textarea
                id="descText"
                class="l-generator-textarea"
                v-model="manifest$.description"
                @change="onChangeSimpleInput()"
                name="description"
                type="text"
                v-on:focus="activeFormField = 'appDesc'"
                placeholder="App Description"
              ></textarea>
            </div>

            <div class="l-generator-field">
              <label class="l-generator-label">
                <h4
                  v-bind:class="{ fieldName: activeFormField === 'startURL' }"
                >{{ $t("generate.start_url") }}</h4>
                <p>This will be the first page that loads in your PWA.</p>
              </label>

              <input
                class="l-generator-input"
                v-model="manifest$.start_url"
                @change="onChangeSimpleInput()"
                type="text"
                v-on:focus="activeFormField = 'startURL'"
                placeholder="Start URL"
              >
            </div>
          </section>

          <section class="animatedSection" v-if="showImagesSection">
            <div class="l-generator-field logo-upload">
              <div id="uploadNewSection">
                <label class="l-generator-label">
                  <h4 class="iconUploadHeader">Upload app icons for your PWA</h4>
                  <p>We suggest at least one image 512×512 or larger</p>
                </label>

                <div class="button-holder icons">
                  <div class="l-inline">
                    <button
                      id="iconUploadButton"
                      class="work-button l-generator-button"
                      @click="onClickUploadIcon()"
                    >Upload</button>
                  </div>
                </div>

                <!--<p class="l-generator-error" v-if="error">
                  <span class="icon-exclamation"></span>
                  {{ $t(error) }}
                </p>-->
              </div>

              <div>
                <div id="iconGrid" class="pure-g l-generator-table">
                  <!--<div class="pure-u-10-24 l-generator-tableh">{{ $t("generate.preview") }}</div>
                  <div class="pure-u-8-24 l-generator-tableh">{{ $t("generate.size") }}</div>
                  <div class="pure-u-1-8"></div>
                  <div class="pure-u-1-8"></div>-->

                  <div id="iconItem" class="pure-u-1" v-for="icon in icons" :key="icon.src">
                    <div id="iconDivItem" class="pure-u-10-24 l-generator-tablec">
                      <a target="_blank" :href="icon.src">
                        <img class="icon-preview" :src="icon.src">
                      </a>

                      <div id="iconSize" class="pure-u-8-24 l-generator-tablec">
                        <div id="iconSizeText">{{icon.sizes}}</div>

                        <div
                          id="removeIconDiv"
                          class="pure-u-1-8 l-generator-tablec l-generator-tablec--right"
                          @click="onClickRemoveIcon(icon)"
                        >
                          <span class="l-generator-close" :title="$t('generate.remove_icon')">
                            <i class="fas fa-trash-alt"></i>
                          </span>
                        </div>
                      </div>
                    </div>

                    <!--<div
                      class="pure-u-1-8 l-generator-tablec"
                      :title="$t('generate.icon_autogenerated')"
                    >
                      <span class="icon-magic" ng-if="icon.generated"></span>
                    </div>-->
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="animatedSection" v-if="showSettingsSection">
            <div class="l-generator-field">
              <label class="l-generator-label">
                <h4
                  v-bind:class="{ fieldName: activeFormField === 'appScope' }"
                >{{ $t("generate.scope") }}</h4>
                <p>Scope determines what part of your website runs in the PWA</p>
              </label>

              <input
                class="l-generator-input"
                v-model="manifest$.scope"
                @change="onChangeSimpleInput()"
                type="text"
                placeholder="App Scope"
                v-on:focus="activeFormField = 'appScope'"
              >
            </div>

            <div class="l-generator-field">
              <label class="l-generator-label">
                <h4
                  v-bind:class="{ fieldName: activeFormField === 'displayMode' }"
                >{{ $t("generate.display") }}</h4>
                <p>Display indetifies the browser components that should be included in your. "Standalone" appears as a traditional app.</p>
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
                <h4
                  v-bind:class="{ fieldName: activeFormField === 'appOrientation' }"
                >{{ $t("generate.orientation") }}</h4>
                <p>Orientation determines the perfered flow of your application.</p>
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
                <h4
                  v-bind:class="{ fieldName: activeFormField === 'appLang' }"
                >{{ $t("generate.language") }}</h4>
                <p>Declare the language of your PWA</p>
              </label>

              <select
                class="l-generator-input l-generator-input--select"
                v-model="manifest$.lang"
                @change="onChangeSimpleInput()"
                v-on:change="activeFormField = 'appLang'"
              >
                <option
                  v-for="language in languagesNames"
                  :value="language"
                  :key="language"
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
        <!--<div id="exampleDiv">
          <h3>Add this code to your start page:</h3>

          <code>&lt;link rel="manifest" href="/manifest.json"&gt;</code>
        </div>-->

        <CodeViewer
          code-type="html"
          v-if="seeEditor"
          title="Add this code to your start page"
          code="<link rel='manifest' href='/manifest.json'>"
          :showHeader="true"
          :showCopyButton="true"
          id="manifestHTML"
        >
          <h3>Add this code to your start page:</h3>
        </CodeViewer>

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
          :showHeader="true"
          :showCopyButton="true"
        >
          <h3>Add this code to your manifest.webmanifest file</h3>
        </CodeViewer>
      </section>

      <Modal
        v-on:modalOpened="modalOpened()"
        v-on:modalClosed="modalClosed()"
        :title="$t('generate.upload_title')"
        ref="iconsModal"
        v-on:modalSubmit="onSubmitIconModal"
        v-on:cancel="onCancelIconModal"
      >
        <section id="imageModalSection">
          <div class="l-generator-box image-upload">
            <span class="l-generator-label">{{ $t("generate.upload_image") }}</span>
            <label
              class="l-generator-input l-generator-input--fake is-disabled"
              for="modal-file"
            >{{ iconFile && iconFile.name ? iconFile.name : $t("generate.choose_file") }}</label>
            <input id="modal-file" @change="onFileIconChange" class="l-hidden" type="file">
          </div>

          <div class="l-generator-field">
            <label id="genMissingLabel">
              {{ $t("generate.generate_missing") }}
              <input
                type="checkbox"
                v-model="iconCheckMissing"
              >
            </label>
          </div>
        </section>
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
import HubHeader from "~/components/HubHeader.vue";

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
    HubHeader
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
  public showingIconModal = false;

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
    // this.basicManifest = true;

    console.log("display names", this.displaysNames);
  }

  async destroyed() {
    (this.$root.$el.closest("body") as HTMLBodyElement).classList.remove(
      "modal-screen"
    );
  }

  public onChangeSimpleInput(): void {
    try {
      this.updateManifest(this.manifest$);

      this.manifest$ = { ...this.manifest };
      console.log(this.manifest$);

      console.log("display names after update", this.displaysNames);

      // this.manifest = (this.manifest$ as generator.Manifest);

      // this.basicManifest = true;

      // this.manifest = this.manifest$;
    } catch (e) {
      this.error = e;
    }
  }

  public onClickRemoveIcon(icon: generator.Icon): void {
    this.removeIcon(icon);
    console.log("this.manifest$", this.manifest$);
    console.log("this.manifest", this.manifest);
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
    this.showingIconModal = true;
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
      const data = await this.generateMissingImages(this.iconFile);
      console.log("data in gen missing images", data);
      console.log("generate missing images", this.manifest);

      this.manifest$ = this.manifest;

      console.log("update manifest this.manifest$", this.manifest$);
      this.updateManifest(this.manifest$);
    } else {
      await this.uploadIcon(this.iconFile);
      console.log("update manifest this.manifest$", this.manifest$);
      this.updateManifest(this.manifest$);
    }

    $iconsModal.hide();
    $iconsModal.hideLoading();
    this.iconFile = null;
    this.showingIconModal = false;
  }

  public onCancelIconModal(): void {
    this.iconFile = null;
    this.showingIconModal = false;
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
      // this.manifest = ev;
      this.updateManifest(this.manifest$);
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
    this.showingIconModal = false;
  }
}
</script>

<style lang="scss">
@import "~assets/scss/base/variables";
/* stylelint-disable */

#iconGrid {
  display: grid;
  grid-template-columns: auto auto auto;
  display: grid;
  grid-template-columns: auto auto auto;
  grid-gap: 54px;

  #iconItem {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 128px;
    width: 128px;

    #iconDivItem {
      width: 100%;
      justify-content: center;
      align-items: center;
      display: flex;
      flex-direction: column;
    }

    #iconSize {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      margin-top: 17px;

      #iconSizeText {
        font-size: 14px;
        margin-right: 12px;
      }
    }
  }
}

#descText {
  line-height: 24px;
  height: 5em;
}

#uploadNewSection {
  background: #f0f0f0;
  border-radius: 4px;
  margin-top: 24px;
  padding-left: 30px;
  padding-right: 30px;
  padding-top: 24px;
  padding-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .iconUploadHeader {
    padding-top: 0px !important;
    font-size: 16px;
  }

  #iconUploadButton {
    width: 104px;
    height: 40px;
    background: transparent;
    color: #3c3c3c;
    font-weight: bold;
    border-radius: 20px;
    border: 1px solid #3c3c3c;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: Poppins;
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
  }
}

#removeIconDiv svg {
  height: 14px;
  width: 14px;
}

#modalBackground {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  opacity: 0.7;
  z-index: 98999;
  will-change: opacity;
  background: #3c3c3c;
}

#imageModalSection {
  display: flex;
}

#genMissingLabel {
  display: flex;

  font-family: Poppins;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.02em;
}

#genMissingLabel input {
  height: 2em;
  width: 2em;
}

#sideBySide {
  background: white;
  padding-left: 154px;
  padding-right: 128px;
  display: flex;
  justify-content: space-between;

  #leftSide {
    background: white;
    min-height: 974px;

    .mastHead {
      padding-top: 40px;

      h2 {
        font-family: Poppins;
        font-style: normal;
        font-weight: 600;
        font-size: 24px;
        line-height: 54px;
        letter-spacing: -0.02em;
        color: #3c3c3c;
      }

      p {
        font-style: normal;
        font-weight: normal;
        font-size: 16px;
        line-height: 28px;
      }
    }

    #dataSection {
      padding-top: 32px;

      #dataButtonsBlock {
        display: flex;
        justify-content: center;
      }

      #dataButtons {
        display: flex;
        justify-content: space-between;
        border-bottom: solid 1px rgba(60, 60, 60, 0.3);
        width: 20em;

        button {
          background: none;
          border: none;
          color: rgba(60, 60, 60, 0.6);
          width: 110px;
          height: 32px;
          box-shadow: none;
          text-transform: uppercase;

          font-family: Poppins;
          font-style: normal;
          font-weight: 600;
          font-size: 14px;
          line-height: 16px;
        }

        button:hover {
          color: #3c3c3c;
          border-bottom: solid 4px #9337d8;
          border-image: linear-gradient(to right, #1fc2c8, #9337d8 116%) 10;
        }

        .active {
          color: #9337d8;
          border-bottom: solid 4px #9337d8;
          border-image: linear-gradient(to right, #1fc2c8, #9337d8 116%) 10;
        }
      }
    }

    .animatedSection {
      width: 500px;

      .fieldName {
        color: #9337d8;
        font-size: 16px;
        font-weight: bold;
      }

      h4 {
        font-style: normal;
        line-height: 24px;
        font-size: 16px;
        font-weight: bold;
        margin-top: 32px;
      }

      p {
        font-size: 14px;
        color: grey;
      }

      input {
        padding-left: 0;
        width: 28em;

        font-style: normal;
        font-weight: normal;
        font-size: 16px;
        line-height: 33px;
      }

      input:focus {
        border-color: #9337d8;
        outline: none;
      }
    }

    #doneDiv {
      display: flex;
      justify-content: center;
      margin-bottom: 62px;

      #doneButton {
        background: #3c3c3c;
        width: 97px;
        font-family: Poppins;
        font-style: normal;
        font-weight: 600;
        font-size: 14px;

        height: 44px;
        border-radius: 20px;
        border: none;

        margin-top: 24px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
      }
    }
  }

  #rightSide {
    width: 870px;
    margin-left: 60px;
  }

  #manifestHTML {
    height: 4em;
    margin-top: 3em;
    margin-bottom: 5em;
  }

  #manifestHTML .code_viewer-pre {
    height: 4em !important;
  }

  #exampleDiv {
    padding: 1em;
    font-weight: bold;
    margin-top: 40px;
    margin-bottom: 16px;
    background: #f1f1f1;
  }

  #exampleDiv code {
    font-family: sans-serif;
    font-size: 12px;
    line-height: 20px;
    color: #9337d8;
    margin-left: 16px;
  }

  #exampleDiv h3 {
    font-family: Poppins;
    font-style: normal;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    padding-left: 1em;
  }

  @media (min-width: 2559px) {
    .mastHead p {
      width: 534px !important;
    }
  }
}

@media (max-width: 425px) {
  #rightSide {
    display: none;
  }

  #sideBySide {
    flex-direction: column;
    padding-left: 31px !important;
    padding-right: 24px !important;
  }

  #sideBySide #leftSide .animatedSection {
    width: initial;
  }

  #sideBySide #leftSide .animatedSection input {
    width: initial;
  }

  #iconGrid {
    display: grid;
    grid-gap: initial;
    padding-left: 0px;
  }

  #uploadNewSection {
    display: none;
  }

  .l-generator-input--select {
    max-width: 210px;
  }
}

@media (max-width: 1290px) {
  #sideBySide {
    padding-left: 54px;
    padding-right: 52px;
  }
}

@media (min-width: 1480px) {
  #leftSide {
    width: 760px !important;
  }

  #rightSide {
    width: 760px !important;
  }
}
</style>
