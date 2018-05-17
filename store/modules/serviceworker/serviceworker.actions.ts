import { ActionTree, ActionContext } from 'vuex';
import { State, types, ServiceWorker } from '~/store/modules/serviceworker';
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
                const result = await this.$axios.$get(`${apiUrl}/getAll`).then( data => {
                    let aux = new Array<ServiceWorker>();

                    aux.push(<ServiceWorker>{id: 1, title: 'SW 1', description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit nec, mattis conubia fusce magnis molestie duis non sodales consequat, etiam nibh phasellus nisi turpis ac semper.'});
                    aux.push(<ServiceWorker>{id: 2, title: 'SW 2', description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit nec, mattis conubia fusce magnis molestie duis non sodales consequat, etiam nibh phasellus nisi turpis ac semper.'});
                    aux.push(<ServiceWorker>{id: 3, title: 'SW 3', description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit nec, mattis conubia fusce magnis molestie duis non sodales consequat, etiam nibh phasellus nisi turpis ac semper.'});
                    aux.push(<ServiceWorker>{id: 4, title: 'SW 4', description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit nec, mattis conubia fusce magnis molestie duis non sodales consequat, etiam nibh phasellus nisi turpis ac semper.'});

                    return aux;
                });

                commit(types.UPDATE_SERVICEWORKERS, result);

                resolve();
            }
            catch {              
            }
        });
    },
    resetStates({ commit }): void {
        commit(types.RESET_STATES);
    }
};