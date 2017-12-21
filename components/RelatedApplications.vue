<template>
<section>
    <div class="l-generator-field">
        <label class="l-generator-label">{{ $t("related_applications.platform") }}
            <a class="l-generator-link" href="https://www.w3.org/TR/appmanifest/#platform-member" target="_blank">[?]</a>
        </label>
        <input class="l-generator-input" v-model="platform" type="text">
    </div>
    <div class="l-generator-field">
        <label class="l-generator-label">{{ $t("related_applications.url") }}
            <a class="l-generator-link" href="https://www.w3.org/TR/appmanifest/#url-member" target="_blank">[?]</a>
        </label>
        <input class="l-generator-input" v-model="url" type="text">

    </div>
    <div class="l-generator-field">
        <label class="l-generator-label">{{ $t("related_applications.id") }}
            <a class="l-generator-link" href="https://www.w3.org/TR/appmanifest/#id-member" target="_blank">[?]</a>
        </label>
        <input class="l-generator-input" v-model="id" type="text">

    </div>

    <div class="button-holder">
        <button class="pwa-button pwa-button--text pwa-button--right" @click="onClickAdd()" data-flare='{"category": "Manifest", "action": "Add Member", "label": "Related Application", "value": { "page": "/manifest/add-member" }}'>
            {{ $t("related_applications.add") }}
        </button>
    </div>

    <div class="l-generator-field l-generator-field--padded"></div>

    <p class="l-generator-error" v-if="error">
        {{error}}
    </p>

    <div class="pure-g l-generator-table" v-if="manifest$.related_applications && manifest$.related_applications.length > 0">
        <div class="pure-u-2-5 l-generator-tableh">{{ $t("related_applications.platform") }}</div>
        <div class="pure-u-2-5 l-generator-tableh">{{ $t("related_applications.url") }}</div>
        <div class="pure-u-1-5"></div>

        <div class="pure-u-1" v-for="app in manifest$.related_applications" :key="app.id">
            <div class="pure-u-2-5 l-generator-tablec">
                {{app.platform}}
            </div>
            <div class="pure-u-2-5 l-generator-tablec">
                {{app.url}}
            </div>
            <div class="pure-u-1-5 l-generator-tablec l-generator-tablec--right">
                <span class="l-generator-close" @click="onClickRemove(app.id)">
                    <i aria-hidden="true">✕</i>
                </span>
            </div>
        </div>
    </div>

    <div class="l-generator-field">
        <label class="l-generator-label">
            <input type="checkbox" class="l-generator-togglecheck" @change="onChangePreferCheckbox($event)">
            {{ $t("related_applications.prefer") }}
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
    public platform: string | null = null;
    public url: string | null = null;
    public id: string | null = null;
    public prefer_related_applications = false;
    public error: string | null = null;

    @GeneratorState manifest: generator.Manifest;

    @GeneratorActions addRelatedApplication;
    @GeneratorActions removeRelatedApplication;
    @GeneratorActions changePreferRelatedApplication;

    public created(): void {
        this.manifest$ = { ...this.manifest };
        this.prefer_related_applications = this.manifest$.prefer_related_applications;
    }

    public onClickAdd(): void {
        try {
            this.addRelatedApplication({
                platform: this.platform,
                url: this.url,
                id: this.id,
            } as generator.RelatedApplication);

            this.platform = null;
            this.url = null;
            this.id = null;

            this.manifest$ = { ...this.manifest };
        } catch (e) {
            this.error = e;
        }
    }

    public onClickRemove(id: string): void {
        this.removeRelatedApplication(id);
    }

    public onChangePreferCheckbox($event) {
        this.changePreferRelatedApplication($event.currentTarget.value);
    }
}
</script>

<style lang="scss" scoped>
@import '~assets/scss/base/variables';

</style>