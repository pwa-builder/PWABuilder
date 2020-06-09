<template>
  <div>
    <label>
      <h4 id="colorHeader">{{ $t("generate.background_color") }}</h4>
      <p id="colorDetail">select the background color for your splash screen and tile</p>
    </label>
    <div>
      <label class="optionLabel" v-for="colorOption in colorOptions" :key="colorOption">
        <input
          type="radio"
          :value="colorOption"
          :name="id"
          @change="onChangeColor(colorOption)"
          :checked="isColorChecked(colorOption)"
          aria-label="Color Option"
        >
        <div class="colorOptionDiv">{{ $t("generate." + colorOption) }}</div>
      </label>

      <div id="colorPickerInput" v-if="canChooseColor">
        <input
          v-if="checkInputColor"
          type="text"
          id="colorHex"
          placeholder="#000000"
          name="background_color"
          v-model="color"
          aria-label="Background Color"
        >
        <input
          id="actualColorInput"
          type="color"
          name="background_color"
          v-model="color"
          @change="onChangeColor(color)"
          aria-label="Background Color"
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "nuxt-class-component";
import { Action, State, namespace } from "vuex-class";

import * as generator from "~/store/modules/generator";

const GeneratorState = namespace(generator.name, State);
const GeneratorActions = namespace(generator.name, Action);

@Component({})
export default class extends Vue {
  public manifest$: generator.Manifest | null = null;

  public colorOptions = generator.helpers.COLOR_OPTIONS;
  public id: string | null = null;
  public color: string | null = null;
  public canChooseColor = false;

  @GeneratorState manifest: generator.Manifest;
  @GeneratorActions updateColor;

  public get checkInputColor(): boolean {
    if (typeof document === "undefined") {
      return false;
    }

    let i = document.createElement("input");
    i.setAttribute("type", "color");
    return i.type !== "text";
  }

  public created(): void {
    this.id = "color-selector" + Date.now();
    this.manifest$ = { ...this.manifest };

    this.updateCanChooseColor();

    // Check manifest from server color
    if (this.canChooseColor) {
      this.color =
        this.color ||
        this.manifest$.background_color ||
        this.manifest$.theme_color;
    }
  }

  private updateCanChooseColor(): void {
    if (!this.manifest$) {
      return;
    }

    this.canChooseColor =
      this.manifest$.background_color !== this.colorOptions.none &&
      this.manifest$.background_color !== this.colorOptions.transparent;
  }

  public isColorChecked(colorOption: string): boolean {
    if (!this.manifest$) {
      return false;
    }

    if (
      colorOption === this.colorOptions.pick &&
      this.manifest$.background_color !== this.colorOptions.none &&
      this.manifest$.background_color !== this.colorOptions.transparent
    ) {
      return true;
    }

    return this.manifest$.background_color === colorOption;
  }

  public onChangeColor(colorOption: string): void {
    const colorOptions: generator.ColorOptions = {
      colorOption,
      color: this.color || colorOption
    };
    this.updateColor(colorOptions);

    this.manifest$ = { ...this.manifest };

    this.updateCanChooseColor();
  }
}
</script>

<style lang="scss" scoped>
#colorHeader {
  font-size: 18px;
  font-weight: bold;
  color: #2c2c2c;
  padding-top: 30px;
}

#colorDetail {
  font-size: 14px;
  color: grey;
}

.optionLabel {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: bold;
  color: grey;
}

.optionLabel input {
  height: 20px;
  width: 16px;
}

.optionLabel .colorOptionDiv {
  margin-left: 12px;
}

#colorPickerInput {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 20em;
}

#colorPickerInput #actualColorInput {
  height: 2.6em;
  width: 5.6em;
  border: none;
}

#colorPickerInput #colorHex {
  width: 4em;
  border: none;
}
</style>
