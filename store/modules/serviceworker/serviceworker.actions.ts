import { ActionTree, ActionContext } from 'vuex';
import { State, types } from '~/store/modules/serviceworker';
import { RootState } from 'store';

// const apiUrl = `${process.env.apiUrl}/serviceworkers`;
const apiUrl = 'https://pwabuilder-sw-server.azurewebsites.net';


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
        reject('error.serviceworker_not_defined');
      }

      commit(types.UPDATE_SERVICEWORKER, serviceworker);

      try {
        const response = await fetch(`${apiUrl}/download?id=${serviceworker}`, {
          headers: {
            'Content-Type': 'application/zip'
          },
          method: "GET"
        });
        const blob = await response.blob();

        if ('showSaveFilePicker' in window) {
          const options = {
            types: [
              {
                description: 'Zip File',
                accept: {
                  'application/zip': ['.zip'],
                },
              },
            ],
          };
          const handle = await window.showSaveFilePicker(options);

          if (handle && blob) {
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
          }
        }
        else {
          if (blob) {
            const url = window.URL.createObjectURL(blob);
            window.location.assign(url);
          }
        }

        resolve();
      }
      catch (e) {
        let errorMessage = e.response.data ? e.response.data.error : e.response.data || e.response.statusText;
        reject(errorMessage);
      }
    });
  },
  async getCode({ commit }, serviceworker: number): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      if (!serviceworker) {
        reject('error.serviceworker_not_defined');
      }
      try {
        const response = await fetch(`${apiUrl}/codePreview?id=${serviceworker}`, {
          headers: {
            'Content-Type': 'application/json'
          },
          method: "GET"
        });
        const result = await response.json();

        if (result) {
          commit(types.UPDATE_SERVICEWORKERPREVIEW, result.serviceWorker);
          commit(types.UPDATE_WEBPREVIEW, result.webSite);
          commit(types.UPDATE_SERVICEWORKER, serviceworker);

          resolve();
        }
      } catch (e) {
        let errorMessage = e.response.data ? e.response.data.error : e.response.data || e.response.statusText;
        reject(errorMessage);
      }
    });
  },
  async getServiceworkers({ commit }): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const response = await fetch(`${apiUrl}/listing`, {
          headers: {
            'Content-Type': 'application/json'
          },
          method: "GET"
        });
        const swData = await response.json();

        if (swData) {
          const data = JSON.parse(swData);
          commit(types.UPDATE_SERVICEWORKERS, data.serviceworkers);
          resolve();
        }
      }
      catch (e) {
        let errorMessage = e.response.data ? e.response.data.error : e.response.data || e.response.statusText;
        reject(errorMessage);
      }
    });
  },
  resetStates({ commit }): void {
    commit(types.RESET_STATES);
  }
};