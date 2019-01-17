<template>
  <section class="code_viewer">
    <div class="code_viewer-pre" ref="monacoDiv"></div>

    <div id="copyDiv">
      <button v-if="showCopyButton" @click="copy()" id="copyButton">Copy</button>
    </div>

    <div v-if="showOverlay" id="errorOverlay">
      <button id="closeButton" @click="closeOverlay()">Close</button>

      <h2>Errors</h2>

      <ul>
        <li v-for="error in errors">
          <span>Line number {{ error.startLineNumber}}:</span>
          {{ error.message }}
        </li>
      </ul>
    </div>

    <div v-if="showToolbar" id="toolbar">
      <div v-if="errorNumber">
        <button @click="showErrorOverlay()" id="errorsButton">{{this.errorNumber}} errors</button>
      </div>

      <button id="settingsButton">Editor Settings</button>
    </div>
  </section>
</template>

<script lang='ts'>
import Vue from "vue";
import * as monaco from "monaco-editor";
import Component from "nuxt-class-component";
import { Prop, Watch } from "vue-property-decorator";
import Clipboard from "clipboard";

import SkipLink from "~/components/SkipLink.vue";
import IssuesList from "~/components/IssuesList.vue";
import Download from "~/components/Download.vue";
import { CodeError } from "~/store/modules/generator";

@Component({
  components: {
    SkipLink,
    Download,
    IssuesList
  }
})
export default class extends Vue {
  @Prop({ type: String, default: "" })
  public title: string;

  @Prop({ type: String, default: "" })
  public code: string;

  @Prop({ type: String, default: "auto" })
  public size: string | null;

  @Prop({ type: Array, default: null })
  public suggestions: CodeError[] | null;

  @Prop({ type: Array, default: null })
  public warnings: CodeError[];

  @Prop({ type: Number, default: 0 })
  public warningsTotal: number;

  @Prop({ type: Number, default: 0 })
  public suggestionsTotal: number;

  @Prop({ type: String, default: "javascript" })
  public codeType: string;

  @Prop({ type: Boolean, default: true })
  public showCopyButton;

  @Prop() showToolbar: boolean;

  public readonly warningsId = "warnings_list";
  public readonly suggestionsId = "suggestions_list";
  public isReady = true;
  public downloadButtonMessage = "publish.download_manifest";
  public errorNumber = 0;

  public editor: monaco.editor.IStandaloneCodeEditor;

  showOverlay = false;
  errors: any[] = [];

  public mounted(): void {
    this.editor = monaco.editor.create(this.$refs.monacoDiv as HTMLElement, {
      value: this.code,
      lineNumbers: "off",
      language: this.codeType,
      fixedOverflowWidgets: true,
      wordWrap: "wordWrapColumn",
      wordWrapColumn: 50,
      scrollBeyondLastLine: false,
      // Set this to false to not auto word wrap minified files
      wordWrapMinified: true,

      // try "same", "indent" or "none"
      wrappingIndent: "indent",
      fontSize: 16,
      minimap: {
        enabled: false
      }
    });

    const model = this.editor.getModel();

    model.onDidChangeContent(() => {
      const value = model.getValue();
      this.$emit("editorValue", value);
    });

    model.onDidChangeDecorations(() => {
      this.errors = (<any>window).monaco.editor.getModelMarkers({});
      this.errorNumber = this.errors.length;

      console.log(this.errors);

      if (this.errors.length > 0) {
        this.$emit("invalidManifest");
      }
    });
  }

  @Watch("code")
  onCodeChanged() {
    if (this.editor) {
      this.editor.setValue(this.code);
    }
  }

  // @ts-ignore TS6133
  private async copy() {
    const code = this.editor.getValue();

    if ((navigator as any).clipboard) {
      try {
        await (navigator as any).clipboard.writeText(code);
      } catch (err) {
        console.error(err);
      }
    } else {
      let clipboard = new Clipboard(code);

      clipboard.on("success", e => {
        console.info("Action:", e.action);
        console.info("Text:", e.text);
        console.info("Trigger:", e.trigger);

        e.clearSelection();
      });

      clipboard.on("error", e => {
        console.error("Action:", e.action);
        console.error("Trigger:", e.trigger);
      });
    }
  }

  // @ts-ignore TS6133
  private showErrorOverlay() {
    this.showOverlay = !this.showOverlay;
  }

  // @ts-ignore TS6133
  private closeOverlay() {
    this.showOverlay = false;
  }
}
</script>

<style lang='scss' scoped>
/* stylelint-disable */

@import "~assets/scss/base/variables";
@import "~assets/scss/base/animations";

.code_viewer {
  display: flex;
  flex-direction: column;
  padding: 10px;
  padding-top: 4em;

  .active {
    color: $color-brand-quartary;
  }

  #copyButton {
    background: $color-brand-primary;
    color: $color-brand-quintary;
    border: none;
    border-radius: 20px;
    padding: 6px;
    width: 6em;
  }

  #copyDiv {
    display: flex;
    justify-content: flex-end;
    position: fixed;
    top: 16px;
    right: 16px;
  }

  @media screen and (max-width: $media-screen-s) {
    margin-top: 4rem;
  }

  #codeViewerTitle {
    margin-bottom: 15px;
    margin-left: 10px;
  }

  .code_viewer-pre {
    height: 48em;
  }

  #toolbar {
    position: fixed;
    background: grey;
    width: 50%;
    bottom: 0;
    right: 0;
    display: flex;
    justify-content: flex-end;
    height: 40px;
    align-items: center;

    #errorsButton {
      background: $color-brand-warning;
      color: white;
    }

    #settingsButton {
      width: 112px;
    }

    button {
      border: none;
      margin: 8px;
      border-radius: 20px;
      width: 97px;
      font-size: 12px;
      font-weight: bold;
      padding-top: 8px;
      padding-bottom: 8px;
    }
  }

  #errorOverlay {
    background: white;
    animation-name: overlayUp;
    animation-duration: 200ms;
    animation-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: fixed;
    width: 50%;
    right: 0;
    bottom: 2.2em;
    border-top: 1px solid black;
    padding: 40px;

    h2 {
      font-weight: bold;
      font-size: 18px;
      margin: 0;
      padding: 0;
      margin-bottom: 20px;
    }

    #closeButton {
      border: none;
      background: grey;
      border-radius: 20px;
      position: absolute;
      right: 40px;
      width: 72px;
      color: white;
      font-weight: bold;
      font-size: 12px;
      padding-top: 8px;
      padding-bottom: 8px;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        font-size: 14px;
      }

      li span {
        font-weight: bold;
      }
    }
  }
}
</style>