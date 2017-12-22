<template>
<section>
    <GeneratorMenu/>
    <div class="l-generator-step">
        <div class="l-generator-semipadded pure-g">
            <div class="pure-u-1 pure-u-md-1-2 generator-section service-workers">
                <div class="l-generator-subtitle">{{ $t('serviceworker.title') }}</div>
                <form @submit.prevent="download" @keydown.enter.prevent="download">
                    <div class="l-generator-field l-generator-field--padded checkbox">
                        <label class="l-generator-label">
                            <input type="radio" value="1" v-model="serviceworker$"> {{ $t('serviceworker.titles.offline_page') }}
                        </label>

                        <span class="l-generator-description">{{ $t('serviceworker.descriptions.offline_page') }}</span>
                    </div>

                    <div class="l-generator-field l-generator-field--padded checkbox">
                        <label class="l-generator-label">
                            <input type="radio" value="2" v-model="serviceworker$"> {{ $t('serviceworker.titles.offline_copy') }}
                        </label>

                        <span class="l-generator-description">{{ $t('serviceworker.descriptions.offline_copy') }}</span>
                    </div>

                    <div class="l-generator-field l-generator-field--padded checkbox">
                        <label class="l-generator-label">
                            <input type="radio" value="3" v-model="serviceworker$"> {{ $t('serviceworker.titles.offline_copy_backup') }}
                        </label>

                        <span class="l-generator-description">{{ $t('serviceworker.descriptions.offline_copy_backup') }}</span>
                    </div>

                    <div class="l-generator-field l-generator-field--padded checkbox">
                        <label class="pwa-generator-label">
                            <input type="radio" value="4" v-model="serviceworker$"> {{ $t('serviceworker.titles.cache_first') }}
                        </label>

                        <span class="l-generator-description">{{ $t('serviceworker.descriptions.cache_first') }}</span>
                    </div>

                    <div class="l-generator-field l-generator-field--padded checkbox">
                        <label class="l-generator-label">
                            <input type="radio" value="5" disabled="" v-model="serviceworker$"> {{ $t('serviceworker.titles.advanced') }}
                        </label>

                        <span class="l-generator-description">{{ $t('serviceworker.descriptions.advanced') }}</span>
                    </div>

                    <div class="l-generator-wrapper pure-u-2-5">
                        <button data-flare="{'category': 'Download', 'action': 'Web', 'label': 'Download Archive', 'value': { 'page': '/download/web' }}"
                            class="pwa-button pwa-button--simple isEnabled">
                            <span v-if="!isBuilding">{{ $t('serviceworker.download') }}</span>
                            <span v-if="isBuilding">{{ $t('serviceworker.building') }}
                                <Loading :active="true" :size="'sm'" class="u-display-inline_block u-margin-left-sm"
                                />
                            </span>
                        </button>
                    </div>
                    <div class="pure-u-3-5">
                        <p class="l-generator-error">{{ $t(error) }}</p>
                    </div>
                </form>
                <p>{{ $t('serviceworker.download_link') }}
                    <a class="l-generator-link" href="https://github.com/pwa-builder/serviceworkers"
                        target="_blank">GitHub</a>.</p>
            </div>
            <div class="serviceworker-preview pure-u-1 pure-u-md-1-2 generator-section">
                <CodeViewer :code="webPreview" :title="$t('serviceworker.code_preview_web')">
                    <nuxt-link :to="$i18n.path('publish')" class="pwa-button pwa-button--simple pwa-button--brand pwa-button--header">
                        {{ $t("serviceworker.next_step") }}
                    </nuxt-link>
                </CodeViewer>
                <CodeViewer :code="serviceworkerPreview" :title="$t('serviceworker.code_preview_serviceworker')"></CodeViewer>
            </div>
        </div>
    </div>
    <div class="l-generator-buttons l-generator-buttons--centered">
        <nuxt-link :to="$i18n.path('publish')" class="pwa-button">
            {{ $t("serviceworker.next_step") }}
        </nuxt-link>
    </div>

    <StartOver />
    <TwoWays/>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'nuxt-class-component';
import { Watch } from 'vue-property-decorator';
import { Action, State, namespace } from 'vuex-class';

import GeneratorMenu from '~/components/GeneratorMenu.vue';
import TwoWays from '~/components/TwoWays.vue';
import Loading from '~/components/Loading.vue';
import CodeViewer from '~/components/CodeViewer.vue';
import StartOver from '~/components/StartOver.vue';

import * as serviceworker from '~/store/modules/serviceworker';

const ServiceworkerState = namespace(serviceworker.name, State);
const ServiceworkerAction = namespace(serviceworker.name, Action);

@Component({
  components: {
    TwoWays,
    GeneratorMenu,
    Loading,
    StartOver,
    CodeViewer
  }
})
export default class extends Vue {
    public isBuilding = false;
    public serviceworker$: number | null = null;
    public error: string | null = null;

    @ServiceworkerState serviceworker: number;
    @ServiceworkerState serviceworkerPreview: string;
    @ServiceworkerState webPreview: string;
    @ServiceworkerState archive: string;

    @ServiceworkerAction downloadServiceWorker;
    @ServiceworkerAction getCode;

    public created(): void {
        this.serviceworker$ = this.serviceworker;
    }

    public async download(): Promise<void> {
        this.isBuilding = true;
        try {
            await this.downloadServiceWorker(this.serviceworker$);
        } catch (e) {
            this.error = e;
        }
        if (this.archive) {
            window.location.href = this.archive;
        }
        //this.ga('send', 'event', 'item', 'click', 'serviceworker-download');
        this.isBuilding = false;
    }

    @Watch('serviceworker$')
    async onServiceworker$Changed() {
        try {
            await this.getCode(this.serviceworker$);
        } catch (e) {
            this.error = e;
        }
    }
}

</script>

<style lang="scss" scoped>
@import '~assets/scss/base/variables';

.serviceworker {
    &-preview {
        margin-top: -2rem;
    }
}

</style>