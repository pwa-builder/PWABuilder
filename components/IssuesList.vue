<template>
<div class="issues_list">
    <section v-if="errors" class="l-generator-message" :id="id">
      <h5 class="l-generator-subtitle">{{title}} <span>({{total}} {{total === 1 ? $t("issues_list.item") : $t("issues_list.items") }})</span></h5>
      <article v-for="error in errors" :key="error.member">
        <h4 class="l-generator-subtitle l-generator-subtitle--complementary">{{error.member}}</h4>
        <ul class="issues_list-items">
          <li v-for="issue in error.issues" :key="issue.code">
            <p class="l-generator-issue">
              <strong class="l-generator-topic">
                {{codeFormat(issue.code)}}:
              </strong> 
              {{issue.description}}
              {{ $t("issues_list.platforms") }}:{{issue.platform}}.
            </p>
          </li>
        </ul>
      </article>
  </section>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Prop } from 'vue-property-decorator';
import Component from 'nuxt-class-component';

import { CodeError } from '~/store/modules/generator';

@Component()
export default class extends Vue {
  @Prop({ type: Array, default: () => [] })
  public errors: CodeError[];

  @Prop({ type: String, default: '' })
  public id: string;

  @Prop({ type: Number, default: 0 })
  public total: number;

  @Prop({ type: String, default: '' })
  public title: string;

  public codeFormat(code: string) {
      return code.charAt(0).toUpperCase() + code.slice(1).replace(/-/g, ' ');
  }
}
</script>

<style lang="scss" scoped>
@import "~assets/scss/base/variables";

.issues_list {
  font-family: sans-serif;

  &-items {
    list-style: none;
    margin-bottom: 2rem;
    padding: 0;
  }
}
</style>