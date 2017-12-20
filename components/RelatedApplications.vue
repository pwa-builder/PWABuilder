<template>
<section>
    <div class="l-generator-field">
        <label class="l-generator-label">Platform <a class="l-generator-link" href="https://www.w3.org/TR/appmanifest/#platform-member" target="_blank">[?]</a></label>
        <!-- {{input class="l-generator-input" name="relatedApp_platform" value=relatedApp_platform}} -->
    </div>
    <div class="l-generator-field">
        <label class="l-generator-label">URL <a class="l-generator-link" href="https://www.w3.org/TR/appmanifest/#url-member" target="_blank">[?]</a></label>
        <!-- {{input class="l-generator-input" name="relatedApp_url" value=relatedApp_url}} -->
    </div>
    <div class="l-generator-field">
        <label class="l-generator-label">Id <a class="l-generator-link" href="https://www.w3.org/TR/appmanifest/#id-member" target="_blank">[?]</a></label>
        <!-- {{input class="l-generator-input" name="relatedApp_id" value=relatedApp_id}} -->
    </div>

    <div class="button-holder">
        <button class="pwa-button pwa-button--text pwa-button--right"
                @click="addRelatedApplication()"
                data-flare='{"category": "Manifest", "action": "Add Member", "label": "Related Application", "value": { "page": "/manifest/add-member" }}'>
            Add Related Application
        </button>
    </div>

    <div class="l-generator-field l-generator-field--padded"></div>

    <p class="l-generator-error"
       v-if="showAlert">
        <i class="fa fa-exclamation"></i> {{memberAlert}}
    </p>

        <div class="pure-g l-generator-table"
             v-if="manifest$.relatedApplications">
            <div class="pure-u-2-5 l-generator-tableh">Platform</div>
            <div class="pure-u-2-5 l-generator-tableh">URL</div>
            <div class="pure-u-1-5"></div>

                <div v-for="app in manifest$.relatedApplications" :key="app">
                    <div class="pure-u-2-5 l-generator-tablec">
                        {{app.platform}}
                    </div>
                    <div class="pure-u-2-5 l-generator-tablec">
                        {{app.url}}
                    </div>
                    <div class="pure-u-1-5 l-generator-tablec l-generator-tablec--right">
                        <span class="l-generator-close" @click="removeRelatedApplication()"><i aria-hidden="true">✕</i></span>
                    </div>
                </div>
        </div>

    <div class="l-generator-field">
        <label class="l-generator-label">
            <!-- {{generator-checkbox checked=manifest$.preferRelatedApplications action="updatepreferRelatedApplications" }} -->
            Prefer related applications
        </label>
    </div>
</section>
</template>

<script lang="ts">
import Vue from "vue";
import { Prop } from "vue-property-decorator";
import Component from "nuxt-class-component";
import { Action, State, namespace } from "vuex-class";

import * as generator from "~/store/modules/generator";

const GeneratorState = namespace(generator.name, State);
const GeneratorActions = namespace(generator.name, Action);

@Component()
export default class extends Vue {
    public manifest$: generator.Manifest | null = null;

    @GeneratorState manifest: generator.Manifest;
    
    public created(): void {
        this.manifest$ = { ...this.manifest };
    }
}
</script>

<style lang="scss" scoped>
@import '~assets/scss/base/variables';

</style>