<template>
  <header>
    <div id="titleHeader">
      <img id="headerImage" />
      <h1>PWA Builder</h1>
    </div>

    <div id="buttonBlock">
      <button id="helpButton">Help</button>
    </div>
  </header>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'nuxt-class-component';

@Component({})
export default class extends Vue {

}
</script>

<style lang="scss" scoped>
@import '~assets/scss/base/variables';

header {
  align-items: center;
  color: $color-brand-primary;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 32px;
  padding-top: 32px;
  width: 100%;
}

#headerImage {
  background: $color-secondary;
  border-radius: 50%;
  height: 48px;
  margin-right: 15px;
  width: 48px;
}

#headerImageBlock {
  display: flex;
  justify-content: space-between;
  margin: 20px;
  z-index: 99;
}

#headerBlock {
  display: flex;
  justify-content: space-between;
  margin-left: 83px;
  margin-right: 83px;
  margin-top: 8rem;
}

#titleHeader {
  align-items: center;
  display: flex;
  margin-left: 68px;
}

#manifestButton {
  background: $color-complementary;
  border: none;
  border-radius: 5px;
  height: 47px;
  margin-right: 25px;
  width: 92px;
}

#manifestBlock {
  z-index: 99;
}

#helpButton {
  background: transparent;
  border: none;
  color: $color-secondary;
  font-weight: 600;
  height: 24px;
  margin-right: 68px;
}

h1 {
  display: none;
  font-size: 28px;
  font-weight: normal;
  margin: 0;
}
</style>