import { ActionTree, MutationTree, GetterTree } from 'vuex';
import { RootState } from 'store';

export const name = 'generator';

export const types = {
    UPDATELINK: 'UPDATELINK'
};

export interface State {
    url: string;
}

export const state = (): State => ({
    url: ''
});

export const getters: GetterTree<State, RootState> = {};

export const actions: ActionTree<State, RootState> = {
    updateLink({ commit }, url: string) {
        commit(types.UPDATELINK, url);
    },

    async generate({ commit }, url: string) {
        const ip = await this.$axios.$get(process.env.apiUrl)
        commit(types.UPDATELINK, 'updated');
    }
};

export const mutations: MutationTree<State> = {
    [types.UPDATELINK](state, url: string): void {
        state.url = url;
    }
};

