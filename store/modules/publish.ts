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
    UPDATE_ARCHIVELINK: 'UPDATE_ARCHIVELINK'
};

export interface State {
    status: boolean | null;
    error: string | null;
    archiveLink: string | null;
}

export const state = (): State => ({
    status: null,
    error: null,
    archiveLink: null
});

export const getters: GetterTree<State, RootState> = {};

export interface Actions<S, R> extends ActionTree<S, R> {
    resetAppData(context: ActionContext<S, R>): void;
    updateStatus(context: ActionContext<S, R>): void;
    build(context: ActionContext<S, R>, platform: string): void;
}

export const actions: Actions<State, RootState> = {

    resetAppData({ commit, dispatch }): void {
        dispatch('generator/reset', undefined, {root:true});
        dispatch('serviceworker/reset', undefined, {root:true});
    },

    updateStatus({ commit, rootState }): void {
        let status = !!rootState.generator['url'];
        commit(types.UPDATE_STATUS, status);
    },

    async build({ commit, rootState }, platform: string): Promise<{}> {
        return new Promise(async (resolve, reject) => {
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
            //TODO investigate selectedServiceWorker
            const selectedServiceWorker = 1;
            const result = await this.$axios.$post(`${apiUrl}/${rootState.generator['manifestId']}/build?ids=${selectedServiceWorker}`, options);
              commit(types.UPDATE_ARCHIVELINK, result.archive);
            resolve();
          } catch (e) {
              commit(types.UPDATE_ERROR, e.response.data.error || e.response.data || e.response.statusText);
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
    [types.UPDATE_ARCHIVELINK](state, url: string): void {
        state.archiveLink = url;
    }
};

