import { ActionTree, MutationTree, GetterTree, ActionContext } from 'vuex';
import { RootState } from 'store';

const apiUrl = `${process.env.apiUrl}/manifests`;
const platforms = {
    web: 'web',
    windows10: 'windows10',
    windows: 'windows',
    ios: 'ios',
    android: 'android',
    all: 'All'
};

export const name = 'publish';

export const types = {
    UPDATE_STATUS: 'UPDATE_STATUS',
    UPDATE_ARCHIVELINK: 'UPDATE_ARCHIVELINK',
    UPDATE_APPXLINK: 'UPDATE_APPXLINK'
};

export interface State {
    status: boolean | null;
    archiveLink: string | null;
    appXLink: string | null;
}

export interface AppxParams {
    publisher: string | null;
    publisher_id: string | null;
    package: string | null;
    version: string | null;
}

export const state = (): State => ({
    status: null,
    archiveLink: null,
    appXLink: null
});

export const getters: GetterTree<State, RootState> = {};

export interface Actions<S, R> extends ActionTree<S, R> {
    resetAppData(context: ActionContext<S, R>): void;
    updateStatus(context: ActionContext<S, R>): void;
    build(context: ActionContext<S, R>, params: { platform: string, options?: string[]}): Promise<void>;
    buildAppx(context: ActionContext<S, R>, params: AppxParams): Promise<void>;
}

export const actions: Actions<State, RootState> = {

    resetAppData({ dispatch }): void {
        dispatch('generator/resetStates', undefined, { root: true });
        dispatch('serviceworker/resetStates', undefined, { root: true });
    },

    updateStatus({ commit, rootState }): void {
        let status = !!rootState.generator['url'];
        commit(types.UPDATE_STATUS, status);
    },

    async build({ commit, rootState }, params: { platform: string, options?: string[] }): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            const manifestId = rootState.generator.manifestId;
            const serviceworker = rootState.serviceworker.serviceworker;

            if (!manifestId || !serviceworker) {
                reject('error.manifest_required');
            }

            if (!params || !params.platform) {
                reject('error.platform_required');
            }

            let platformsList: string[] = [];
            if (params.platform === platforms.all) {
                platformsList = [ platforms.web, platforms.windows10, platforms.windows, platforms.ios, platforms.android ];
            } else {
                platformsList = [ params.platform ];
            }

            try {
                const options = { platforms: platformsList, dirSuffix: params.platform, parameters: params.options };
                console.log(options);
                const result = await this.$axios.$post(`${apiUrl}/${manifestId}/build?ids=${serviceworker}`, options);
                commit(types.UPDATE_ARCHIVELINK, result.archive);
                resolve();
            } catch (e) {
              console.log(e);
                let errorMessage = e.response.data ? e.response.data.error : e.response.data || e.response.statusText;
                reject(errorMessage);
            }
        });
    },

    async buildAppx({ commit, rootState }, params: AppxParams): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            const manifestId = rootState.generator.manifestId;

            if (!manifestId) {
                reject('error.manifest_required');
            }

            if (!params.publisher || !params.publisher_id || !params.package || !params.version) {
                reject('error.fields_required');
            }

            try {
                const options = { name: params.publisher, publisher: params.publisher_id, package: params.package, version: params.version };
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
                reject(errorMessage);
            }
        });
    }
};

export const mutations: MutationTree<State> = {
    [types.UPDATE_STATUS](state, status: boolean): void {
        state.status = status;
    },
    [types.UPDATE_ARCHIVELINK](state, url: string): void {
        state.archiveLink = url;
    },
    [types.UPDATE_APPXLINK](state, url: string): void {
        state.appXLink = url;
    }
};

