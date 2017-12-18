import * as root from './root';
import * as generator from './modules/generator';
import * as serviceworker from './modules/serviceworker';
import * as publish from './modules/publish';
import * as i18n from './modules/i18n';
import { ActionTree } from 'vuex';

// More info about store: https://vuex.vuejs.org/en/core-concepts.html
// Structure of the store:
    // Types: Types that represent the keys of the mutations to commit
    // State: The information of our app, we can get or update it.
    // Getters: Get complex information from state
    // Action: Sync or async operations that commit mutations
    // Mutations: Modify the state

export const modules = {
    [generator.name]: generator,
    [serviceworker.name]: serviceworker,
    [publish.name]: publish,
    [i18n.name]: i18n
};

interface ModulesStates {
    generator: generator.State;
    serviceworker: serviceworker.State;
    publish: publish.State;
    i18n: i18n.State;
}

export type RootState = root.State & ModulesStates;

export const state = root.state;
export const getters = root.getters;
export const actions = root.actions;
export const mutations = root.mutations;