<template>
<section class="code_viewer">
  <div class="code_viewer-copy js-clipboard" :data-clipboard-text="code" ref="code">
    {{ $t("code_viewer." + copyTextKey) }}
  </div>
  <div class="code_viewer-pre" ref="monacoDiv"></div>
</section>
</template>

<script lang='ts'>
import Vue from 'vue';
import Clipboard from 'clipboard';
import * as monaco from 'monaco-editor';
import Component from 'nuxt-class-component';
import { Prop, Watch } from 'vue-property-decorator';

import SkipLink from '~/components/SkipLink.vue';
import IssuesList from '~/components/IssuesList.vue';
import Download from '~/components/Download.vue';
import { CodeError } from '~/store/modules/generator';

@Component({
  components: {
    SkipLink,
    Download,
    IssuesList
  }
})
export default class extends Vue {
  @Prop({ type: String, default: '' })
  public title: string;

  @Prop({ type: String, default: '' })
  public code: string | null;

  @Prop({ type: String, default: 'auto' })
  public size: string | null;

  @Prop({ type: Array, default: null })
  public suggestions: CodeError[] | null;

  @Prop({ type: Array, default: null })
  public warnings: CodeError[];

  @Prop({ type: Number, default: 0 })
  public warningsTotal: number;

  @Prop({ type: Number, default: 0 })
  public suggestionsTotal: number;

  public copyTextKey = 'copy';
  public readonly warningsId = 'warnings_list';
  public readonly suggestionsId = 'suggestions_list';
  public isReady = true;
  public downloadButtonMessage = 'publish.download_manifest';

  public mounted(): void {
    if (this.code) {
      // Have to put this inside nextTick for vue
      // to see the ref
      this.$nextTick(() => {
        if (this.code) {
          monaco.editor.create(this.$refs.monacoDiv as HTMLElement, {
            value: this.code,
            language: 'javascript',
            fixedOverflowWidgets: true
          });
        }
      });
    }

    let clipboard = new Clipboard(this.$refs.code);
    clipboard.on('success', e => {
      this.copyTextKey = 'copied';
    });

    clipboard.on('error', e => {
      this.copyTextKey = 'error';
    });
  }

  public updated(): void {}

  @Watch('code')
  onCodeChanged() {
    if (this.code) {
      this.copyTextKey = 'copy';
      monaco.editor.create(this.$refs.monacoDiv as HTMLElement, {
        value: this.code,
        language: 'javascript',
        fixedOverflowWidgets: true
      });
    }
  }
}
</script>

<style lang='scss' scoped>
@import '~assets/scss/base/variables';

.code_viewer {
  display: flex;
  font-size: 0;
  height: 100%;

  @media screen and (max-width: $media-screen-s) {
    margin-top: 4rem;
  }

  &-padded {
    padding-top: 1rem;
  }

  &-header {
    background-color: $color-brand;
    line-height: 1.5;
    padding: 1.5rem 1.5rem 1.1rem 1.5rem;

    &--rounded {
      background-color: $color-background-brighter;
      border-radius: .5rem;
      margin: 0 auto;
      padding: 1rem 1rem;
      text-align: left;
      width: 90%;
    }
  }

  &-title {
    color: $color-foreground-darker;
    font-family: Bitter;
    font-size: $font-size-l;
  }

  &-pre {
    flex-grow: 1;
    padding: 1rem;
  }

  &-code {
    font-size: 1rem;
  }

  &-copy {
    background-color: $color-background-semidark;
    border-radius: .5em;
    box-shadow: 0 2px 0 0 rgba($color-background-darkest, .2);
    color: $color-foreground-brightest;
    font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    font-size: $font-size-s;
    opacity: 0;
    padding: 0 .5em;
    position: absolute;
    right: 2rem;
    top: 1rem;
    transition: opacity 1s;

    &:hover {
      cursor: pointer;
    }
  }

  &-content {
    background-color: $color-background-darker;
    margin: 0;
    min-height: 4rem;
    position: relative;
  }

  &-content:hover &-copy {
    opacity: 1;
  }
}
</style>