import { ActionTree, MutationTree, GetterTree, Action, ActionContext } from 'vuex';
import { RootState } from 'store';

const apiUrl = `${process.env.apiUrl}/serviceworkers`;

export const name = 'publish';

export const types = {
    RESET: 'RESET'
};

export interface State {
    error: string | null;
}

export const state = (): State => ({
    error: null
});

export const getters: GetterTree<State, RootState> = {};

export interface Actions<S, R> extends ActionTree<S, R> {
    resetAppData(context: ActionContext<S, R>): void;
}

export const actions: Actions<State, RootState> = {

    resetAppData({ commit, dispatch }): void {
        dispatch('generator/reset', undefined, {root:true});
        dispatch('serviceworker/reset', undefined, {root:true});
    }
};

export const mutations: MutationTree<State> = {
    [types.RESET](state, error: string): void {
        state.error = null;
    }
};

