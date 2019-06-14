<template>
  <div>
    <div id="snippitCodeHeader">
      <h4>01</h4>

      <p>Lorem ipsum dolor amet vegan live-edge kinfolk kombucha flexitarian raclette street art polaroid gluten-free snackwave.</p>
    </div>

    <div id="monacoHeader">
      <button @click="copy()" id="copyButton">
        <i class="fas fa-copy"></i>
      </button>

      <button id="githubButton" @click="goToGithub()">
        <i class="fab fa-github"></i>
      </button>
    </div>

    <div id="codeDiv" ref="monacoDiv"></div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Prop } from "vue-property-decorator";
import Component from "nuxt-class-component";
import Clipboard from "clipboard";
import * as monaco from "monaco-editor";
@Component({})
export default class extends Vue {
  @Prop({ type: String, default: null }) snippitURL;
  @Prop({ type: String, default: null }) codeType;
  public actualCode: string = "";
  public editor: monaco.editor.IStandaloneCodeEditor;
  async mounted() {
    const response = await fetch(this.snippitURL);
    console.log(response);
    const data = await response.text();
    console.log("snippit data", data);
    this.actualCode = data;
    monaco.editor.defineTheme(`snippitTheme`, {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#F0F0F0"
      }
    });
    this.editor = monaco.editor.create(this.$refs.monacoDiv as HTMLElement, {
      value: this.actualCode,
      // Turn line numbers on so that line numbers in errors make sense
      language: this.codeType,
      lineNumbers: "on",
      fixedOverflowWidgets: true,
      wordWrap: "wordWrapColumn",
      wordWrapColumn: 50,
      scrollBeyondLastLine: false,
      // Set this to false to not auto word wrap minified files
      wordWrapMinified: true,
      // try "same", "indent" or "none"
      wrappingIndent: "indent",
      fontSize: 16,
      theme: "snippitTheme",
      minimap: {
        enabled: false
      }
    });
  }
  goToGithub() {
    window.open(this.snippitURL, "_blank");
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
}
</script>

<style lang="scss" scoped>
#snippitCodeHeader {
  display: flex;
}
h4 {
  font-weight: bold;
  margin-top: 1em;
  width: 85px;
  display: flex;
  font-size: 24px;
  color: #E2E2E2;
  justify-content: center;
}
p {
  font-size: 14px;
  margin-bottom: 24px;
}
#monacoHeader {
  background: #E2E2E2;
  display: flex;
  justify-content: flex-end;
  padding-top: 11px;
  padding-bottom: 11px;
  padding-right: 24px;
  #githubButton {
    height: 32px;
    width: 32px;
    border-radius: 50%;
    border: none;
    background: white;
  }
  #copyButton {
    width: 32px;
    border: none;
    height: 32px;
    border-radius: 50%;
    background: white;
    margin-right: 10px;
  }
}
#codeDiv {
  height: 11em;
  margin-bottom: 24px;
}
</style>