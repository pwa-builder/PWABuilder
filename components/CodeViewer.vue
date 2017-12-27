<template>
<section class="code_viewer">
    <header class="code_viewer-header">
        <div class="code_viewer-title pure-u-1 pure-u-md-1-2">{{title}}</div>
        <div class="code_viewer-title pure-u-1 pure-u-md-1-2"><slot/></div>
    </header>
    <div class="code_viewer-content" :style="{ height: size }">
        <div class="code_viewer-copy js-clipboard" :data-clipboard-text="code" ref="code">{{ $t('code_viewer.' + copyText) }}</div>
        <div class="code_viewer-toolbar" v-if="warnings || suggestions">
          <SkipLink v-if="warnings" class="pwa-button pwa-button--simple pwa-button--warning" :anchor="'#' + warningsId">
            Warnings ({{warningsTotal}})
          </SkipLink>
          <SkipLink v-if="suggestions" class="pwa-button pwa-button--simple"  :anchor="'#' + suggestionsId">
            Suggestions ({{suggestionsTotal}})
          </SkipLink>
        </div>
        <pre class="code_viewer-pre language-javascript" :style="{ height: size }" v-if="highlightedCode"><code class="code_viewer-code language-javascript" v-html="highlightedCode"></code></pre>

        <div class="l-generator-messages l-generator-messages--code">
          <IssuesList :errors="warnings" :title="'Warnings'" :id="warningsId" :total="warningsTotal" />
          <IssuesList :errors="suggestions" :title="'Suggestions'" :id="suggestionsId" :total="suggestionsTotal" />
        </div>
    </div>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import Clipboard from 'clipboard';
import Prism from 'prismjs';
import Component from 'nuxt-class-component';
import { Prop, Watch } from 'vue-property-decorator';

import SkipLink from '~/components/SkipLink.vue';
import IssuesList from '~/components/IssuesList.vue';

import { CodeError } from '~/store/modules/generator';

@Component({
  components: {
    SkipLink,
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

  @Prop({ type: Array, default: () => [] })
  public suggestions: CodeError[];

  @Prop({ type: Array, default: () => [] })
  public warnings: CodeError[];

  @Prop({ type: Number, default: 0 })
  public warningsTotal: number;

  @Prop({ type: Number, default: 0 })
  public suggestionsTotal: number;

  public highlightedCode: string | null = null;
  public copyText = 'copy';
  public readonly warningsId = 'warnings_list';
  public readonly suggestionsId = 'suggestions_list';

  public mounted(): void {
    if (this.code) {
      this.highlightedCode = Prism.highlight(
        this.code,
        Prism.languages.javascript
      );
    }

    let clipboard = new Clipboard(this.$refs.code);
    clipboard.on('success', e => {
      this.copyText = 'copied';
    });

    clipboard.on('error', e => {
      this.copyText = 'error';
    });
  }

  @Watch('code')
  onCodeChanged() {
    if (this.code) {
      this.copyText = 'copy';
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

  &-header {
    background-color: $color-brand;
    line-height: 1.5;
    padding: 1.5rem 1.5rem 1.1rem 1.5rem;
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