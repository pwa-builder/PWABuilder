<template>
<section>
  <GeneratorMenu />

  <div v-if="manifest$">
    <div class="l-generator-step">
      <div class="l-generator-semipadded">
        <div class="l-generator-form pure-u-1 pure-u-md-1-2">
          <h4 class="l-generator-subtitle">
            {{ $t("generate.subtitle") }}
          </h4>
          <h4 class="l-generator-subtitle l-generator-subtitle--last">
            {{ $t("generate.instructions") }}
          </h4>
        </div>

        <div class="generate-code pure-u-1 pure-u-md-1-2">
          <CodeViewer :code="getCode()" :title="$t('generate.w3c_manifest')" :suggestions="suggestions" :suggestionsTotal="suggestionsTotal"
            :warnings="warnings" :warningsTotal="warningsTotal">
          </CodeViewer>
        </div>
      </div>
    </div>

    <StartOver />
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
    Modal
  }
})
export default class extends Vue {
  public manifest$: generator.Manifest | null = null;
  public newIconSrc = '';
  public iconCheckMissing = true;
  private iconFile: File | null = null;
  public error: string | null = null;

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
      this.manifest$ = { ...this.manifest };
    } catch (e) {
      this.error = e;
    }
  }

  public onClickRemoveIcon(icon: generator.Icon): void {
    this.removeIcon(icon);
  }

  public onClickAddIcon(): void {
    try {
      this.addIconFromUrl(this.newIconSrc);
    } catch (e) {
      this.error = e;
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

    let membersString = `,
    `;
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
}
</script>

<style lang="scss" scoped>
@import "~assets/scss/base/variables";

.generate {
  &-code {
    margin-top: -2rem;
  }
}
</style>