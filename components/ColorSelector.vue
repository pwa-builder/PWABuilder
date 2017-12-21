<template>
<div class="l-generator-field">
    <label class="l-generator-label">{{ $t("generate.background_color") }}
        <a class="l-generator-link" href="https://www.w3.org/TR/appmanifest/#background_color-member" target="_blank">[?]</a>
    </label>
    <div class="l-generator-options">
        <label class="l-generator-label" v-for="colorOption in colorOptions" :key="colorOption">
            <input type="radio" :value="colorOption" :name='id' @change="onChangeColor(colorOption)" :checked="isColorChecked(colorOption)"> {{ $t("generate." + colorOption) }}
        </label>

        <div v-if="canChooseColor">
            <input class="l-generator-input l-generator-input--tiny" type="color" name="background_color" v-model="color">
            <input v-if="checkInputColor" class="l-generator-input l-generator-input--small" type="text" placeholder="#000000" name="background_color" v-model="color">
        </div>
    </div>
</div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'nuxt-class-component'
import { Watch } from 'vue-property-decorator';
import { Action, State, namespace } from 'vuex-class';

import * as generator from '~/store/modules/generator';

const GeneratorState = namespace(generator.name, State);
const GeneratorActions = namespace(generator.name, Action);

@Component()
export default class extends Vue {
    public manifest$: generator.Manifest | null = null;

    public colorOptions = generator.helpers.COLOR_OPTIONS;
    public id: string | null = null;
    public color: string | null = null;
    public canChooseColor: boolean = false;

    @GeneratorState manifest: generator.Manifest;
    @GeneratorActions updateColor;

    public get checkInputColor(): boolean {
       if (typeof document === 'undefined') {
                return false;
        }

        let i = document.createElement('input');
        i.setAttribute('type', 'color');
        return i.type !== 'text';
    }

    public created(): void {
        this.id = 'color-selector' + Date.now();
        this.manifest$ = { ...this.manifest };

        this.updateCanChooseColor();
    }

    private updateCanChooseColor(): void {
        if (!this.manifest$) {
            return;
        }

        this.canChooseColor = this.manifest$.background_color !== this.colorOptions.none && this.manifest$.background_color !== this.colorOptions.transparent;
    }

    public isColorChecked(colorOption: string): boolean {
        if (!this.manifest$) {
            return false;
        }

        if (colorOption === this.colorOptions.pick && this.manifest$.background_color !== this.colorOptions.none && this.manifest$.background_color !== this.colorOptions.transparent) {
            return true;
        }

        return this.manifest$.background_color === colorOption
    }

    public onChangeColor(colorOption: string): void {
        this.updateColor({
            colorOption,
            color: this.color,
        } as generator.ColorOptions);

        this.manifest$ = { ...this.manifest };

        this.updateCanChooseColor();
    }
}
</script>

<style lang="scss" scoped>
@import '~assets/scss/base/variables';

</style>