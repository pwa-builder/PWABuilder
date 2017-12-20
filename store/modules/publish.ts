import { ActionTree, MutationTree, GetterTree, Action, ActionContext } from 'vuex';
import { RootState } from 'store';

const apiUrl = `${process.env.apiUrl}/manifests`;
const platforms = {
    web: 'web',
    windows10: 'windows10',
    windows: 'windows',
    ios: 'ios',
    android: 'android',
    all: 'All'
}

export const name = 'publish';

export const types = {
    UPDATE_STATUS: 'UPDATE_STATUS',
    UPDATE_ERROR: 'UPDATE_ERROR',
    UPDATE_ARCHIVELINK: 'UPDATE_ARCHIVELINK',
    UPDATE_APPXLINK: 'UPDATE_APPXLINK',
    UPDATE_APPXERROR: 'UPDATE_APPXERROR'
};

export interface State {
    status: boolean | null;
    error: string | null;
    appxError: string | null;
    archiveLink: string | null;
    appXLink: string | null;
}

export interface appxParams {
    publisher: string | null;
    publisher_id: string | null;
    package: string | null;
    version: string | null;
}

export const state = (): State => ({
    status: null,
    error: null,
    appxError: null,
    archiveLink: null,
    appXLink: null
});

export const getters: GetterTree<State, RootState> = {};

export interface Actions<S, R> extends ActionTree<S, R> {
    resetAppData(context: ActionContext<S, R>): void;
    updateStatus(context: ActionContext<S, R>): void;
    build(context: ActionContext<S, R>, platform: string): Promise<void>;
    buildAppx(context: ActionContext<S, R>, params: appxParams): Promise<void>;
}

export const actions: Actions<State, RootState> = {

    resetAppData({ commit, dispatch }): void {
        dispatch('generator/resetStates', undefined, {root:true});
        dispatch('serviceworker/resetStates', undefined, {root:true});
    },

    updateStatus({ commit, rootState }): void {
        let status = !!rootState.generator['url'];
        commit(types.UPDATE_STATUS, status);
    },

    async build({ commit, rootState }, platform: string): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            const manifestId = rootState.generator.manifestId;
            const serviceworker = rootState.serviceworker.serviceworker;

            if (!manifestId || !serviceworker) {
                commit(types.UPDATE_ERROR, 'Manifest is required');
                resolve();
            }

            if (!platform) {
                commit(types.UPDATE_ERROR, 'Platform is required');
                resolve();
            }

            let platformsList: string[] = [];
            if (platform === platforms.all) {
                platformsList = [ platforms.web, platforms.windows10, platforms.windows, platforms.ios, platforms.android ];
            } else {
                platformsList = [ platform ];
            }

            try {
                const options = JSON.stringify({ platforms: platformsList, dirSuffix: platform });
                const result = await this.$axios.$post(`${apiUrl}/${manifestId}/build?ids=${serviceworker}`, options);
                commit(types.UPDATE_ARCHIVELINK, result.archive);
                resolve();
            } catch (e) {
                let errorMessage = e.response.data ? e.response.data.error : e.response.data || e.response.statusText;
                commit(types.UPDATE_ERROR, errorMessage);
                reject(e);
            }
        });
    },

    async buildAppx({ commit, rootState }, params: appxParams): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            const manifestId = rootState.generator.manifestId;
            //reset errors
            commit(types.UPDATE_APPXERROR, '');

            if (!manifestId) {
                commit(types.UPDATE_APPXERROR, 'Manifest is required');
                resolve();
            }

            if (!params.publisher || !params.publisher_id || !params.package || !params.version) {
                commit(types.UPDATE_APPXERROR, 'All fields are required.');
                resolve();
            }

            try {
                const options = JSON.stringify({ name: params.publisher, publisher: params.publisher_id, package: params.package, version: params.version });
                const result = await this.$axios.$post(`${apiUrl}/${manifestId}/appx`, options);
                commit(types.UPDATE_APPXLINK, result.archive);
                resolve();
            } catch (e) {
                // Check for common/known errors and simplify message
                let errorMessage = '';
                let error = e.response.data ? e.response.data.error.toString() : e.response.toString();

                if (error.includes(`@Publisher\nPackage creation failed`)) {
                  errorMessage = 'Invalid Publisher Identity.';
                } else if (error.includes(`@Version\nPackage creation failed.`)) {
                  errorMessage = 'Invalid Version Number.';
                } else {
                    errorMessage = 'Package building error.';
                }
                commit(types.UPDATE_APPXERROR, errorMessage);
                reject(e);
            }
        });
    }
};

export const mutations: MutationTree<State> = {
    [types.UPDATE_STATUS](state, status: boolean): void {
        state.status = status;
    },
    [types.UPDATE_ERROR](state, error: string): void {
        state.error = error;
    },
    [types.UPDATE_APPXERROR](state, error: string): void {
        state.appxError = error;
    },
    [types.UPDATE_ARCHIVELINK](state, url: string): void {
        state.archiveLink = url;
    },
    [types.UPDATE_APPXLINK](state, url: string): void {
        state.appXLink = url;
    }
};

