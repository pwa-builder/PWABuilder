<template>
<section class="code_viewer">
  <header class="code_viewer-header">
    <div class="code_viewer-title pure-u-1-2">
      {{title}}
    </div>
    <div class="code_viewer-title pure-u-1-2">
      <slot/>
    </div>
  </header>
  <div class="code_viewer-content" :style="{ height: size }">
    <div class="code_viewer-copy js-clipboard"  ref="code">
    </div>
    <pre class="code_viewer-pre language-javascript" v-if="highlightedCode">
      <code class="code_viewer-code language-javascript code_container" v-html="highlightedCode"/>
    </pre>
  </div>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import Prism from 'prismjs';
import Component from 'nuxt-class-component';
import { Prop, Watch } from 'vue-property-decorator';

@Component({})
export default class extends Vue {

  @Prop({ type: String, default: '' })
  public code: string | null;

  @Prop({ type: String, default: '' })
  public title: string | null;

  @Prop({ type: String, default: 'auto' })
  public size: string | null;

  public highlightedCode: string | null = null;
  public isReady = true;

  public mounted(): void {
    if (this.code) {
      this.highlightedCode = Prism.highlight(
        this.code,
        Prism.languages.javascript
      );
    }
  }

  @Watch('code')
  onCodeChanged() {
    if (this.code) {
      this.highlightedCode = Prism.highlight(
        this.code,
        Prism.languages.javascript
      );
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~assets/scss/base/variables";

.code_viewer {
  font-size: 0;

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
    overflow: auto;
    padding: 1rem;
  }

  &-code {
    font-size: 1rem;
    white-space: pre-wrap;
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
    overflow: scroll;
    position: relative;
  }

  &-content:hover &-copy {
    opacity: 1;
  }

  .code_container {
    height: 50%;
    overflow-x: scroll;
    overflow-y: scroll;
  }
}
</style>