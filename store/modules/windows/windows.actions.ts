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

                results.push(
                  ({
                    title: "Use Geolocation",
                    description: "A simple script that uses the Gelocation API to allow your app to ask for the users current location"
                  } as any),
                  ({
                    title: "Copy to Clipboard",
                    description: "A simple script that uses the Clipboard API to allow your app to copy text to the users clipboard"
                  } as any),
                  ({
                    title: "Install your PWA",
                    description: "A simple script that gives users a button to install your PWA directly from the browser"
                  } as any),
                  ({
                    title: "Web MIDI",
                    description: "A simple script that gives your app the ability to connect to a MIDI device such as a keyboard"
                  } as any),
                  ({
                    title: "People Picker Graph Component",
                    description: "The People Picker component enables the user to view, add, or remove people objects from a dynamic drop-down list as they type."
                  } as any),
                  ({
                    title: "Person Graph Component",
                    description: "The person component is used to display a person or contact by using their photo, name, and/or email address."
                  } as any),
                  ({
                    title: "Tasks Graph Component",
                    description: "The Tasks component enables the user to view, add, remove, complete, or edit tasks. It works with tasks in Microsoft Planner or Microsoft To-Do."
                  } as any)
                );

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

                /*for(let i = 0; i < results.length; i++) {
                  console.log('title includes graph', (results[i].title as string).toLowerCase().includes('graph'));
                  if ((results[i].title as string).toLowerCase().includes('graph')) {
                    results.splice(i, 1);
                  }
                }*/

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
    return new Promise<void>(async (resolve) => {

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