<template>
<section>
    <div class="l-generator-field">
        <label class="l-generator-label">{{ $t("custom_members.name") }}
        </label>
        <input class="l-generator-input" v-model="name" type="text">
    </div>
    <div class="l-generator-field">
        <label class="l-generator-label">{{ $t("custom_members.value") }}
        </label>
        <input class="l-generator-input" v-model="value" type="text">
    </div>

    <div class="button-holder">
        <button class="pwa-button pwa-button--text pwa-button--right" @click="onClickAdd()" data-flare='{"category": "Manifest", "action": "Add Member", "label": "CustomMember", "value": { "page": "/manifest/add-member" }}'>
            {{ $t("custom_members.add") }}
        </button>
    </div>

    <div class="l-generator-field l-generator-field--padded"></div>

    <p class="l-generator-error" v-if="error">
        {{error}}
    </p>

    <div class="pure-g l-generator-table" v-if="members$ && members$.length > 0">
        <div class="pure-u-1" v-for="member in members$" :key="member.name">
            <div class="pure-u-2-5 l-generator-tablec">
                {{member.name}}
            </div>
            <div class="pure-u-3-5 l-generator-tablec l-generator-tablec--right">
                <span class="l-generator-close" @click="onClickRemove(member.name)">
                    <i aria-hidden="true">✕</i>
                </span>
            </div>
        </div>
    </div>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'nuxt-class-component';
import { Action, State, namespace } from 'vuex-class';

import * as generator from '~/store/modules/generator';

const GeneratorState = namespace(generator.name, State);
const GeneratorActions = namespace(generator.name, Action);

@Component()
export default class extends Vue {
    public members$: generator.CustomMember[] | null = null;
    public name: string | null = null;
    public value: string | null = null;
    public error: string | null = null;

    @GeneratorState members: generator.CustomMember[];

    @GeneratorActions addCustomMember;
    @GeneratorActions removeCustomMember;

    public created(): void {
        this.members$ = [...this.members ];
    }

    public onClickAdd(): void {
        try {
            this.addCustomMember({
                name: this.name,
                value: this.value
            } as generator.CustomMember);

            this.name = null;
            this.value = null;

            this.members$ = [...this.members ];
        } catch (e) {
            this.error = e;
        }
    }

    public onClickRemove(name: string): void {
        this.removeCustomMember(name);
    }
}
</script>
