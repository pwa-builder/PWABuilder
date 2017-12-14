import { ActionTree, MutationTree, GetterTree, Action, ActionContext } from 'vuex';
import { RootState } from 'store';

const apiUrl = `${process.env.apiUrl}/serviceworkers`;

export const name = 'publish';

export const types = {
    UPDATE_STATUS: 'UPDATE_STATUS'
};

export interface State {
    status: boolean | null;
}

export const state = (): State => ({
    status: null
});

export const getters: GetterTree<State, RootState> = {};

export interface Actions<S, R> extends ActionTree<S, R> {
    resetAppData(context: ActionContext<S, R>): void;
    updateStatus(context: ActionContext<S, R>): void;
}

export const actions: Actions<State, RootState> = {

    resetAppData({ commit, dispatch }): void {
        dispatch('generator/reset', undefined, {root:true});
        dispatch('serviceworker/reset', undefined, {root:true});
    },

    updateStatus({ commit, rootState }): void {
        let status = !!rootState.generator['url'];
        commit(types.UPDATE_STATUS, status);
    }
};

export const mutations: MutationTree<State> = {
    [types.UPDATE_STATUS](state, status: boolean): void {
        state.status = status;
    }
};

