<template>
  <div>
    <HubHeader :showSubHeader="true" :disableHeader="showingIconModal"></HubHeader>

    <div v-if="showingIconModal" class="has-acrylic-40 is-dark" id="modalBackground"></div>
    <div
      v-if="isInvalidScreenshotUrl"
      id="invalidUrlToast"
    >Invalid url(s): {{ `${invalidScreenshotUrlValues}` }}. Please try again.</div>
    <main id="main">
      <section id="leftSide" :aria-hidden="ariaHidden">
        <header class="mastHead">
          <h2>{{ $t('generate.subtitle') }}</h2>
          <p>{{ $t('generate.instructions') }}</p>
        </header>

        <div id="dataSection">
          <div id="dataButtonsBlock">
            <div id="dataButtons" role="tablist">
              <button
                id="infoTabButton"
                v-bind:class="{ active: showBasicSection }"
                @click="showBasicsSection()"
                role="tab"
                aria-controls="infoTab"
                aria-label="Info"
                :aria-selected="showBasicSection ? 'true' : 'false'"
                tabindex="0"
              >Info</button>
              <button
                id="imagesTabButton"
                v-bind:class="{ active: showImagesSection }"
                @click="showImageSection()"
                role="tab"
                aria-label="Images"
                aria-controls="imagesTab"
                :aria-selected="showImagesSection ? 'true' : 'false'"
                :tabindex="bodyTabIndex"
              >Images</button>
              <button
                id="settingsTabButton"
                v-bind:class="{ active: showSettingsSection }"
                @click="showSettingSection()"
                role="tab"
                aria-label="Settings"
                aria-controls="settingsTab"
                :aria-selected="showSettingsSection ? 'true' : 'false'"
                :tabindex="bodyTabIndex"
                :aria-hidden="ariaHidden"
              >Settings</button>
            </div>
          </div>

          <section
            id="infoTab"
            class="animatedSection"
            role="tabpanel"
            aria-labelledby="infoTabButton"
            v-if="showBasicSection"
          >
            <div class="l-generator-field">
              <label class="l-generator-label">
                <h4
                  v-bind:class="{ fieldName: activeFormField === 'appName' }"
                >{{ $t('generate.name') }}</h4>
                <p>Used for App lists or Store listings</p>
              </label>

              <input
                class="l-generator-input"
                v-model="manifest$.name"
                @keyup="onChangeSimpleInput()"
                type="text"
                v-on:focus="activeFormField = 'appName'"
                placeholder="App Name"
                aria-label="App Name"
                :tabindex="bodyTabIndex"
                :aria-hidden="ariaHidden"
              />
            </div>

            <div class="l-generator-field">
              <label class="l-generator-label">
                <h4
                  v-bind:class="{ fieldName: activeFormField === 'shortName' }"
                >{{ $t('generate.short_name') }}</h4>
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
                aria-label="App Short Name"
                :tabindex="bodyTabIndex"
                :aria-hidden="ariaHidden"
              />
            </div>

            <div class="l-generator-field">
              <label class="l-generator-label">
                <h4
                  v-bind:class="{ fieldName: activeFormField === 'appDesc' }"
                >{{ $t('generate.description') }}</h4>
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
                v-bind:style="{ outline: textareaOutlineColor }"
                aria-label="App Description"
                :tabindex="bodyTabIndex"
                :aria-hidden="ariaHidden"
              ></textarea>
              <span v-if="ifEntered" class="hint" id="textarea_error">Newline not allowed</span>
              <span v-else class="hint" id="textarea_error"></span>
            </div>

            <div class="l-generator-field">
              <label class="l-generator-label">
                <h4
                  v-bind:class="{ fieldName: activeFormField === 'startURL' }"
                >{{ $t('generate.start_url') }}</h4>
                <p>This will be the first page that loads in your PWA.</p>
              </label>

              <input
                class="l-generator-input"
                v-model="manifest$.start_url"
                @keyup="onChangeSimpleInput()"
                type="text"
                v-on:focus="activeFormField = 'startURL'"
                placeholder="Start URL"
                aria-label="Start URL"
                :tabindex="bodyTabIndex"
                :aria-hidden="ariaHidden"
              />
            </div>
          </section>

          <section
            id="imagesTab"
            class="animatedSection"
            role="tabpanel"
            aria-labelledby="imagesTabButton"
            v-if="showImagesSection"
          >
            <div class="l-generator-field logo-upload">
              <div id="uploadNewSection">
                <label class="l-generator-label">
                  <h4 class="iconUploadHeader">Upload app icons for your PWA</h4>
                  <p v-if="!isImageBroken">We suggest at least one image 512×512 or larger</p>
                  <p class="brokenImage" v-if="isImageBroken">
                    If you want a bigger images, we suggest to you to upload at
                    least one image 512×512 or larger
                  </p>
                </label>

                <div class="button-holder icons">
                  <div class="l-inline">
                    <button
                      id="iconDownloadButton"
                      class="work-button l-generator-button"
                      :class="{ disabled: zipRequested }"
                      @click="onClickDownloadAll()"
                      :disabled="zipRequested"
                      :tabindex="bodyTabIndex"
                      :aria-hidden="ariaHidden"
                    >Download All</button>
                  </div>
                  <div class="l-inline">
                    <button
                      id="iconUploadButton"
                      class="work-button l-generator-button"
                      @click="onClickUploadIcon()"
                      :tabindex="bodyTabIndex"
                      :aria-hidden="ariaHidden"
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

                  <div
                    id="iconItem"
                    class="pure-u-1"
                    v-for="icon in filterIcons(icons)"
                    :key="icon.src"
                  >
                    <div id="iconDivItem" class="pure-u-10-24 l-generator-tablec">
                      <a
                        target="_blank"
                        :href="icon.src"
                        :tabindex="bodyTabIndex"
                        :aria-hidden="ariaHidden"
                      >
                        <img
                          class="icon-preview"
                          :src="icon.src"
                          :aria-label="icon.src"
                          alt="linter place holder"
                          :alt="'icon representing an image from uri: ' + icon.src"
                        />
                      </a>

                      <div id="iconSize" class="pure-u-8-24 l-generator-tablec">
                        <div id="iconSizeText">{{ icon.sizes }}</div>

                        <div
                          id="removeIconsDiv"
                          class="pure-u-1-8 l-generator-tablec l-generator-tablec--right"
                          role="button"
                          @click="onClickRemoveIcon(icon)"
                          :tabindex="bodyTabIndex"
                          :aria-label="'delete icon of size ' + icon.sizes"
                          :aria-hidden="ariaHidden"
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
            <div id="screenshotsTool" :tabindex="bodyTabIndex" :aria-hidden="ariaHidden">
              <div class="l-generator-field">
                <label class="l-generator-label">
                  <h4>Generate screenshots for your PWA</h4>
                  <p>
                    Specify the URLs to generate desktop and mobile screenshots
                    from. You may add up to 8 screenshots.
                  </p>
                </label>
                <div
                  id="screenshotsUrlsContainer"
                  class="form-group"
                  v-for="(url, k) in urlsForScreenshot"
                  :key="k"
                >
                  <input
                    class="screenshot-input l-generator-input"
                    v-model="urlsForScreenshotValues[k]"
                    name="screenshot"
                    type="text"
                    v-on:focus="activeFormField = 'screenshot'"
                    placeholder="URL"
                    :tabindex="bodyTabIndex"
                    :aria-hidden="ariaHidden"
                  />
                  <span>
                    <span
                      class="outlineontab"
                      role="button"
                      aria-label="Remove Screenshot URL"
                      tabindex="0"
                      @click="removeUrlForScreenshots(k)"
                      @keyup.enter="removeUrlForScreenshots(k)"
                      v-show="k || (!k && urlsForScreenshot.length > 1)"
                    >
                      <i
                        class="fas fa-minus-circle outlineontab_content"
                        aria-hidden="true"
                        style="cursor:pointer"
                        tabindex="-1"
                      ></i>
                    </span>
                    <span
                      class="outlineontab"
                      role="button"
                      aria-label="Add Screenshot URL"
                      tabindex="0"
                      @click="addUrlForScreenshots(k)"
                      @keyup.enter="addUrlForScreenshots(k)"
                      v-show="
                        k == urlsForScreenshot.length - 1 &&
                          screenshots.length + k <= 6
                      "
                    >
                      <i
                        class="fas fa-plus-circle outlineontab_content"
                        aria-hidden="true"
                        style="cursor:pointer"
                        tabindex="-1"
                      ></i>
                    </span>
                  </span>
                </div>
              </div>
              <div>
                <button
                  id="screenshotDownloadButton"
                  class="work-button l-generator-button"
                  role="button"
                  @click="onClickScreenshotFetch()"
                  :tabindex="bodyTabIndex"
                  :aria-hidden="ariaHidden"
                >
                  <span
                    v-if="!screenshotLoading"
                    id="screenshotDownloadButton_content"
                    tabindex="-1"
                  >Generate Screenshots</span>
                  <span
                    v-if="screenshotLoading"
                    tabindex="-1"
                    id="screenshotDownloadButton_content"
                  >
                    <Loading
                      :active="screenshotLoading"
                      class="u-display-inline_block u-margin-left-sm"
                    />
                  </span>
                </button>
              </div>
            </div>

            <div id="screenshotsOuterDiv" v-show="screenshots.length > 0">
              <div id="screenshotsContainer">
                <button
                  v-show="screenshots.length >= 2"
                  :tabindex="bodyTabIndex"
                  :aria-hidden="ariaHidden"
                  aria-label="scroll left"
                  role="button"
                  ref="scrollLeft"
                  @keydown.tab.exact="handleTabPressLeft($event)"
                  @click="scrollToLeft()"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path
                      d="M401.4 224h-214l83-79.4c11.9-12.5 11.9-32.7 0-45.2s-31.2-12.5-43.2 0L89 233.4c-6 5.8-9 13.7-9 22.4v.4c0 8.7 3 16.6 9 22.4l138.1 134c12 12.5 31.3 12.5 43.2 0 11.9-12.5 11.9-32.7 0-45.2l-83-79.4h214c16.9 0 30.6-14.3 30.6-32 .1-18-13.6-32-30.5-32z"
                    />
                  </svg>
                </button>
                <section id="screenshots" ref="screenshots">
                  <div
                    class="screenshotItem"
                    v-for="(screenshot, k) in filterIcons(screenshots)"
                    :key="screenshot.src"
                  >
                    <a
                      v-if="!screenshot.src.startsWith('data:image')"
                      aria-hidden="false"
                      target="_blank"
                      :href="screenshot.src"
                      class="screenshotImage"
                      ref="screenshotImage"
                      aria-label="Screenshot image"
                      aria-describedby="pageNumber"
                      @keydown.tab="handleTabPressOnScreenshot($event)"
                    >
                      <img alt="screenshot image" :src="screenshot.src" />
                    </a>
                    <a
                      v-if="screenshot.src.startsWith('data:image')"
                      aria-hidden="false"
                      target="_blank"
                      :href="'javascript:document.write(\'<img src=' + screenshot.src + ' style=' + generatedImageStyle + ' />\')'"
                      class="screenshotImage"
                      ref="screenshotImage"
                      aria-label="Screenshot image"
                      aria-describedby="pageNumber"
                      @keydown.tab="handleTabPressOnScreenshot($event)"
                    >
                      <img alt="screenshot image" :src="screenshot.src" />
                    </a>
                    <div id="screenshotsToolbar">
                      <div style="width:27px;">
                        <span v-if="screenshot.sizes !== undefined">
                          {{
                          `${screenshot.sizes}`
                          }}
                        </span>
                      </div>
                      <span aria-hidden="true" id="pageNumber">
                        {{
                        `${k + 1} of ${screenshots.length}`
                        }}
                      </span>
                      <button
                        id="removeScreenshotsDiv"
                        class="pure-u-1-8 l-generator-tablec l-generator-tablec--right removeScreenshotsButton"
                        ref="removeScreenshotsButton"
                        aria-label="Delete screenshot"
                        @click="onClickRemoveScreenshot($event, screenshot, k)"
                        @keydown.tab="handleTabPressOnTrash($event)"
                        :tabindex="bodyTabIndex"
                        :aria-hidden="ariaHidden"
                      >
                        <span class="l-generator-close">
                          <i class="fas fa-trash-alt"></i>
                        </span>
                      </button>
                    </div>
                  </div>
                </section>
                <button
                  @click="scrollToRight()"
                  v-show="screenshots.length >= 2"
                  role="button"
                  aria-label="scroll right"
                  :tabindex="bodyTabIndex"
                  :aria-hidden="ariaHidden"
                  @keydown.tab="handleTabPressRight($event)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path
                      d="M284.9 412.6l138.1-134c6-5.8 9-13.7 9-22.4v-.4c0-8.7-3-16.6-9-22.4l-138.1-134c-12-12.5-31.3-12.5-43.2 0-11.9 12.5-11.9 32.7 0 45.2l83 79.4h-214c-17 0-30.7 14.3-30.7 32 0 18 13.7 32 30.6 32h214l-83 79.4c-11.9 12.5-11.9 32.7 0 45.2 12 12.5 31.3 12.5 43.3 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </section>

          <section
            id="settingsTag"
            class="animatedSection"
            role="tabpanel"
            aria-labelledby="settingsTabButton"
            v-if="showSettingsSection"
          >
            <div class="l-generator-field">
              <label class="l-generator-label">
                <h4
                  v-bind:class="{ fieldName: activeFormField === 'appScope' }"
                >{{ $t('generate.scope') }}</h4>
                <p>Scope determines what part of your website runs in the PWA</p>
              </label>

              <input
                class="l-generator-input"
                v-model="manifest$.scope"
                @keyup="onChangeSimpleInput()"
                type="text"
                placeholder="App Scope"
                v-on:focus="activeFormField = 'appScope'"
                aria-label="App Scope"
                :tabindex="bodyTabIndex"
                :aria-hidden="ariaHidden"
              />
            </div>

            <div class="l-generator-field">
              <label class="l-generator-label">
                <h4
                  v-bind:class="{
                    fieldName: activeFormField === 'displayMode',
                  }"
                >{{ $t('generate.display') }}</h4>
                <p>
                  Display identifies the browser components that should be
                  included in your. "Standalone" appears as a traditional app.
                </p>
              </label>

              <select
                class="l-generator-input l-generator-input--select"
                v-model="manifest$.display"
                @change="onChangeSimpleInput(), update()"
                v-on:focus="activeFormField = 'displayMode'"
                aria-label="Display Mode"
                :tabindex="bodyTabIndex"
                :aria-hidden="ariaHidden"
              >
                <option
                  v-for="display in displaysNames"
                  :value="display"
                  :key="display"
                >{{ display }}</option>
              </select>
            </div>

            <div class="l-generator-field">
              <label class="l-generator-label">
                <h4
                  v-bind:class="{
                    fieldName: activeFormField === 'appOrientation',
                  }"
                >{{ $t('generate.orientation') }}</h4>
                <p>Orientation determines the perfered flow of your application.</p>
              </label>

              <select
                class="l-generator-input l-generator-input--select"
                v-model="manifest$.orientation"
                @change="onChangeSimpleInput(), update()"
                v-on:focus="activeFormField = 'appOrientation'"
                aria-label="App Orientation"
                :tabindex="bodyTabIndex"
                :aria-hidden="ariaHidden"
              >
                <option
                  v-for="orientation in orientationsNames"
                  :value="orientation"
                  :key="orientation"
                >{{ orientation }}</option>
              </select>
            </div>

            <div class="l-generator-field">
              <label class="l-generator-label">
                <h4
                  v-bind:class="{ fieldName: activeFormField === 'appLang' }"
                >{{ $t('generate.language') }}</h4>
                <p>Declare the language of your PWA</p>
              </label>

              <select
                class="l-generator-input l-generator-input--select"
                v-model="manifest$.lang"
                @change="onChangeSimpleInput(), update()"
                v-on:change="activeFormField = 'appLang'"
                aria-label="App Language"
                :tabindex="bodyTabIndex"
                :aria-hidden="ariaHidden"
              >
                <option
                  v-for="language in languagesNames"
                  :value="language"
                  :key="language"
                >{{ language }}</option>
              </select>
            </div>

            <div>
              <ColorSelector />
            </div>
          </section>
        </div>

        <div id="doneDiv">
          <!--<button id="doneButton">Done</button>-->
          <nuxt-link
            id="doneButton"
            to="reportCard"
            ref="doneButton"
            :tabindex="bodyTabIndex"
            :aria-hidden="ariaHidden"
            @click.native="saveChanges"
          >Done</nuxt-link>
        </div>
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
            <span class="l-generator-label">
              {{
              $t('generate.upload_image')
              }}
            </span>
            <label class="l-generator-input l-generator-input--fake is-disabled" for="modal-file">
              {{
              iconFile && iconFile.name
              ? iconFile.name
              : $t('generate.choose_file')
              }}
            </label>
            <input id="modal-file" @change="onFileIconChange" class="l-hidden" type="file" />
          </div>

          <div class="l-generator-field">
            <label id="genMissingLabel">
              {{ $t('generate.generate_missing') }}
              <input
                type="checkbox"
                v-model="iconCheckMissing"
              />
            </label>
          </div>
          <div v-if="this.iconFileErrorNoneUploaded" class="l-generator-field">
            <p
              id="uploadImageError"
              role="alert"
            >{{ $t('generate.upload_image_error_none_uploaded') }}</p>
          </div>
          <div v-if="this.iconFileErrorIncorrectType" class="l-generator-field">
            <p
              id="uploadImageError"
              role="alert"
            >{{ $t('generate.upload_image_error_incorrect_type') }}</p>
          </div>
        </section>
      </Modal>

      <section id="rightSide" :tabindex="bodyTabIndex" :aria-hidden="ariaHidden">
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
          :tabindex="bodyTabIndex"
          :aria-hidden="ariaHidden"
        >
          <h3>Add this code to your start page:</h3>
        </CodeViewer>

        <CodeViewer
          code-type="json"
          v-on:invalidManifest="invalidManifest()"
          v-on:editorValue="updateManifestFn($event)"
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
          :tabindex="bodyTabIndex"
          :aria-hidden="ariaHidden"
        >
          <h3>Add this code to your manifest.json file</h3>
        </CodeViewer>
      </section>
    </main>

    <footer>
      <p>
        PWA Builder was founded by Microsoft as a community guided, open source
        project to help move PWA adoption forward.
        <a
          href="https://privacy.microsoft.com/en-us/privacystatement"
          :tabindex="bodyTabIndex"
          :aria-hidden="ariaHidden"
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
import Loading from "~/components/Loading.vue";
import StartOver from "~/components/StartOver.vue";
import ColorSelector from "~/components/ColorSelector.vue";
import HubHeader from "~/components/HubHeader.vue";
import * as generator from "~/store/modules/generator";
import helper from "~/utils/helper";
import axios from "axios";
import download from "downloadjs";
import { Screenshot } from "~/store/modules/generator";

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
    HubHeader,
    Loading,
  },
})
export default class extends Vue {
  public manifest$: generator.Manifest | null = null;
  public screenshotLoading: boolean = false;
  public screenshotNumber: number = 0;
  public isInvalidScreenshotUrl: boolean = false;
  public invalidScreenshotUrlValues: string[] = [];
  public newIconSrc = "";
  public iconCheckMissing = true;
  public urlsForScreenshot = [{ value: "" }];
  public urlsForScreenshotValues = [];
  private iconFile: File | null = null;
  public iconFileErrorNoneUploaded = false;
  public iconFileErrorIncorrectType = false;
  public error: string | null = null;
  public seeEditor = true;
  public basicManifest = false;
  public showBasicSection = true;
  public showImagesSection = false;
  public showSettingsSection = false;
  public activeFormField = null;
  public showingIconModal = false;
  public ifEntered = false;
  public textareaOutlineColor = "";
  public showCopy = true;
  public isImageBroken: boolean = false;
  public updateManifestFn = helper.debounce(
    this.handleEditorValue,
    3000,
    false
  );
  public generatedImageStyle =
    '"display:block;margin-left:auto;margin-right:auto;height:50%"';

  private zipRequested = false;

  get bodyTabIndex() {
    return this.showingIconModal ? -1 : 0;
  }

  get ariaHidden() {
    return this.showingIconModal ? true : false;
  }

  @GeneratorState manifest: generator.Manifest;
  @GeneratorState members: generator.CustomMember[];
  @GeneratorState icons: generator.Icon[];
  @GeneratorState screenshots: generator.Screenshot[];
  @GeneratorState suggestions: string[];
  @GeneratorState shortcuts: generator.ShortcutItem[];
  @GeneratorState warnings: string[];
  @Getter orientationsNames: string[];
  @Getter languagesNames: string[];
  @Getter displaysNames: string[];
  @GeneratorActions removeIcon;
  @GeneratorActions removeScreenshot;
  @GeneratorActions addIconFromUrl;
  @GeneratorActions updateManifest;
  @GeneratorActions update;
  @GeneratorActions commitManifest;
  @GeneratorActions uploadIcon;
  @GeneratorActions isValidUrls;
  @GeneratorActions addScreenshotsFromUrl;
  @GeneratorActions generateMissingImages;
  @GeneratorGetters suggestionsTotal;
  @GeneratorGetters warningsTotal;

  public created(): void {
    this.manifest$ = { ...this.manifest };
    this.urlsForScreenshotValues[0] =
      this.manifest$.url !== undefined ? this.manifest$.url : "";
  }

  public mounted() {
    const overrideValues = {
      isAuto: false,
      behavior: 0,
      uri: window.location.href,
      pageName: "manifestPage",
      pageHeight: window.innerHeight,
    };

    // might be the issue
    var updateFn = helper.debounce(this.update, 3000, false);

    document &&
      document.querySelectorAll(".l-generator-input").forEach((item) => {
        item.addEventListener("keyup", updateFn);
      });
    document &&
      document.querySelectorAll(".l-generator-textarea").forEach((item) => {
        item.addEventListener("keyup", updateFn);
      });

    if (awa) {
      awa.ct.capturePageView(overrideValues);
    }
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

  public onClickDownloadAll() {
    // local azure function
    this.zipRequested = true;
    const images: generator.Icon[] = [];
    const length = this.icons.length;
    // prevent the passing of the observer objects in the body.
    for (let i = 0; i < length; i++) {
      images.push({ ...this.icons[i] });
    }

    axios
      .post(
        "https://azure-express-zip-creator.azurewebsites.net/api",
        JSON.stringify({ images }),
        {
          method: "POST",
          responseType: "blob",
          headers: {
            "content-type": "application/json",
          },
        }
      )
      .then(async (res) => {
        if (window.chooseFileSystemEntries) {
          const fsOpts = {
            type: "save-file",
            accepts: [
              {
                description: "PWA Builder Image Zip",
                extensions: ["zip"],
                mimeTypes: ["application/zip"],
              },
            ],
          };
          const fileHandle = await window.chooseFileSystemEntries(fsOpts);
          // Create a FileSystemWritableFileStream to write to.
          const writable = await fileHandle.createWritable();
          // Write the contents of the file to the stream.
          await writable.write(res);
          // Close the file and write the contents to disk.
          await writable.close();
        } else {
          download(res.data, "pwa-icons.zip", "application/zip");
        }
        this.zipRequested = false;
      })
      .catch((err) => {
        console.log(err);
        this.zipRequested = false;
      });
  }

  public onChangeSimpleInput(): void {
    try {
      this.commitManifest(this.manifest$);
      this.manifest$ = { ...this.manifest };
    } catch (e) {
      this.error = e;
    }
  }

  public scrollToLeft(): void {
    const screenshotsDiv = this.$refs.screenshots as HTMLDivElement;
    screenshotsDiv.scrollBy({
      // left: -15,
      left: -screenshotsDiv.clientWidth,
      top: 0,
      behavior: "smooth",
    });
    if (this.screenshotNumber > 0) {
      this.screenshotNumber -= 1;
    }
  }
  public scrollToRight(): void {
    const screenshotsDiv = this.$refs.screenshots as HTMLDivElement;
    // screenshotsDiv.scrollBy(10, 0);
    screenshotsDiv.scrollBy({
      // left: 15,
      left: screenshotsDiv.clientWidth,
      top: 0,
      behavior: "smooth",
    });
    if (this.screenshotNumber < this.screenshots.length - 1) {
      this.screenshotNumber += 1;
    }
  }
  public handleTabPressLeft(e): void {
    console.log("Screenshot number on tab left", this.screenshotNumber);
    e.preventDefault();

    (this.$refs.screenshotImage[this.screenshotNumber] as HTMLElement).focus();
  }

  public handleTabPressOnScreenshot(e): void {
    if (this.screenshots.length > 1) {
      console.log("Screenshot number on tab screenshot", this.screenshotNumber);
      e.preventDefault();
      if (e.shiftKey) {
        (this.$refs.scrollLeft as HTMLElement).focus();
      } else {
        (this.$refs.scrollRight as HTMLElement).focus();
      }
    }
  }
  public handleTabPressRight(e): void {
    e.preventDefault();
    console.log("Screenshot number on tab right", this.screenshotNumber);
    if (e.shiftKey) {
      (this.$refs.scrollLeft as HTMLElement).focus();
    } else {
      (this.$refs.removeScreenshotsButton[
        this.screenshotNumber
      ] as HTMLElement).focus();
    }
  }

  handleTabPressOnTrash(e): void {
    console.log("Screenshot number on tab trash", this.screenshotNumber);
    if (this.screenshots.length > 1) {
      e.preventDefault();
      if (e.shiftKey) {
        (this.$refs.scrollRight as HTMLElement).focus();
      } else {
        console.log(document.querySelector("#doneButton") as HTMLElement);
        (document.querySelector("#doneButton") as HTMLElement).focus();
      }
    } else if (this.screenshots.length == 1) {
      if (e.shiftKey) {
        e.preventDefault();
        this.screenshotNumber = 0;
        (this.$refs.screenshotImage[
          this.screenshotNumber
        ] as HTMLElement).focus();
      }
    }
  }

  public filterIcons(icons): any {
    return icons.filter((icon) => {
      if (!icon.generated || icon.src.indexOf("data") === 0) {
        return icon;
      }
    });
  }

  public checkBrokenImage(icons): any {
    icons.forEach((icon) => {
      if (icon.generated && icon.src.indexOf("data") !== 0) {
        this.isImageBroken = true;
      }
    });
  }

  public textareaError(): void {
    // This method is called when Enter is pressed in the textarea
    this.ifEntered = true; // This property is used to determine whether or not an error message should be displayed
    this.textareaOutlineColor = "red solid 2px";
  }
  public textareaCheck(): void {
    // If the user presses any key other than Enter, then reset ifEntered values to remove error message
    // This method is only called on keypress (not when entered is clicked)
    this.ifEntered = false;
    this.textareaOutlineColor = "";
  }

  public onClickRemoveScreenshot(
    e: Event,
    screenshot: generator.Screenshot,
    k: number
  ): void {
    e.preventDefault();
    this.removeScreenshot(screenshot);
    this.updateManifest(this.manifest$);

    if (k == this.screenshots.length && this.screenshots.length > 0) {
      console.log(this.screenshotNumber);
      this.screenshotNumber -= 1;
    }
    (this.$refs.removeScreenshotsButton[
      this.screenshotNumber
    ] as HTMLElement).focus();
  }

  public onClickRemoveIcon(icon: generator.Icon): void {
    this.removeIcon(icon);
    this.updateManifest(this.manifest$);
  }

  public async onClickScreenshotFetch(): Promise<void> {
    this.isInvalidScreenshotUrl = false;
    let urls: string[] = [];
    this.invalidScreenshotUrlValues = [];
    //
    urls = this.urlsForScreenshotValues.filter((url) => {
      return url !== null && url !== undefined && url !== "";
    });
    console.log(urls);
    urls = urls.map((url) => {
      return this.validateScreenshotUrl(url);
    });
    console.log("Validated urls", urls);
    this.invalidScreenshotUrlValues = await this.isValidUrls(urls);
    if (this.invalidScreenshotUrlValues.length > 0) {
      this.isInvalidScreenshotUrl = true;
    } else {
      this.isInvalidScreenshotUrl = false;
      if (urls.length == 0) return;
      else
        try {
          this.screenshotLoading = true;
          //Downloads screenshots and adds the sources to the manifest
          await this.addScreenshotsFromUrl(urls);
        } catch (err) {
          console.log("Something wrong with the URL");
        }
      this.screenshotLoading = false;
    }
  }

  public validateScreenshotUrl(url: string) {
    if (url) {
      if (!url.startsWith("http")) {
        url = "https://" + url;
      }
    }
    return url;
  }
  public addUrlForScreenshots(index) {
    this.urlsForScreenshot.push({ value: "" });
  }
  public removeUrlForScreenshots(index) {
    this.urlsForScreenshot.splice(index, 1);
    this.urlsForScreenshotValues.splice(index, 1);
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
    this.iconFileErrorNoneUploaded = false;
    // Check if file type is an image
    if (this.iconFile && this.iconFile.name) {
      const supportedFileTypes = [".png", ".jpg", ".svg"];
      var found = supportedFileTypes.find(fileType =>
        this.iconFile.name.endsWith(fileType)
      );
      if (!found) {
        this.iconFileErrorIncorrectType = true;
      } else {
        this.iconFileErrorIncorrectType = false;
      }
    } else {
      this.iconFileErrorIncorrectType = false;
    }
  }

  private getImagesWithEmbedded(icons: generator.Icon[]): generator.Icon[] {
    // Creates a clone of icons but replaces any embedded image data
    // (eg. "src: data:image/png;base64,...") with "[Embedded]"
    const w3cIconProps = ["src", "sizes", "type", "purpose", "platform"];
    return icons.map((i) => {
      const clone = { ...i };
      // Only include W3C props
      Object.keys(clone)
        .filter((prop) => !w3cIconProps.includes(prop))
        .forEach((prop) => delete clone[prop]);

      // Swap embedded images with "[Embedded]" string literal.
      const isEmbeddedImg = i.src.startsWith("data:image");
      clone.src = isEmbeddedImg ? "[Embedded]" : clone.src;
      return clone;
    });
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
    const ignoredMembers = ["generated"];
    const manifestMembers = Object.keys(this.manifest)
      .filter((property) => !ignoredMembers.includes(property))
      .filter((property) => this.manifest[property] !== undefined)
      .map(
        (property) => `"${property}": ${this.getManifestPropValue(property)}`
      )
      .join(",\n");

    return `{ ${manifestMembers} ${this.getCustomMembers()} }`;
  }

  private getManifestPropValue(property: string): string {
    switch (property) {
      case "icons":
        return JSON.stringify(this.getImagesWithEmbedded(this.icons));
      case "screenshots":
        return JSON.stringify(this.getImagesWithEmbedded(this.screenshots));
      default:
        // Use JSON.stringify if it's an object.
        const propValue = this.manifest[property];
        const propType = typeof propValue;
        let stringifiedValue =
          propType === "object"
            ? JSON.stringify(propValue, undefined, 4)
            : propValue;
        let quoteCharOrEmpty = propType === "string" ? `"` : ``;
        return `${quoteCharOrEmpty}${stringifiedValue}${quoteCharOrEmpty}`;
    }

    return "";
  }

  public getCode(): string | null {
    if (this.manifest) {
      // Grab the manifest code, format it, and send it back.
      const manifestProps = this.getManifestProperties();

      // Parse it into an object we can format.
      let manifestPropsObj: Object | null = null;
      try {
        manifestPropsObj = JSON.parse(manifestProps);
      } catch (parseErr) {
        // Manifest props string isn't a valid JSON object. Woops
        console.warn(
          "App manifest is invalid; unable to parse JSON object",
          parseErr,
          "\n\nHere is the raw JSON:\n",
          manifestProps
        );
        return manifestProps;
      }

      // Format it.
      return JSON.stringify(manifestPropsObj, undefined, 4);
    }

    return null;
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
      this.iconFileErrorNoneUploaded = true;
      return;
    }
    this.iconFileErrorNoneUploaded = false;
    $iconsModal.showLoading();
    if (this.iconCheckMissing) {
      await this.generateMissingImages(this.iconFile);

      this.manifest$ = this.manifest;
      this.updateManifest(this.manifest$);
    } else {
      await this.uploadIcon(this.iconFile);
      this.updateManifest(this.manifest$);
    }
    this.checkBrokenImage(this.icons);
    $iconsModal.hide();
    $iconsModal.hideLoading();
    this.iconFile = null;
    this.showingIconModal = false;
  }

  public onCancelIconModal(): void {
    this.iconFile = null;
    this.iconFileErrorNoneUploaded = false;
    this.iconFileErrorIncorrectType = false;
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

  public handleEditorValue(value) {
    if (helper.isValidJson(value)) {
      var editedManifest = JSON.parse(value);
      this.updateManifest(editedManifest);
      this.manifest$ = { ...this.manifest };
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

Vue.prototype.$awa = function (config) {
  if (awa) {
    awa.ct.capturePageView(config);
  }

  return;
};

declare var awa: any;
</script>

<style lang="scss">
@import "~assets/scss/base/variables";

.custom-file-upload {
  label {
    display: block;
  }

  input,
  label {
    margin: 0.4rem 0;
  }

  .image-upload {
    margin-bottom: 10px;
    height: 40px;
  }

  .custom-file-label {
    width: 620px;
    float: right;
    font-size: 16px;
    padding-top: 13px;
    cursor: default;
  }

  .custom-file-input {
    color: transparent;
    width: 155px;
    cursor: pointer;
  }

  .custom-file-input::-webkit-file-upload-button {
    visibility: hidden;
  }

  .custom-file-input::before {
    content: "Choose File";
    width: 154px;
    height: 40px;
    background: transparent;
    color: #3c3c3c;
    font-weight: bold;
    border-radius: 20px;
    border: 1px solid #3c3c3c;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
  }

  .custom-file-input:hover::before {
    border-color: #9337d8;
  }

  .custom-file-input:active,
  :focus {
    outline: 0;
  }
}

#manifestCode {
  width: 100%;
}

#textarea_error {
  color: red;
}

.brokenImage {
  font-size: 14px;
  color: #db3457 !important;
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
  .button-holder.icons {
    height: 90px;
    display: flex;
    align-items: center;
    flex-flow: column;
    justify-content: space-between;
  }
  .iconUploadHeader {
    padding-top: 0px !important;
    font-size: 16px;
  }
  #iconDownloadButton {
    width: 116px;
    height: 40px;
    background: transparent;
    color: #3c3c3c;
    font-weight: bold;
    border-radius: 20px;
    border: 1px solid #3c3c3c;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
  }
  #iconDownloadButton.disabled {
    color: lightgray;
    border: 1px solid lightgray;
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
    font-family: sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
  }
}

#screenshotsTool {
  padding-bottom: 41px;
}

#screenshotDownloadButton {
  background: transparent;
  border: none;
  outline: none;
}
#screenshotDownloadButton_content {
  width: 174px;
  height: 40px;
  background: transparent;
  color: #3c3c3c;
  font-weight: bold;
  border-radius: 20px;
  border: 1px solid #3c3c3c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
}

.screenshotImage:focus {
  outline: auto;
}
.screenshotImage {
  outline: none;
}
#screenshotDownloadButton:focus > #screenshotDownloadButton_content {
  outline: auto;
}

#screenshotDownloadButton:focus,
#screenshotDownloadButton_content:focus {
  outline: none;
}
.outlineontab:focus > .outlineontab_content {
  outline: auto;
}

.outlineontab:focus,
.outlineontab_content:focus {
  outline: none;
}
#invalidUrlToast {
  background: grey;
  color: white;
  position: fixed;
  bottom: 16px;
  right: 32px;
  z-index: 9999;
  font-weight: bold;
  width: 16em;
  padding: 1em;
  border-radius: 20px;
  animation-name: toastUp;
  animation-duration: 250ms;
  animation-timing-function: ease;
}
@keyframes toastUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
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
  font-family: sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.02em;
}
#genMissingLabel input {
  height: 1em;
  width: 1em;
  margin-left: 15px;
  margin-top: 5px;
}
#uploadImageError {
  display: flex;
  font-family: sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.02em;
  color: #db3457;
}
#main {
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
        font-family: sans-serif;
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
          color: rgba(60, 60, 60, 0.8);
          width: 110px;
          height: 32px;
          box-shadow: none;
          text-transform: uppercase;
          font-family: sans-serif;
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
        color: #606060;
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
      padding-top: 12px;
      display: flex;
      justify-content: center;
      margin-bottom: 62px;
      #doneButton {
        background: #3c3c3c;
        width: 97px;
        font-family: sans-serif;
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
    font-family: sans-serif;
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
  #main {
    flex-direction: column;
    padding-left: 31px !important;
    padding-right: 24px !important;
  }
  #main #leftSide .animatedSection {
    width: 100%;
  }
  #main #leftSide .animatedSection input {
    width: 100%;
  }
  #iconGrid {
    display: grid;
    grid-gap: initial;
  }
  .screenshot-input {
    width: 95% !important;
  }
  .l-generator-input--select {
    max-width: 210px;
  }
}
#screenshotsOuterDiv {
  display: flex;
  align-items: center;
  justify-content: center;
}
#screenshotsUrlsContainer {
  padding-bottom: 24px;
}
#screenshotsContainer {
  width: 100%;
  display: flex;
  background: #efefef;
  height: 16em;
  justify-content: column;
}

#screenshotsContainer button {
  border: none;
  width: 4em;
  transition: background-color 0.2s;
}
#screenshotsContainer button:focus,
#screenshotsContainer button:hover {
  background-color: #bbbbbb;
}
#screenshotsContainer button svg {
  width: 28px;
  fill: #6b6969;
}

.removeScreenshotsButton {
  display: flex;
  justify-content: center;
  width: fit-content !important;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
}
#screenshots {
  display: flex;
  height: 100%;
  scroll-snap-type: x mandatory;
  flex-wrap: wrap;
  flex-direction: column;
  overflow-x: scroll;
  width: 100%;
  padding-top: 3%;
  -webkit-overflow-scrolling: touch;
}

#screenshots .screenshotItem {
  display: flex;
  align-items: center;
  justify-content: center;
  scroll-snap-align: start;
  width: 100%;
  background: #efefef;
  height: 100%;
  flex-direction: column;
}
#screenshots img {
  padding-bottom: 3%;
  height: 100%;
  object-fit: contain;
}

#screenshots a {
  height: inherit;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  width: inherit;
  height: inherit;
  -ms-flex-pack: center;
  background: #efefef;
  outline: none;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
}
#screenshots a:focus {
  background-color: #bbbbbb;
  outline: none;
}
#screenshots::-webkit-scrollbar {
  display: none;
}

#screenshotsToolbar {
  position: sticky;
  bottom: 0px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 6px;
  background: #efefef;
}

@media (max-width: 630px) {
  #uploadNewSection {
    display: none;
  }
}

#main #leftSide .animatedSection input[type="radio"] {
  width: auto;
}
</style>
