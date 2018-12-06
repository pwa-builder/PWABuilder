<template>
<section class="code_viewer">
  <h2 id='codeViewerTitle'>{{title}}</h2>
  <div class="code_viewer-pre" ref="monacoDiv"></div>

  <div v-if="errorNumber">
    <p>{{this.errorNumber}} errors</p>
  </div>

  <div id="copyDiv">
    <button v-if="showCopyButton" @click="copy()" id="copyButton">Copy</button>
  </div>
</section>
</template>

<script lang='ts'>
import Vue from 'vue';
import * as monaco from 'monaco-editor';
import Component from 'nuxt-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import Clipboard from 'clipboard';

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
  public code: string;

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

  @Prop({ type: String, default: 'javascript'})
  public codeType: string;

  @Prop({ type: Boolean, default: true})
  public showCopyButton;

  public readonly warningsId = 'warnings_list';
  public readonly suggestionsId = 'suggestions_list';
  public isReady = true;
  public downloadButtonMessage = 'publish.download_manifest';
  public errorNumber = 0;

  public editor: monaco.editor.IStandaloneCodeEditor;

  public mounted(): void {

    this.editor = monaco.editor.create(this.$refs.monacoDiv as HTMLElement, {
      value: this.code,
      lineNumbers: 'off',
      language: this.codeType,
      fixedOverflowWidgets: true,
      wordWrap: 'wordWrapColumn',
      wordWrapColumn: 50,
      scrollBeyondLastLine: false,
      // Set this to false to not auto word wrap minified files 
      wordWrapMinified: true,

      // try "same", "indent" or "none"
      wrappingIndent: 'indent',
      fontSize: 16,
      minimap: {
        enabled: false
      }
    });

    const model = this.editor.getModel();

    model.onDidChangeContent(() => {
      const value = model.getValue();
      this.$emit('editorValue', value);
    });

    model.onDidChangeDecorations(() => {
      const errors = (<any>window).monaco.editor.getModelMarkers({});
      this.errorNumber = errors.length;

      if (errors.length > 0) {
        this.$emit('invalidManifest');
      }
    });
  }

  @Watch('code')
  onCodeChanged() {
    if (this.editor) {
      this.editor.setValue(this.code);
    }
  }

  async copy() {
      const code = this.editor.getValue();

      if ((navigator as any).clipboard) {
        try {
          await (navigator as any).clipboard.writeText(code);
        } catch (err) {
          console.error(err);
        }
      } else {
        let clipboard = new Clipboard(code);

        clipboard.on('success', (e) => {
          console.info('Action:', e.action);
          console.info('Text:', e.text);
          console.info('Trigger:', e.trigger);

          e.clearSelection();
        });

        clipboard.on('error', (e) => {
            console.error('Action:', e.action);
            console.error('Trigger:', e.trigger);
        });
      }
  }
}
</script>

<style lang='scss' scoped>
/* stylelint-disable */

@import '~assets/scss/base/variables';

.code_viewer {
  background-color: $color-brand-quintary;
  box-shadow: 0 4px 12px rgba(0, 0, 0, .16);
  display: flex;
  flex-direction: column;
  max-height: 900px;
  min-height: 700px;
  padding: 10px;

  .active {
    color:$color-brand-quartary;
  }

  #copyButton {
    background: $color-brand-primary;
    color: $color-brand-quintary;
    border: none;
    border-radius: .5rem;
    padding: 10px;
  }

  #copyDiv {
    display: flex;
    justify-content: flex-end;
  }

  @media screen and (max-width: $media-screen-s) {
    margin-top: 4rem;
  }

  &-padded {
    padding-top: 1rem;
  }

  &-header {
    background-color: $color-brand-quintary;
    line-height: 1.5;
    padding: 1.5rem 1.5rem 1.1rem 1.5rem;

    &--rounded {
      background-color: $color-brand-quintary;
      border-radius: .5rem;
      margin: 0 auto;
      padding: 1rem 1rem;
      text-align: left;
      width: 90%;
    }
  }

  #codeViewerTitle {
    margin-bottom: 15px;
    margin-left: 10px;
  }

  &-title {
    color: $color-brand-quintary;
    font-family: Bitter;
    font-size: $font-size-l;
  }

  &-pre {
    flex-grow: 1;
    padding: 0;
  }

  &-code {
    font-size: 1rem;
  }

  &-copy {
    background-color: $color-brand-quintary;
    border-radius: .5em;
    box-shadow: 0 2px 0 0 rgba($color-brand-quintary, .2);
    color: $color-brand-quintary;
    font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    font-size: 18px;
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
    background-color: $color-brand-quintary;
    margin: 0;
    min-height: 4rem;
    position: relative;
  }

  &-content:hover &-copy {
    opacity: 1;
  }
}
</style>