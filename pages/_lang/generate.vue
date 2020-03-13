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
                @keyup="onChangeSimpleInput()"
                type="text"
                v-on:focus="activeFormField = 'appName'"
                placeholder="App Name"
              />
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
                @keyup="onChangeSimpleInput()"
                name="short_name"
                type="text"
                v-on:focus="activeFormField = 'shortName'"
                placeholder="App Short Name"
              />
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
                @keydown.enter.exact.prevent="textareaError"
                @keypress="textareaCheck"
                @keyup="onChangeSimpleInput()"
                name="description"
                type="text"
                v-on:focus="activeFormField = 'appDesc'"
                placeholder="App Description"
                v-bind:style="{ outline: textareaOutlineColor}"
              ></textarea>
              <span v-if="ifEntered" class="hint" id="textarea_error">Newline not allowed</span>
              <span v-else class="hint" id="textarea_error"></span>
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
                @keyup="onChangeSimpleInput()"
                type="text"
                v-on:focus="activeFormField = 'startURL'"
                placeholder="Start URL"
              />
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

                  <div id="iconItem" class="pure-u-1" v-for="icon in filterIcons(icons)" :key="icon.src">
                    <div id="iconDivItem" class="pure-u-10-24 l-generator-tablec">
                      <a target="_blank" :href="icon.src">
                        <img class="icon-preview" :src="icon.src" />
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
                @keyup="onChangeSimpleInput()"
                type="text"
                placeholder="App Scope"
                v-on:focus="activeFormField = 'appScope'"
              />
            </div>

            <div class="l-generator-field">
              <label class="l-generator-label">
                <h4
                  v-bind:class="{ fieldName: activeFormField === 'displayMode' }"
                >{{ $t("generate.display") }}</h4>
                <p>Display identifies the browser components that should be included in your. "Standalone" appears as a traditional app.</p>
              </label>

              <select
                class="l-generator-input l-generator-input--select"
                v-model="manifest$.display"
                @change="onChangeSimpleInput(), update()"
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
                @change="onChangeSimpleInput(), update()"
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
                @change="onChangeSimpleInput(), update()"
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
              <ColorSelector />
            </div>

          </section>
        </div>

        <div id="doneDiv">
          <!--<button id="doneButton">Done</button>-->
          <nuxt-link @click.native="saveChanges" id="doneButton" to="reportCard">Done</nuxt-link>
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
          monaco-id="manifestHTMLId"
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
          :showCopyButton="showCopy"
          monaco-id="manifestCodeId"
          id="manifestCode"
        >
          <h3>Add this code to your manifest.json file</h3>
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
            <input id="modal-file" @change="onFileIconChange" class="l-hidden" type="file" />
          </div>

          <div class="l-generator-field">
            <label id="genMissingLabel">
              {{ $t("generate.generate_missing") }}
              <input
                type="checkbox"
                v-model="iconCheckMissing"
              />
            </label>
          </div>
        </section>
      </Modal>
    </main>

    <footer>
      <p>
        PWA Builder was founded by Microsoft as a community guided, open source project to help move PWA adoption forward.
        <a
          href="https://privacy.microsoft.com/en-us/privacystatement"
        >Our Privacy Statement</a>
      </p>
    </footer>
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
import helper from '~/utils/helper';
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
  public ifEntered = false;
  public  textareaOutlineColor = '';
  public showCopy = true;

  @GeneratorState manifest: generator.Manifest;
  @GeneratorState members: generator.CustomMember[];
  @GeneratorState icons: generator.Icon[];
  @GeneratorState screenshots: generator.Screenshot[];
  @GeneratorState suggestions: string[];
  @GeneratorState warnings: string[];
  @Getter orientationsNames: string[];
  @Getter languagesNames: string[];
  @Getter displaysNames: string[];
  @GeneratorActions removeIcon;
  @GeneratorActions addIconFromUrl;
  @GeneratorActions updateManifest;
  @GeneratorActions update;
  @GeneratorActions commitManifest;
  @GeneratorActions uploadIcon;
  @GeneratorActions generateMissingImages;
  @GeneratorGetters suggestionsTotal;
  @GeneratorGetters warningsTotal;

  public created(): void {
    this.manifest$ = { ...this.manifest };
  }

  public mounted() {
    const overrideValues = {
      isAuto: false,
      behavior: 0,
      uri: window.location.href,
      pageName: "manifestPage",
      pageHeight: window.innerHeight
    };

    var updateFn = helper.debounce(this.update, 3000, false);

    document && document.querySelectorAll('.l-generator-input').forEach(item => {
      item.addEventListener('keyup', updateFn)
    });
    document && document.querySelectorAll('.l-generator-textarea').forEach(item => {
      item.addEventListener('keyup', updateFn)
    });
    awa.ct.capturePageView(overrideValues);
  }

  async destroyed() {
    (this.$root.$el.closest("body") as HTMLBodyElement).classList.remove(
      "modal-screen"
    );
  }

  public saveChanges(): void {
    this.updateManifest(this.manifest$);
    this.manifest$ = { ...this.manifest };
  }

  public onChangeSimpleInput(): void {
    try {
      this.commitManifest(this.manifest$);
      this.manifest$ = { ...this.manifest };
    } catch (e) {
      this.error = e;
    }
  }

  public filterIcons(icons): any {
    return icons.filter(icon => { 
      if (!icon.generated || icon.src.indexOf('data') === 0)
      {
        return icon;
      }
    });
  }

  public textareaError(): void {
    // This method is called when Enter is pressed in the textarea
    this.ifEntered = true; // This property is used to determine whether or not an error message should be displayed
    this.textareaOutlineColor = 'red solid 2px';
  }
  public textareaCheck(): void {
    // If the user presses any key other than Enter, then reset ifEntered values to remove error message
    // This method is only called on keypress (not when entered is clicked)
    this.ifEntered = false;
    this.textareaOutlineColor = '';
  } 

  public onClickRemoveIcon(icon: generator.Icon): void {
    this.removeIcon(icon);
    this.updateManifest(this.manifest$);
  }

  public onClickAddIcon(): void {
    try {
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
    // check for embedded icons
    // if embedded dont show the copy button;
    if (this.icons.length > 0 && this.icons[0].src.includes("data:image")) {
      this.showCopy = false;
    }

    let icons = this.icons.map(icon => {
      return `\n\t\t{\n\t\t\t"src": "${icon.src.includes("data:image") ? "[Embedded]" : icon.src}",\n\t\t\t"sizes": "${icon.sizes}"\n\t\t}`;
    });
    return icons.toString();
  }

  private getScreenshots(): string {
    let icons = this.screenshots.map(screenshot => {
      return `\n\t\t{\n\t\t\t"src": "${screenshot.src.includes("data:image") ? "[Embedded]" : screenshot.src}",\n\t\t\t"description": "${screenshot.description}",\n\t\t\t"size": "${screenshot.size}"\n\t\t}`;
    });
    return icons.toString();
  }

  private relatedApplications(): string {
    let relatedApplicationscons = this.manifest.related_applications.map(app => {
      return `\n\t\t{\n\t\t\t"platform": "${app.platform}",\n\t\t\t"url": "${app.url}"\n\t\t}`;
    });
    return relatedApplicationscons.toString();
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
        membersString += `"${member.name}" : "${member.value}",\n`;
      }
    });
    return membersString;
  }

  private getManifestProperties(): string {
    let manifest = "";
    for (let property in this.manifest) {
      switch (property) {
        case "icons":
          manifest += `\t"icons" : [${this.getIcons()}],\n`;
          break;
        case "screenshots":
          manifest += `\t"screenshots" : [${this.getScreenshots()}],\n`;
          break;
        case "related_applications":
          manifest += `\t"related_applications" : [${this.relatedApplications() || []}],\n`
          break;
        case "prefer_related_applications":
          manifest += `\t"prefer_related_applications" : ${this.manifest.prefer_related_applications},\n`
          break;
        default:
          manifest += `\t"${property}" : "${this.manifest[property] ? this.manifest[property] : ''}",\n`;
          break;
      }
    }
    // Removing the last ',' 
    manifest = manifest.substring(0, manifest.length-2);
    manifest += this.getCustomMembers();
    return `{\n${manifest}\n}`;
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
      await this.generateMissingImages(this.iconFile);

      this.manifest$ = this.manifest;
      this.updateManifest(this.manifest$);
    } else {
      await this.uploadIcon(this.iconFile);
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
    this.basicManifest = false;
  }

  public handleEditorValue() {
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

Vue.prototype.$awa = function(config) {
  awa.ct.capturePageView(config);
  return;
};

declare var awa: any;
</script>

<style lang="scss">
@import "~assets/scss/base/variables";

#manifestCode {
  width: 100%;
}

#textarea_error {
  color: red;
}

footer {
  display: flex;
  justify-content: center;
  padding-left: 15%;
  padding-right: 15%;
  font-size: 12px;
  color: rgba(60, 60, 60, 0.5);
  background: white;
}

footer p {
  text-align: center;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 18px;
  color: #707070;
}

footer a {
  color: #707070;
  text-decoration: underline;
}

/* stylelint-disable */
#iconGrid {
  display: grid;
  grid-template-columns: auto auto auto;
  display: grid;
  grid-template-columns: auto auto auto;
  grid-gap: 54px;
  #iconItem {
    margin-left: auto;
    margin-right: auto;
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
  padding-left: 3%;
  padding-right: 3%;
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
      width: 100%;
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
        // width: 28em;
        width: 100%;
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
  #manifestHTML {
    height: 4em;
    margin-top: 3em;
    margin-bottom: 5em;
  }
  #manifestHTML .code_viewer-pre {
    height: 4em !important;
  }
  #manifestHTMLId {
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
  #rightSide {
    width: 55%; 
  }
  #leftSide {
    width: 40%;
  }
@media (max-width: 1280px) {
  #rightSide {
    display: none;
  }
  #leftSide {
    width: 100%;
  }
  #sideBySide {
    flex-direction: column;
    padding-left: 31px !important;
    padding-right: 24px !important;
  }
  #sideBySide #leftSide .animatedSection {
    width: 100%;
  }
  #sideBySide #leftSide .animatedSection input {
    width: 100%;
  }
  #iconGrid {
    display: grid;
    grid-gap: initial;
  }
  .l-generator-input--select {
    max-width: 210px;
  }
}

@media (max-width: 630px) {
  #uploadNewSection {
    display: none;
  }
}

  #sideBySide #leftSide .animatedSection input[type="radio"] {
    width: auto;
  }
</style>