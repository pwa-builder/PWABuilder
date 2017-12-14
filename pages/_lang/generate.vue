<template>
<section>
    <GeneratorMenu first-link-path="generate" />
    <div class="l-generator-step">
        <div class="l-generator-semipadded">
          <div class="l-generator-form pure-u-1 pure-u-md-1-2">
            <h4 class="l-generator-subtitle">
                {{ $t("generate.subtitle") }}
            </h4>
            <h4 class="l-generator-subtitle l-generator-subtitle--last">
                {{ $t("generate.instructions") }}
            </h4>
            <div class="l-generator-field">
                <label class="l-generator-label">{{ $t("generate.name") }}
                    <a class="l-generator-link" href="https://www.w3.org/TR/appmanifest/#name-member" target="_blank">[?]</a>
                </label>
                <input class="l-generator-input" v-model="manifest$.name" type="text">
            </div>
            <div class="l-generator-field">
                <label class="l-generator-label">{{ $t("generate.short_name") }}
                    <a class="l-generator-link" href="https://www.w3.org/TR/appmanifest/#short_name-member" target="_blank">[?]</a>
                </label>
                <input class="l-generator-input" v-model="manifest$.short_name" name="short_name" type="text">
            </div>
            <div class="l-generator-field">
                <label class="l-generator-label">{{ $t("generate.description") }}
                    <a class="l-generator-link" href="https://www.w3.org/TR/appmanifest/#description-member" target="_blank">[?]</a>
                </label>
                <input class="l-generator-input" v-model="manifest$.description" name="description" type="text">
            </div>
            <div class="l-generator-field logo-upload">
                <label class="l-generator-label">{{ $t("generate.icon_url") }}
                    <a class="l-generator-link" href="https://www.w3.org/TR/appmanifest/#icons-member" target="_blank">[?]</a>
                </label>
                <div>
                    <input class="l-generator-input" placeholder="http://example.com/image.png or /images/example.png"
                        type="url">

                    <div class="button-holder icons">
                        <div class="l-inline">
                            <button class="pwa-button pwa-button--text isEnabled">
                                {{ $t("generate.upload") }}
                            </button>
                        </div>
                        <button class="pwa-button pwa-button--text pwa-button--right" disabled="">
                           {{ $t("generate.add_icon") }}
                        </button>
                    </div>

                    <div class="pure-g l-generator-table">
                        <div class="pure-u-10-24 l-generator-tableh">{{ $t("generate.preview") }}</div>
                        <div class="pure-u-8-24 l-generator-tableh">{{ $t("generate.size") }}</div>
                        <div class="pure-u-1-8"></div>
                        <div class="pure-u-1-8"></div>

                        <div class="pure-u-1" v-for="icon in icons" :key="icon.src">
                            <div class="pure-u-10-24 l-generator-tablec">
                                <a target="_blank" :href="(manifest$.start_url + icon.src)">
                                    <img class="icon-preview" :src="(manifest$.start_url + icon.src)">
                                </a>
                            </div>
                            <div class="pure-u-8-24 l-generator-tablec">
                                {{icon.sizes}}
                            </div>
                            <div class="pure-u-1-8 l-generator-tablec">
                            </div>
                            <div class="pure-u-1-8 l-generator-tablec l-generator-tablec--right" @click="onClickRemoveIcon(icon)">
                                <span class="l-generator-close">
                                    <i aria-hidden="true">✕</i>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="l-generator-field">
                <label class="l-generator-label">{{ $t("generate.scope") }}
                    <a class="l-generator-link" href="https://www.w3.org/TR/appmanifest/#scope-member" target="_blank">[?]</a>
                </label>
                <input class="l-generator-input" v-model="manifest$.scope" type="text">
            </div>
            <div class="l-generator-field">
                <label class="l-generator-label">{{ $t("generate.start_url") }}
                    <a class="l-generator-link" href="https://www.w3.org/TR/appmanifest/#start_url-member" target="_blank">[?]</a>
                </label>
                <input class="l-generator-input" v-model="manifest$.start_url" type="text">
            </div>
            <div class="l-generator-field">
                <label class="l-generator-label">{{ $t("generate.display") }}
                    <a class="l-generator-link" href="https://www.w3.org/TR/appmanifest/#display-member" target="_blank">[?]</a>
                </label>
                <select class="l-generator-input l-generator-input--select" v-model="manifest$.display">
                    <option v-for="display in displaysNames" :value="display" :key="display">{{display}}</option>
                </select>
            </div>
            <div class="l-generator-field">
                <label class="l-generator-label">{{ $t("generate.orientation") }}
                    <a class="l-generator-link" href="https://www.w3.org/TR/appmanifest/#orientation-member" target="_blank">[?]</a>
                </label>
                <select class="l-generator-input l-generator-input--select" v-model="manifest$.orientation">
                    <option v-for="orientation in orientationsNames" :value="orientation" :key="orientation">{{orientation}}</option>
                </select>
            </div>
            <div class="l-generator-field">
                <label class="l-generator-label">{{ $t("generate.language") }}
                    <a class="l-generator-link" href="https://www.w3.org/TR/appmanifest/#lang-member" target="_blank">[?]</a>
                </label>
                <select class="l-generator-input l-generator-input--select" v-model="manifest$.lang">
                    <option v-for="language in languagesNames" :value="language" :key="language">{{language}}</option>
                </select>
            </div>
            <div id="ember567">
                <div class="l-generator-field">
                    <label class="l-generator-label">B{{ $t("generate.background_color") }}
                        <a class="l-generator-link" href="https://www.w3.org/TR/appmanifest/#background_color-member" target="_blank">[?]</a>
                    </label>
                    <div class="l-generator-options">
                        <label class="l-generator-label">
                            <input type="radio" value="none"> {{ $t("generate.none") }}
                        </label>
                    </div>
                </div>
            </div>
            <label class="l-generator-toggle">
                <input type="checkbox" class="l-generator-togglecheck">
                <h4 class="l-generator-subtitle l-generator-subtitle--toggleable">{{ $t("generate.specify_application") }}</h4>
            </label>
            <label class="l-generator-toggle">
                <input type="checkbox" class="l-generator-togglecheck">
                <h4 class="l-generator-subtitle l-generator-subtitle--toggleable">{{ $t("generate.specify_members") }}</h4>
            </label>
        </div>
        </div>
    </div>

    <div class="l-generator-buttons l-generator-buttons--centered">
        <button class="pwa-button">{{ $t("generate.next_step") }}</button>
    </div>
    </div>
    <TwoWays/>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'nuxt-class-component';
import { Action, State, Getter, namespace } from 'vuex-class';

import GeneratorMenu from '~/components/GeneratorMenu';
import TwoWays from '~/components/TwoWays';

import * as generator from '~/store/modules/generator';

const GeneratorState = namespace(generator.name, State);
const GeneratorActions = namespace(generator.name, Action);

@Component({
  components: {
    TwoWays,
    GeneratorMenu
  }
})
export default class extends Vue {
  public manifest$: generator.Manifest | null = null;

  @GeneratorState manifest: generator.Manifest;
  @GeneratorState icons: generator.Icon[];

  @Getter orientationsNames: string[];
  @Getter languagesNames: string[];
  @Getter displaysNames: string[];

  @GeneratorActions removeIcon;

  public created(): void {
    if (!this.manifest) {
      this.$router.push({
        path: '/'
      });
    }

    this.manifest$ = {...this.manifest};
  }

  public onClickRemoveIcon(icon) {
      this.removeIcon(icon);
  }
}
</script>
