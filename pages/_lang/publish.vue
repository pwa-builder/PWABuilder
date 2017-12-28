<template>
<section>
    <GeneratorMenu/>
    <div v-if="status">
        <div class="pwa-infobox pwa-infobox--transparent l-pad l-pad--thin">
            <div class="pure-g">
                <div class="pure-u-1">
                    <h2 class="pwa-infobox-title pwa-infobox-title--centered">{{ $t('publish.title') }}</h2>
                </div>

                <div class="pure-u-1 pure-u-md-1-2">
                    <div class="pwa-infobox-box pwa-infobox-box--flat">
                        <h4 class="pwa-infobox-subtitle pwa-infobox-subtitle--thin">{{ $t('publish.web') }}</h4>
                        <p class="l-generator-description l-generator-description--fixed">
                            {{ $t('publish.web_description') }}
                        </p>
                        <span class="button-holder download-archive">
                            <Download platform="web" :message="$t('publish.download')" :is-brand="true" />
                        </span>
                    </div>
                </div>

                <div class="pure-u-1 pure-u-md-1-2">
                    <div class="pwa-infobox-box pwa-infobox-box--flat">
                        <h4 class="pwa-infobox-subtitle pwa-infobox-subtitle--thin">{{ $t('publish.windows') }}</h4>
                        <p class="l-generator-description l-generator-description--fixed">{{ $t('publish.windows_description') }}</p>
                        <span class="button-holder download-archive">
                            <Download platform="windows10" :message="$t('publish.download')" />
                        </span>
                        <p>
                            <button class="pwa-button pwa-button--simple pwa-button--brand" @click="openAppXModal()">{{ $t('publish.generate_appx') }}</button>
                        </p>
                    </div>
                </div>
                <Modal :title="$t('publish.generate_appx')" ref="appxModal" @submit="onSubmitAppxModal" @cancel="onCancelAppxModal" v-if="appxForm">
                    <div class="l-generator-box">
                        <label class="l-generator-label">{{ $t('publish.enter_your') }}
                            <a href="https://developer.microsoft.com/en-us/windows" target="_blank">{{ $t('publish.dev_center') }}</a> {{ $t('publish.publisher_details') }}</label>
                    </div>
                    <div class="l-generator-box">
                        <label class="l-generator-label">{{ $t('publish.label_publisher') }}</label>
                    </div>
                    <input class="l-generator-input l-generator-input--largest" :placeholder="$t('publish.placeholder_publisher')" type="text"
                        v-model="appxForm.publisher" requied>

                    <div class="l-generator-box form-item">
                        <label class="l-generator-label">{{ $t('publish.label_identity') }}</label>
                        <label class="l-generator-label">{{ $t('publish.label_publisher_id') }}</label>
                    </div>
                    <input class="l-generator-input l-generator-input--largest" :placeholder="$t('publish.placeholder_identity')" type="text"
                        v-model="appxForm.publisher_id" requied>

                    <div class="l-generator-box form-item">
                        <label class="l-generator-label">{{ $t('publish.label_package') }}</label>
                    </div>
                    <input class="l-generator-input l-generator-input--largest" :placeholder="$t('publish.placeholder_package')" type="text"
                        v-model="appxForm.package" requied>

                    <div class="l-generator-box form-item">
                        <label class="l-generator-label">{{ $t('publish.label_version') }}</label>
                    </div>
                    <input class="l-generator-input l-generator-input--largest" :placeholder="$t('publish.placeholder_version')" type="text"
                        v-model="appxForm.version" requied>
                    <p class="l-generator-error" v-if="appxError">{{ $t(appxError) }}</p>
                </Modal>
                <div class="pure-u-1">
                    <div class="pwa-infobox-box pwa-infobox-box--flat">
                        <div class="pwa-infobox-padded">
                            <h4 class="pwa-infobox-subtitle pwa-infobox-subtitle--thin">{{ $t('publish.android') }}</h4>
                            <p class="l-generator-description l-generator-description--fixed l-generator-description--context">{{ $t('publish.android_description') }}</p>
                            <div>
                                <Download platform="android" :message="$t('publish.download')" />
                            </div>
                        </div>
                        <h2 class="pwa-infobox-subtitle pwa-infobox-subtitle--thin">{{ $t('publish.ios') }}</h2>
                        <Download platform="ios" :message="$t('publish.download')" />
                    </div>
                </div>
            </div>
        </div>
        <StartOver />
    </div>

    <div class="l-generator-buttons l-generator-buttons--centered" v-if="!status">
        <p class="instructions">{{ $t('publish.manifest_needed') }}</p>
        <button @click="goToHome" class="pwa-button pwa-button--simple">{{ $t('publish.first_step') }}</button>
    </div>
    <TwoWays/>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'nuxt-class-component';
import { Action, State, namespace } from 'vuex-class';

import GeneratorMenu from '~/components/GeneratorMenu.vue';
import TwoWays from '~/components/TwoWays.vue';
import StartOver from '~/components/StartOver.vue';
import Download from '~/components/Download.vue';
import Modal from '~/components/Modal.vue';

import * as publish from '~/store/modules/publish';

const PublishState = namespace(publish.name, State);
const PublishAction = namespace(publish.name, Action);

@Component({
  components: {
    TwoWays,
    GeneratorMenu,
    Download,
    StartOver,
    Modal
  }
})
export default class extends Vue {
  public appxForm: publish.AppxParams = {
    publisher: null,
    publisher_id: null,
    package: null,
    version: null
  };

  @PublishState status: boolean;
  @PublishState appXLink: string;

  @PublishAction updateStatus;
  @PublishAction buildAppx;

  public appxError: string | null = null;

  public created(): void {
    this.updateStatus();
  }

  public goToHome(): void {
    this.$router.push({
      name: 'index'
    });
  }

  public openAppXModal(): void {
    (this.$refs.appxModal as Modal).show();
  }

  public async onSubmitAppxModal(): Promise<void> {
    const $appxModal = this.$refs.appxModal as Modal;
    $appxModal.showLoading();

    try {
      await this.buildAppx(this.appxForm);

      if (this.appXLink) {
        window.location.href = this.appXLink;
      }
    } catch (e) {
      this.appxError = e;
      $appxModal.hideLoading();
    }
  }

  public onCancelAppxModal(): void {
    this.appxForm = {
      publisher: null,
      publisher_id: null,
      package: null,
      version: null
    };
  }
}
</script>
