<template>
  <section class="code_viewer">
    <div v-if="showHeader" id="codeHeader">
      <slot></slot>

      <button v-if="showCopyButton" @click="copy()" id="copyButton">
        <i id="platformIcon" class="fas fa-copy"></i>
        Copy
      </button>
    </div>

    <div class="code_viewer-pre" ref="monacoDiv"></div>

    <div v-if="textCopied" id="copyToast">Code Copied</div>

    <div v-if="showOverlay" id="errorOverlay">
      <h2>Errors</h2>

      <ul>
        <li v-for="error in errors">
          <span>Line #{{ error.startLineNumber}}:</span>
          {{ error.message }}
        </li>
      </ul>

      <div id="errorButtonDiv">
        <button id="closeButton" @click="closeOverlay()">
          Close
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <div v-if="showToolbar" id="toolbar">
      <div v-if="errorNumber">
        <button @click="showErrorOverlay()" id="errorsButton">
          <i class="fas fa-exclamation-triangle"></i>
          {{this.errorNumber}} errors
        </button>
      </div>
      <div v-if="!errorNumber || errorNumber ===0">
        <button id="noErrorsButton">
          <i class="fas fa-exclamation-triangle"></i>
          0 Errors
        </button>
      </div>
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
  @Prop({ type: String, default: "#F0F0F0" })
  public color;

  @Prop({ type: String, default: "lighter" }) theme: string;

  @Prop({ type: Boolean, default: false }) public showHeader;

  public readonly warningsId = "warnings_list";
  public readonly suggestionsId = "suggestions_list";
  public isReady = true;
  public downloadButtonMessage = "publish.download_manifest";
  public errorNumber = 0;

  public editor: monaco.editor.IStandaloneCodeEditor;

  showOverlay = false;
  errors: any[] = [];
  textCopied = false;

  public mounted(): void {
    console.log(this.color);
    monaco.editor.defineTheme(`${this.theme}Theme`, {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": this.color
      }
    });

    this.editor = monaco.editor.create(this.$refs.monacoDiv as HTMLElement, {
      value: this.code,
      // Turn line numbers on so that line numbers in errors make sense
      lineNumbers: "on",
      language: this.codeType,
      fixedOverflowWidgets: true,
      wordWrap: "wordWrapColumn",
      wordWrapColumn: 50,
      scrollBeyondLastLine: false,
      // Set this to false to not auto word wrap minified files
      wordWrapMinified: true,
      theme: `${this.theme}Theme`,

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
        this.textCopied = true;

        setTimeout(() => {
          this.textCopied = false;
        }, 1000);
      } catch (err) {
        console.error(err);
      }
    } else {
      let clipboard = new Clipboard(code);

      clipboard.on("success", e => {
        console.info("Action:", e.action);
        console.info("Text:", e.text);
        console.info("Trigger:", e.trigger);

        this.textCopied = true;

        setTimeout(() => {
          this.textCopied = false;
        }, 1000);
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
  background: #f1f1f1;
  height: 110vh;

  #codeHeader {
    font-weight: bold;
    padding-left: 1em;
    padding-bottom: 1em;
    padding-top: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 9999;

    div {
      width: 20em;
    }
  }

  .active {
    color: $color-brand-quartary;
  }

  #copyButton {
    background: #c5c5c5;
    color: #3c3c3c;
    border: none;
    border-radius: 20px;
    font-weight: bold;
    font-size: 12px;
    padding-top: 3px;
    padding-bottom: 5px;
    padding-right: 9px;
    padding-left: 9px;
    margin-right: 2em;
  }

  #copyDiv {
    display: flex;
    justify-content: flex-end;
    margin-right: 1.2em;
    position: relative;
    bottom: 1em;
    right: 12px;
    z-index: 9999;
  }

  @media screen and (max-width: $media-screen-s) {
    margin-top: 4rem;
  }

  #codeViewerTitle {
    margin-bottom: 15px;
    margin-left: 10px;
  }

  .code_viewer-pre {
    height: 100%;
  }

  #toolbar {
    position: fixed;
    background: #f0f0f0;
    // width: 50vw;
    bottom: 16px;
    right: 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    #errorsButton {
      background: $color-brand-warning;
      color: white;
    }

    #noErrorsButton {
      background: $color-brand-secondary;
      color: white;
    }

    #settingsButton {
      width: 112px;
    }

    button {
      border: none;
      margin: 10px;
      border-radius: 20px;
      width: 97px;
      font-size: 12px;
      font-weight: bold;
      padding-top: 8px;
      padding-bottom: 8px;
      padding-left: 10px;
      padding-right: 10px;
    }
  }

  #errorOverlay {
    background: #ebebeb;
    padding: 40px;
    animation-name: overlayUp;
    animation-duration: 350ms;
    animation-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: fixed;
    width: 49.4%;
    right: 0;
    bottom: 2.2em;
    border-top: solid 1px #c5c5c5;

    #errorButtonDiv {
      display: flex;
      justify-content: center;
      width: 100%;
      margin-top: 70px;
    }

    h2 {
      font-weight: bold;
      font-size: 18px;
      margin: 0;
      padding: 0;
      margin-bottom: 20px;
    }

    #closeButton {
      border: none;
      background: #3c3c3c;
      border-radius: 20px;
      color: white;
      font-weight: bold;
      font-size: 18px;
      padding-top: 8px;
      padding-bottom: 8px;
      padding-left: 20px;
      padding-right: 20px;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        font-size: 14px;
        padding: 2px;
      }

      li span {
        font-weight: bold;
      }
    }
  }
}

#copyToast {
  background: grey;
  color: white;
  position: fixed;
  bottom: 16px;
  right: 32px;
  z-index: 9999;
  font-weight: bold;
  width: 16em;
  padding: 1em;
  border-radius: 10px;
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
</style>