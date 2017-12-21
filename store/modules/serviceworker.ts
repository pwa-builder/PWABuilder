import { ActionTree, MutationTree, GetterTree, Action, ActionContext } from 'vuex';
import { RootState } from 'store';

const apiUrl = `${process.env.apiUrl}/serviceworkers`;

export const name = 'serviceworker';

export const types = {
    UPDATE_ARCHIVE: 'UPDATE_ARCHIVE',
    UPDATE_SERVICEWORKER: 'UPDATE_SERVICEWORKER',
    UPDATE_SERVICEWORKERPREVIEW: 'UPDATE_SERVICEWORKERPREVIEW',
    UPDATE_WEBPREVIEW: 'UPDATE_WEBPREVIEW',
    UPDATE_ERROR: 'UPDATE_ERROR',
    RESET_STATES: 'RESET_STATES'
};

export interface State {
    archive: string | null;
    serviceworker: number;
    serviceworkerPreview: string | null;
    webPreview: string | null;
    error: string | null;
}

export const state = (): State => ({
    archive: null,
    serviceworker: 1,
    serviceworkerPreview: null,
    webPreview: null,
    error: null
});

export const getters: GetterTree<State, RootState> = {};

export interface Actions<S, R> extends ActionTree<S, R> {
    downloadServiceWorker(context: ActionContext<S, R>, serviceWorkerId: number): Promise<void>;
    getCode(context: ActionContext<S, R>, serviceworker: number): Promise<void>;
    resetStates(context: ActionContext<S, R>): void;
}

export const actions: Actions<State, RootState> = {

    async downloadServiceWorker({ commit }, serviceworker: number): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            if (!serviceworker) {
                commit(types.UPDATE_ERROR, 'Serviceworker is not defined');
                resolve();
            }

            commit(types.UPDATE_SERVICEWORKER, serviceworker);

            try {
                const result = await this.$axios.$get(`${apiUrl}?ids=${serviceworker}`);
                commit(types.UPDATE_ARCHIVE, result.archive);
                resolve();
            } catch (e) {
              let errorMessage = e.response.data ? e.response.data.error : e.response.data || e.response.statusText;
              commit(types.UPDATE_ERROR, errorMessage);
              reject(e);
            }
        });
    },
    async getCode({ commit }, serviceworker: number): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            if (!serviceworker) {
                commit(types.UPDATE_ERROR, 'Serviceworker is not defined');
                resolve();
            }
            try {
                const result = await this.$axios.$get(`${apiUrl}/previewcode?ids=${serviceworker}`);
                commit(types.UPDATE_SERVICEWORKERPREVIEW, result.serviceWorker);
                commit(types.UPDATE_WEBPREVIEW, result.webSite);
                resolve();
            } catch (e) {
                let errorMessage = e.response.data ? e.response.data.error : e.response.data || e.response.statusText;
                commit(types.UPDATE_ERROR, errorMessage);
                reject(e);
            }
        });
    },
    resetStates({ commit }): void {
        commit(types.RESET_STATES);
    }
};

export const mutations: MutationTree<State> = {
    [types.UPDATE_ARCHIVE](state, archive: string): void {
        state.archive = archive;
    },
    [types.UPDATE_SERVICEWORKER](state, serviceworker: number): void {
        state.serviceworker = serviceworker;
    },
    [types.UPDATE_ERROR](state, error: string): void {
        state.error = error;
    },
    [types.UPDATE_SERVICEWORKERPREVIEW](state, code: string): void {
        state.serviceworkerPreview = code;
    },
    [types.UPDATE_WEBPREVIEW](state, code: string): void {
        state.webPreview = code;
    },
    [types.RESET_STATES](state): void {
        state.archive= null;
        state.serviceworker= 1;
        state.error= null;
    }
};

