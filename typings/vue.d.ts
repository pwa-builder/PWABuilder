// Make sure to import 'vue' before declaring augmented types
import Vue from 'vue'
import VueRouter from 'vue-router';

// Specify a file with the types you want to augment

declare module 'vue-i18n/types/index' {
  // Declare augmentation for Vue-i18n
  interface IVueI18n {
    path: (path: string) => string;
  }
}

declare module 'vue/types/vue' {
  // Declare augmentation for Vue
  interface Vue {
    $awa: any;
    $ga: any;
    $router: VueRouter;
  }
}



