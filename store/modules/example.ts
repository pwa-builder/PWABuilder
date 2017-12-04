import { ActionTree, MutationTree, GetterTree } from 'vuex';
import { RootState } from 'store';

export const types = {
    SELECT: 'SELECT'
};

export interface State {
    selected: number;
}

export const state = (): State => ({
    selected: 1
});

export const getters: GetterTree<State, RootState> = {
    complexSelected: (state: State): number => {
        return state.selected + 100;
    }
};

export const actions: ActionTree<State, RootState> = {
    select({ commit, state, rootState }, id: number) {
        commit(types.SELECT, id);
    }
};

export const mutations: MutationTree<State> = {
    [types.SELECT](state, id: number): void {
        state.selected = id;
    }
};

