<template>

<section>
  <div v-if="manifest$">
    <div class="l-generator-step ">
      <div class="mastHead">
        <h4 class="l-generator-subtitle">
          {{ $t("generate.subtitle") }}
        </h4>

        <p class="l-generator l-generator--last">
          {{ $t("generate.instructions") }}
        </p>
      </div>
      <div class="l-generator-semipadded mainDiv">
        <div class="l-generator-form">
          <div class="formNav">
            <h3>Jump To</h3>
            <h3 v-bind:class="{ active: showBasicSection }" @click="showBasicsSection()">Basic Info</h3>
            <h3 v-bind:class="{ active: showImagesSection }" @click="showImageSection()">Images</h3>
            <h3 v-bind:class="{ active: showSettingsSection }" @click="showSettingSection()">Settings</h3>
          </div>

          <section class='animatedSection' v-if="showBasicSection">
            <div class="l-generator-field">
              <label class="l-generator-label">{{ $t("generate.name") }}
                <p>Used for App lists or Store listings</p>
              </label>

              <input class="l-generator-input" v-model="manifest$.name" @change="onChangeSimpleInput()" type="text">
            </div>

            <div class="l-generator-field">
              <label class="l-generator-label">{{ $t("generate.short_name") }}
                <p>Used for tiles or home screens</p>
              </label>

              <input class="l-generator-input" v-model="manifest$.short_name" @change="onChangeSimpleInput()" name="short_name" type="text">
            </div>

            <div class="l-generator-field">
              <label class="l-generator-label">{{ $t("generate.description") }}
                <p>Used for App listings</p>
              </label>

              <textarea class="l-generator-textarea" v-model="manifest$.description" @change="onChangeSimpleInput()" name="description" type="text"></textarea>
            </div>

            <div class="l-generator-field">
              <label class="l-generator-label">{{ $t("generate.start_url") }}
                <p>This will be the first page that loads in your PWA.</p>
              </label>

              <input class="l-generator-input" v-model="manifest$.start_url" @change="onChangeSimpleInput()" type="text">
            </div>
          </section>

          <Modal :title="$t('generate.upload_title')" ref="iconsModal" @submit="onSubmitIconModal" @cancel="onCancelIconModal">
            <div class="l-generator-box">
              <span class="l-generator-label">{{ $t("generate.upload_image") }}</span>

              <label class="l-generator-input l-generator-input--fake is-disabled" for="modal-file">
                {{ iconFile && iconFile.name ? iconFile.name : $t("generate.choose_file") }}
              </label>
              <input id="modal-file" @change="onFileIconChange" class="l-hidden" type="file">
            </div>

            <div class="l-generator-field">
              <label>
                <input type="checkbox" v-model="iconCheckMissing"> {{ $t("generate.generate_missing") }}
              </label>
            </div>
          </Modal>

          <section class='animatedSection' v-if="showImagesSection">
            <div class="l-generator-field logo-upload">
              <label class="l-generator-label">{{ $t("generate.icon_url") }}
              <p> We suggest at least one image 512x512 or larger</p>
              </label>

              <div>
                <!--<input class="l-generator-input" placeholder="http://example.com/image.png or /images/example.png" type="url" v-model="newIconSrc">-->

                <div class="button-holder icons">
                  <div class="l-inline">
                    <button class="work-button l-generator-button" @click="onClickUploadIcon()">
                      {{ $t("generate.upload") }}
                    </button>
                  </div>

                  <!--<button class="work-button pwa-button--right" @click="onClickAddIcon()">
                    {{ $t("generate.add_icon") }}
                  </button>-->
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

                    <div class="pure-u-8-24 l-generator-tablec">
                      {{icon.sizes}}
                    </div>

                    <div class="pure-u-1-8 l-generator-tablec" :title="$t('generate.icon_autogenerated')">
                      <span class="icon-magic" ng-if="icon.generated"></span>
                    </div>

                    <div class="pure-u-1-8 l-generator-tablec l-generator-tablec--right" @click="onClickRemoveIcon(icon)">
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

          <section class='animatedSection' v-if="showSettingsSection">
            <div class="l-generator-field">
              <label class="l-generator-label">{{ $t("generate.scope") }}
                <p>scope determins what part of your website runs in the PWA</p>
              </label>

              <input class="l-generator-input" v-model="manifest$.scope" @change="onChangeSimpleInput()" type="text">
            </div>

            <div class="l-generator-field">
              <label class="l-generator-label">{{ $t("generate.display") }}
                <p>Display indetifies the browser components that should be included in your. "Standalone" appears as a traditional app</p>
              </label>

              <select class="l-generator-input l-generator-input--select" v-model="manifest$.display" @change="onChangeSimpleInput()">
                <option v-for="display in displaysNames" :value="display" :key="display">{{display}}</option>
              </select>
            </div>

            <div class="l-generator-field">
              <label class="l-generator-label">{{ $t("generate.orientation") }}
                <p>Orientation determines the perfered flow of your application</p>
              </label>

              <select class="l-generator-input l-generator-input--select" v-model="manifest$.orientation" @change="onChangeSimpleInput()">
                <option v-for="orientation in orientationsNames" :value="orientation" :key="orientation">{{orientation}}</option>
              </select>
            </div>

            <div class="l-generator-field">
              <label class="l-generator-label">{{ $t("generate.language") }}
                <p>declare the language of your PWA</p>
              </label>

              <select class="l-generator-input l-generator-input--select" v-model="manifest$.lang">
                <option v-for="language in languagesNames" :value="language" :key="language" @change="onChangeSimpleInput()">{{language}}</option>
              </select>
            </div>

            <div>
              <ColorSelector />
            </div>

            <div>
              <input type="checkbox" id="related-applications-field" class="l-generator-togglecheck is-hidden">

              <label class="l-generator-toggle" for="related-applications-field">
                <p class="l-generator-subtitle l-generator-subtitle--toggleable">{{ $t("generate.specify_application") }}</p>
              </label>

              <div class="l-generator-field l-generator-field--toggle">
                <RelatedApplications />
              </div>
            </div>
          </section>

          <!--<div>
            <input type="checkbox" id="specify-members-field" class="l-generator-togglecheck is-hidden">
            <label class="l-generator-toggle" for="specify-members-field">
              <p class="l-generator-subtitle l-generator-subtitle--toggleable">{{ $t("generate.specify_members") }}</p>
            </label>

            <div class="l-generator-field l-generator-field--toggle">
              <CustomMembers />
            </div>
          </div>-->
        </div>

        <div class="generate-code pure-u-1 pure-u-md-1-2">
          <button class="manifestButton" v-bind:class="{ active: seeEditor }" @click="seeManifest()">Manifest Preview</button>
          <button class="manifestButton" v-bind:class="{ active: !seeEditor }" @click="seeGuidance()">Guidance</button>

          <CodeViewer codeType="json" v-on:invalidManifest="invalidManifest()" v-on:editorValue="handleEditorValue($event)" v-if="seeEditor" :code="getCode()" :title="$t('generate.w3c_manifest')" :suggestions="suggestions" :suggestionsTotal="suggestionsTotal"
            :warnings="warnings" :warningsTotal="warningsTotal">
            <nuxt-link :to="$i18n.path('serviceworker')" class="pwa-button pwa-button--simple pwa-button--brand pwa-button--header" @click=" $awa( { 'referrerUri': 'https://preview.pwabuilder.com/generator-nextStep-trigger' })">
              {{ $t("serviceworker.next_step") }}
            </nuxt-link>
          </CodeViewer>
          <div v-else>
            <h1>Hello World</h1>
          </div>
        </div>
      </div>
    </div>

    <div class="l-generator-buttons">
      <button class="work-button"  @click="onClickShowGBB()">I'm done</button>
    </div>
    
    <Modal :title="Next" ref="nextStepModal" @submit="onSubmitIconModal" @cancel="onCancelIconModal">
      <GoodPWA :hasManifest="basicManifest"/>
    </Modal>
  </div>

  <div v-if="!manifest$">
    <div class="l-generator-step l-generator-step--big"></div>
  </div>

</section>
</template>



<script lang="ts">
import Vue from 'vue';
import Component from 'nuxt-class-component';
import { Action, State, Getter, namespace } from 'vuex-class';

import GeneratorMenu from '~/components/GeneratorMenu.vue';
import Modal from '~/components/Modal.vue';
import CodeViewer from '~/components/CodeViewer.vue';
import RelatedApplications from '~/components/RelatedApplications.vue';
import CustomMembers from '~/components/CustomMembers.vue';
import StartOver from '~/components/StartOver.vue';
import ColorSelector from '~/components/ColorSelector.vue';
import GoodPWA from '~/components/GoodPWA.vue';

import * as generator from '~/store/modules/generator';

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
    GoodPWA
  }
})

export default class extends Vue {

  public manifest$: generator.Manifest | null = null;
  public newIconSrc = '';
  public iconCheckMissing = true;
  private iconFile: File | null = null;
  public error: string | null = null;
  public seeEditor = true;
  public basicManifest = false;
  public showBasicSection = true;
  public showImagesSection = false;
  public showSettingsSection = false;

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
    if (!this.manifest) {
      this.$router.push({ 
        path: this.$i18n.path('')
      });
      return;
    }

    this.manifest$ = { ...this.manifest };
  }

  public onChangeSimpleInput(): void {
    try {
      this.updateManifest(this.manifest$);
      this.manifest$ = this.manifest;
    } catch (e) {
      this.error = e;
    }
  }

  public onClickRemoveIcon(icon: generator.Icon): void {
    this.removeIcon(icon);
  }

  public onClickAddIcon(): void {
    console.log('here');
    try {
      console.log('trying to add icon from URL', this.newIconSrc);
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
            "src": "${icon.src.includes('data:image') ? '[Embedded]' : icon.src}",
            "sizes": "${icon.sizes}"
        }`;
    });

    return icons.toString();
  }

  private getCustomMembers(): string {
    if (this.members.length < 1) {
      return '';
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
    let manifest = '';
      for (let property in this.manifest) {
        if (property !== 'icons') {
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
    console.log('invalid');
    this.basicManifest = false;
  }

  public handleEditorValue(ev) {
    this.manifest$ = JSON.parse(ev);
  }

  public showBasicsSection() {
    this.showBasicSection = true;
    this.showImagesSection = false;
    this.showSettingsSection = false;
  }

  public showImageSection() {
    this.showImagesSection = true;
    this.showBasicSection = false
    this.showSettingsSection = false;
  }

  public showSettingSection() {
    this.showSettingsSection = true;
    this.showImagesSection = false;
    this.showBasicSection = false
  }
}

</script>

<style lang="scss" scoped>
@import "~assets/scss/base/variables";
/* stylelint-disable */

.mastHead {
  margin-top: 4em;
  margin-bottom: 4em;
  margin-left: 68px;
  width: 568px;
}

.formNav{
  h3 {
    display: inline;
    color: $color-brand-primary;
    margin: 0 .5em;
  }
}

.generate {
  &-code {
    margin-top: -2rem;
    padding-right: 68px;
  }
}

.manifestButton {
  background: transparent;
  border: none;
  color: $color-brand;
  outline: none;
}

.active {
  border-bottom: 2px solid black;
}

.mainDiv {
  display: flex;
  width: 100%;
}

.animatedSection {
  animation-duration: 300ms;
  animation-name: fadein;
}

@keyframes fadein {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>