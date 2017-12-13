<template>
<section>
    <GeneratorMenu first-link-path='generate' />
    <div class="l-generator-step">
        <div class="l-generator-semipadded">
          <div class="l-generator-form pure-u-1 pure-u-md-1-2">
            <h4 class="l-generator-subtitle">
                Here are the values we picked up from your site.
            </h4>
            <h4 class="l-generator-subtitle l-generator-subtitle--last">
                Update or add any details below.
            </h4>
            <div class="l-generator-field">
                <label class="l-generator-label">Name
                    <a class="l-generator-link" href="https://www.w3.org/TR/appmanifest/#name-member" target="_blank">[?]</a>
                </label>
                <input class="l-generator-input" v-model="manifest$.name" type="text">
            </div>
            <div class="l-generator-field">
                <label class="l-generator-label">Short Name
                    <a class="l-generator-link" href="https://www.w3.org/TR/appmanifest/#short_name-member" target="_blank">[?]</a>
                </label>
                <input class="l-generator-input" v-model="manifest$.short_name" name="short_name" type="text">
            </div>
            <div class="l-generator-field">
                <label class="l-generator-label">Description
                    <a class="l-generator-link" href="https://www.w3.org/TR/appmanifest/#description-member" target="_blank">[?]</a>
                </label>
                <input class="l-generator-input" v-model="manifest$.description" name="description" type="text">
            </div>
            <div class="l-generator-field logo-upload">
                <label class="l-generator-label">Icon Url
                    <a class="l-generator-link" href="https://www.w3.org/TR/appmanifest/#icons-member" target="_blank">[?]</a>
                </label>
                <div>
                    <input class="l-generator-input" placeholder="http://example.com/image.png or /images/example.png"
                        type="url">

                    <div class="button-holder icons">
                        <div class="l-inline">
                            <button class="pwa-button pwa-button--text isEnabled">
                                Or upload an image...
                            </button>
                        </div>
                        <button class="pwa-button pwa-button--text pwa-button--right" disabled="">
                           Add Icon
                        </button>
                    </div>

                    <div class="pure-g l-generator-table">
                        <div class="pure-u-10-24 l-generator-tableh">Preview</div>
                        <div class="pure-u-8-24 l-generator-tableh">Size</div>
                        <div class="pure-u-1-8"></div>
                        <div class="pure-u-1-8"></div>

                        <div class="pure-u-10-24 l-generator-tablec">
                            <a target="_blank" href="">
                                <img class="icon-preview" src="http://google.es/images/branding/product/ico/googleg_lodp.ico">
                            </a>
                        </div>
                        <div class="pure-u-8-24 l-generator-tablec">
                            16x16 32x32
                        </div>
                        <div class="pure-u-1-8 l-generator-tablec">
                        </div>
                        <div class="pure-u-1-8 l-generator-tablec l-generator-tablec--right">
                            <span class="l-generator-close">
                                <i class="fa fa-times" aria-hidden="true"></i>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="l-generator-field">
                <label class="l-generator-label">Scope
                    <a class="l-generator-link" href="https://www.w3.org/TR/appmanifest/#scope-member" target="_blank">[?]</a>
                </label>
                <input class="l-generator-input" v-model="manifest$.scope" type="text">
            </div>
            <div class="l-generator-field">
                <label class="l-generator-label">Start Url
                    <a class="l-generator-link" href="https://www.w3.org/TR/appmanifest/#start_url-member" target="_blank">[?]</a>
                </label>
                <input class="l-generator-input" v-model="manifest$.start_url" type="text">
            </div>
            <div class="l-generator-field">
                <label class="l-generator-label">Display
                    <a class="l-generator-link" href="https://www.w3.org/TR/appmanifest/#display-member" target="_blank">[?]</a>
                </label>
                <select class="l-generator-input l-generator-input--select">
                    <option value="fullscreen">fullscreen</option>
                </select>
            </div>
            <div class="l-generator-field">
                <label class="l-generator-label">Orientation
                    <a class="l-generator-link" href="https://www.w3.org/TR/appmanifest/#orientation-member" target="_blank">[?]</a>
                </label>
                <select class="l-generator-input l-generator-input--select">

                    <option value="any">any</option>
                </select>
            </div>
            <div class="l-generator-field">
                <label class="l-generator-label">Language
                    <a class="l-generator-link" href="https://www.w3.org/TR/appmanifest/#lang-member" target="_blank">[?]</a>
                </label>
                <select id="ember554" class="l-generator-input l-generator-input--select">
                    <option value=""> </option>
                    
                </select>
            </div>
            <div id="ember567">
                <div class="l-generator-field">
                    <label class="l-generator-label">Background Color
                        <a class="l-generator-link" href="https://www.w3.org/TR/appmanifest/#background_color-member" target="_blank">[?]</a>
                    </label>
                    <div class="l-generator-options">
                        <label class="l-generator-label">
                            <input type="radio" value="none"> None
                        </label>
                    </div>
                </div>
            </div>
            <label class="l-generator-toggle">
                <input type="checkbox" class="l-generator-togglecheck">
                <h4 class="l-generator-subtitle l-generator-subtitle--toggleable">Specify related applications to be added to the manifest.</h4>
            </label>
            <label class="l-generator-toggle">
                <input type="checkbox" class="l-generator-togglecheck">
                <h4 class="l-generator-subtitle l-generator-subtitle--toggleable">Specify custom members to be added to the manifest.</h4>
            </label>
        </div>
        </div>
    </div>

    <div class="l-generator-buttons l-generator-buttons--centered">
        <button class="pwa-button">Next Step</button>
    </div>
    </div>
    <TwoWays/>
</section>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "nuxt-class-component";
import { Action, State, namespace } from "vuex-class";

import GeneratorMenu from "~/components/GeneratorMenu";
import TwoWays from "~/components/TwoWays";

import * as generator from "~/store/modules/generator";

const GeneratorState = namespace(generator.name, State);
const GeneratorAction = namespace(generator.name, Action);

@Component({
  components: {
    TwoWays,
    GeneratorMenu
  }
})
export default class extends Vue {
  public manifest$: generator.Manifest | null = null;

  @GeneratorState manifest: generator.Manifest;

  public created(): void {
    if (!this.manifest) {
      this.$router.push({
        path: "/"
      });
    }

    this.manifest$ = this.manifest || {};
  }
}
</script>
