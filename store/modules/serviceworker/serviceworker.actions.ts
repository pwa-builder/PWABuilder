import { ActionTree, ActionContext } from 'vuex';
import { State, types } from '~/store/modules/serviceworker';
import { RootState } from 'store';

const apiUrl = `${process.env.apiUrl}/serviceworkers`;


export interface Actions<S, R> extends ActionTree<S, R> {
  downloadServiceWorker(context: ActionContext<S, R>, serviceWorkerId: number): Promise<void>;
  getCode(context: ActionContext<S, R>, serviceworker: number): Promise<void>;
  getServiceworkers(context: ActionContext<S, R>): Promise<void>;
  resetStates(context: ActionContext<S, R>): void;
}

export const actions: Actions<State, RootState> = {
  async downloadServiceWorker({ commit }, serviceworker: number): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      if (!serviceworker) {
        reject ('error.serviceworker_not_defined');
      }

      commit(types.UPDATE_SERVICEWORKER, serviceworker);

      try {
        const result = await this.$axios.$get(`${apiUrl}?ids=${serviceworker}`);
        commit(types.UPDATE_ARCHIVE, result.archive);
        resolve();
      } catch (e) {
        let errorMessage = e.response.data ? e.response.data.error : e.response.data || e.response.statusText;
        reject (errorMessage);
      }
    });
  },
  async getCode({ commit }, serviceworker: number): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      if (!serviceworker) {
        reject('error.serviceworker_not_defined');
      }
      try {
        const result = await this.$axios.$get(`${apiUrl}/previewcode?ids=${serviceworker}`);
        commit(types.UPDATE_SERVICEWORKERPREVIEW, result.serviceWorker);
        commit(types.UPDATE_WEBPREVIEW, result.webSite);
        commit(types.UPDATE_SERVICEWORKER, serviceworker)
        resolve();
      } catch (e) {
        let errorMessage = e.response.data ? e.response.data.error : e.response.data || e.response.statusText;
        reject (errorMessage);
      }
    });
  },
  async getServiceworkers({ commit }): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        await this.$axios.$get(`${apiUrl}/getServiceWorkersDescription`).then( data => {
          commit(types.UPDATE_SERVICEWORKERS, data.serviceworkers);
          resolve();
        });
      }
      catch (e) {
        let errorMessage = e.response.data ? e.response.data.error : e.response.data || e.response.statusText;
        reject (errorMessage);             
      }
    });
  },
  resetStates({ commit }): void {
    commit(types.RESET_STATES);
  }
};