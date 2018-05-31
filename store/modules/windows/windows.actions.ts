import { ActionTree, ActionContext } from 'vuex';
import { State, Parm, Sample, types } from '~/store/modules/windows';
import { RootState } from 'store';

const apiUrl = `${process.env.apiUrl2}/api/winrt`;

export interface Actions<S, R> extends ActionTree<S, R> {
  getSamples(context: ActionContext<S, R>): Promise<void>;
  selectSample(context: ActionContext<S, R>, sample: Sample): Promise<void>;
}

export const actions: Actions<State, RootState> = {

  async getSamples({ commit }): Promise<void> {
      return new Promise<void>(async (resolve, reject) => {
          try {
              const data = await this.$axios.$get(apiUrl).then(res => {
                let fromItem = function(func, file, source) {
                  let id = file.Id + '.' + func.Name; //file.id is undefined
          
                  let parms = Array<Parm>();

                  for (let i = 0; i < func.Parameters.length; i++) {
                    let parm = func.Parameters[i];
                    
                    let newParm: Parm = {
                      name: parm.Name,
                      id: id + '.' + parm.Name,
                      default: parm.Default,
                      type: parm.Type,
                      description: parm.Description
                    };
          
                    parms.push(newParm);
                  }

                  let result: Sample = {
                    title: func.Name || file.Name || source.Name,
                    description: func.Description || file.Description || source.Description,
                    image: func.Image || file.Image || source.Image || './assets/images/logo_small.png',
                    id: file.Id + '.' + func.Name,
                    parms: parms,
                    url: source.Url,
                    hash: source.Hash,
                    included: false,
                    snippet: func.Snippet.replace(/(\/\*[\s\S]*?\*\/|([^:/]|^)\/\/.*$)/g, '').trim(),
                    source: null
                  };
                  
                  return result;
                };
          
                let results = new Array<Sample>();

                if (res.Sources) {
                  for (let s = 0; s < res.Sources.length; s++) {
                    let source = res.Sources[s];
                    let file = source.Parsed.File;
                    for (let f = 0; f < source.Parsed.Functions.length; f++) {
                      let fn = source.Parsed.Functions[f];
                      let newItem = fromItem(fn, file, source);
          
                      results.push(newItem);
                    }
                  }
                }

                return results;
              });

              commit(types.UPDATE_SAMPLES, data);
              resolve();

          } catch (e) {
              let errorMessage = e.response.data ? e.response.data.error : e.response.data || e.response.statusText;
              reject (errorMessage);
          }
      });
  },

  async selectSample({ commit }, sample: Sample): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {

      await this.$axios.$get(sample.url).then(res => {
        let source = res.replace(/(\/\*[\s\S]*?\*\/|([^:/]|^)\/\/.*$)/g, '').trim();

        commit(types.UPDATE_SAMPLE, {sample: sample, source: source});
        resolve();
      });
    });
  },

  resetStates({ commit }): void {
      commit(types.RESET_STATES);
  }
};