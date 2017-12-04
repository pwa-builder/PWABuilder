import * as example from './modules/example';
import * as i18n from './modules/i18n';

// More info about store: https://vuex.vuejs.org/en/core-concepts.html
// Structure of the store:
    // Types: Types that represent the keys of the mutations to commit
    // State: The information of our app, we can get or update it.
    // Getters: Get complex information from state
    // Action: Sync or async operations that commit mutations
    // Mutations: Modify the state

export const modules = {
    [example.name]: example,
    [i18n.name]: i18n
};

export type RootState = typeof modules;