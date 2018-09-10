<template>
<section>
  <Toolbar />
  <div v-if="manifest$">
    <div class="generate-code">
      <h2 id="manifestHeader">W3C Manifest</h2>
      <CodeViewer :code="getCode()" :title="$t('generate.w3c_manifest')" :suggestions="suggestions" :suggestionsTotal="suggestionsTotal"
          :warnings="warnings" :warningsTotal="warningsTotal">
      </CodeViewer>

      <div id="downloadDiv">
        <button @click="copy()" id="copyButton">Copy</button>
        <button id="downloadButton">Download</button>
      </div>
    </div>
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
import Clipboard from 'clipboard';

import GeneratorMenu from '~/components/GeneratorMenu.vue';
import Modal from '~/components/Modal.vue';
import CodeViewer from '~/components/CodeViewer.vue';
import RelatedApplications from '~/components/RelatedApplications.vue';
import CustomMembers from '~/components/CustomMembers.vue';
import StartOver from '~/components/StartOver.vue';
import ColorSelector from '~/components/ColorSelector.vue';
import Toolbar from '~/components/Toolbar.vue';

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
    Toolbar
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

  public async copy(): Promise<void> {
    // use the new async clipboard API if available
    // if not fall back to a library
    if ((navigator as any).clipboard) {
      console.log('using new api');
      try {
        await (navigator as any).clipboard.writeText(this.getCode());
      } catch (err) {
        console.error(err);
      }
    } else {
      console.log('doing things the old way');
      let clipboard = new Clipboard(this.getCode());
      clipboard.on('success', e => {
        // this.copyTextKey = 'copied';
      });

      clipboard.on('error', e => {
        // this.copyTextKey = 'error';
      });
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~assets/scss/base/variables";

.generate {
  &-code {
    background: white;
    border-radius: 2px;
    box-shadow: 0 6px 10px 0 rgba(0, 0, 0, .3), 0 2px 2px 0 rgba(0, 0, 0, .2);
    margin: 113px;
  }
}

#downloadButton,
#copyButton {
  background: white;
  border: none;
  border-radius: 10px;
  box-shadow: 0 6px 10px 0 rgba(0, 0, 0, .3), 0 2px 2px 0 rgba(0, 0, 0, .2);
  color: #8B8B8B;
  font-size: 36px;
  height: 80px;
  margin: 50px;
  outline: none;
  width: 298px;
}

#downloadDiv {
  display: flex;
  justify-content: flex-end;
}

#manifestHeader {
  border-radius: 5px;
  box-shadow: 0 10px 20px 0 rgba(0, 0, 0, .19), 0 6px 6px rgba(0, 0, 0, .23);
  color: #949494;
  font-size: 30px;
  font-weight: normal;
  margin: 0;
  padding-bottom: 25px;
  padding-left: 40px;
  padding-top: 22px;
  width: 356px;
}
</style>