import { ActionTree, MutationTree, GetterTree, Action, ActionContext } from 'vuex';
import { RootState } from 'store';

export const name = 'serviceworker';

export const types = {
    UPDATE_ARCHIVE: 'UPDATE_ARCHIVE',
    UPDATE_ERROR: 'UPDATE_ERROR'
};

export interface State {
    archive: string | null;
    error: string | null;
}

export const state = (): State => ({
    archive: null,
    error: null
});

export const getters: GetterTree<State, RootState> = {};

export interface Actions<S, R> extends ActionTree<S, R> {
    downloadServiceWorker(context: ActionContext<S, R>, serviceWorkerId: number): void;
}

export const actions: Actions<State, RootState> = {

    async downloadServiceWorker({ commit }, serviceWorkerId: number): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            if (!serviceWorkerId) {
                commit(types.UPDATE_ERROR, 'Serviceworker is not defined');
                resolve();
            }

            try {
                const apiUrl = `${process.env.apiUrl}/serviceworkers?ids=${serviceWorkerId}`;
                const result = await this.$axios.$get(apiUrl);
                commit(types.UPDATE_ARCHIVE, result.archive);
                window.location.href = result.archive;
                resolve();
            } catch (e) {
                commit(types.UPDATE_ERROR, e.response.data.error || e.response.data || e.response.statusText);
            }
        });
    }
};

export const mutations: MutationTree<State> = {
    [types.UPDATE_ARCHIVE](state, archive: string): void {
        state.archive = archive;
    },
    [types.UPDATE_ERROR](state, error: string): void {
        state.error = error;
    }
};

