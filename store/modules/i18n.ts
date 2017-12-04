import { ActionTree, MutationTree, GetterTree } from 'vuex';
import { RootState } from 'store';

export const types = {
    SET: 'SET'
};

export interface State {
    locales: string[];
    locale: string
}

export const state = (): State => ({
    locales: ['en', 'es'],
    locale: 'en'
});

export const getters: GetterTree<State, RootState> = {};

export const actions: ActionTree<State, RootState> = {};

export const mutations: MutationTree<State> = {
    [types.SET](state, locale) {
        if (state.locales.indexOf(locale) !== -1) {
            state.locale = locale
        }
    }
};

