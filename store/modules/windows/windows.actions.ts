import { ActionTree, ActionContext } from 'vuex';
import { State, Parm, Snippet, types } from '~/store/modules/windows';
import { RootState } from 'store';

const apiUrl = `${process.env.apiUrl2}/api/winrt`;


export interface Actions<S, R> extends ActionTree<S, R> {
  getSnippets(context: ActionContext<S, R>): Promise<void>;
}

export const actions: Actions<State, RootState> = {

  async getSnippets({ commit }): Promise<void> {
      return new Promise<void>(async (resolve, reject) => {
          try {
              const data = await this.$axios.$get(apiUrl).then(res => {
                let fromItem = function(func, file, source) {
                  let id = file.Id + '.' + func.Name; //file.id is undefined
          
                  let parms = Array<any>();
          
                  for (let i = 0; i < func.Parameters.length; i++) {
                    let parm = func.Parameters[i];
                    
                    const newParm: Parm = {
                      name: parm.Name,
                      id: id + '.' + parm.Name,
                      default: parm.Default,
                      type: parm.Type,
                      description: parm.Description
                    };
          
                    parms.push(newParm);
                  }
                  
                  const result: Snippet = {
                    title: func.Name || file.Name || source.Name,
                    description: func.Description || file.Description || source.Description,
                    image: func.Image || file.Image || source.Image || './assets/images/logo_small.png',
                    id: file.Id + '.' + func.Name,
                    parms: parms,
                    url: source.Url,
                    hash: source.Hash,
                    included: false,
                    snippet: func.Snippet
                  };

                  return result;
                };
          
                let results = new Array<Snippet>();

                if (res.Sources) {
                  for (let s = 0; s < res.Sources.length; s++) {
                    const source = res.Sources[s];
                    const file = source.Parsed.File;
                    for (let f = 0; f < source.Parsed.Functions.length; f++) {
                      const fn = source.Parsed.Functions[f];
                      const newItem = fromItem(fn, file, source);
          
                      results.push(newItem);
                    }
                  }
                }
              });

              commit(types.UPDATE_SNIPPETS, data);
              resolve();
          } catch (e) {
              let errorMessage = e.response.data ? e.response.data.error : e.response.data || e.response.statusText;
              reject (errorMessage);
          }
      });
  },

  resetStates({ commit }): void {
      commit(types.RESET_STATES);
  }
};