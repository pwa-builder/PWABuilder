<template>
<section class="loading" v-if="active">
</section>
</template>

<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue-property-decorator';
import Component from 'nuxt-class-component'

@Component()
export default class extends Vue {
    @Prop({type: Boolean, default: false})
    public active: boolean;
}
</script>

<style lang="scss" scoped>
@import '~assets/scss/base/variables';

// From: https://projects.lukehaas.me/css-loaders/
.loading {
    animation: loading 1.4s infinite linear;
    background: linear-gradient(to right, $color-foreground-brighter 10%, rgba($color-foreground-brighter, 0) 42%);
    border-radius: 50%;
    font-size: 10px;
    height: 11em;
    margin: 50px auto;
    position: relative;
    text-indent: -9999em;
    transform: translateZ(0);
    width: 11em;

    &:before {
        background-color: $color-foreground-brighter;
        border-radius: 100% 0 0 0;
        content: '';
        height: 50%;
        left: 0;
        position: absolute;
        top: 0;
        width: 50%;
    }

    &:after {
        background-color: transparent;
        border-radius: 50%;
        bottom: 0;
        content: '';
        height: 75%;
        left: 0;
        margin: auto;
        position: absolute;
        right: 0;
        top: 0;
        width: 75%;
    }

    @keyframes loading {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
}

</style>