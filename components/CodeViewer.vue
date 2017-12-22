<template>
<section class="code_viewer">
    <header class="code_viewer-header">
        <div class="code_viewer-title pure-u-1 pure-u-md-1-2">{{title}}</div>
        <div class="code_viewer-title pure-u-1 pure-u-md-1-2"><slot/></div>
    </header>
    <div class="code_viewer-content">
        <div class="code_viewer-copy js-clipboard" :data-clipboard-text="code" ref="code">{{ $t('code_viewer.' + copyText) }}</div>
        <div class="code_viewer-toolbar"></div>
        <pre class="code_viewer-pre language-javascript" v-if="highlightedCode"><code class="code_viewer-code language-javascript" v-html="highlightedCode"></code></pre>
    </div>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import { Prop, Watch } from 'vue-property-decorator';
import Component from 'nuxt-class-component';

import Clipboard from 'clipboard';
import Prism from 'prismjs';

@Component({})
export default class extends Vue {

    @Prop({ type: String, default: '' })
    public title: string;

    @Prop({ type: String, default: '' })
    public code: string | null;

    public highlightedCode: string | null = null;
    public copyText= 'copy';

    public mounted(): void {
        if (this.code) {
            this.highlightedCode = Prism.highlight(this.code, Prism.languages.javascript);
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
            this.highlightedCode = Prism.highlight(this.code, Prism.languages.javascript);
        }
    }
}
</script>

<style lang="scss" scoped>
@import '~assets/scss/base/variables';

.code_viewer {
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

    &-toolbar {

    }

    &-pre {
        max-height: 25rem;
        overflow: auto;
        padding: 1rem;
    }

    &-code {
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
        height: 25rem;
        margin: 0;
        min-height: 4rem;
        position: relative;
    }

    &-content:hover &-copy {
        opacity: 1;
    }
}

</style>