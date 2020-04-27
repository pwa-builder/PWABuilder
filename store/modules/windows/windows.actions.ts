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
          
                let results = [
                  {
                    title: "Install your PWA",
                    description: "A simple component that gives users a button to install your PWA directly from the browser"
                  },
                  {
                    title: "Sign In with Microsoft, Google, Facebook, Apple",
                    description: "Web component that lets your users sign-in using their Microsoft, Google, Facebook, or Apple account. Your app receives their email address, name, and profile picture."
                  },
                  {
                    title: "Immersive Reader",
                    description: "Immersive Reader mode makes it easier for users to read your content on the web"
                  },
                  {
                    title: "Web MIDI",
                    description: "A simple script that gives your app the ability to connect to a MIDI device such as a keyboard"
                  },
                  {
                    title: "People Picker Graph Component",
                    description: "The People Picker component enables the user to view, add, or remove people objects from a dynamic drop-down list as they type."
                  },
                  {
                    title: "Person Graph Component",
                    description: "The person component is used to display a person or contact by using their photo, name, and/or email address."
                  },
                  {
                    title: "Tasks Graph Component",
                    description: "The Tasks component enables the user to view, add, remove, complete, or edit tasks. It works with tasks in Microsoft Planner or Microsoft To-Do."
                  },
                  /*({
                    title: "Samsung Smart View",
                    description: "A Smart View enabled app provides separate views which are connected and running on different devices."
                  } as any),
                  ({
                    title: "Samsung Pay",
                    description: "Samsung Pay can be used for mobile web payments too, to make secure purchases across the web in eligible countries. No more clunky forms and input fields!"
                  } as any),
                  ({
                    title: "Get Channels from Microsoft Teams",
                    description: "This component lets you get the channels for a signed in user"
                  } as any),
                  ({
                    title: "Create a new Channel in Microsoft Teams",
                    description: "Allow a user to easily create a new channel in Teams."
                  } as any),
                  ({
                    title: "Get teams from Microsoft Teams",
                    description: "Get the teams a signed in user is a member of in Teams"
                  } as any),*/
                ];

                if (res.Sources) {
                  for (let s = 0; s < res.Sources.length; s++) {
                    let source = res.Sources[s];
                    let file = source.Parsed.File;
                    for (let f = 0; f < source.Parsed.Functions.length; f++) {
                      let fn = source.Parsed.Functions[f];
                      let newItem = fromItem(fn, file, source);

                      if (newItem.title === "Microsoft Graph Authentication") {
                        newItem.title = "Login Graph Component";
                      }
                      else if (newItem.title === "Microsoft Graph Contacts API") {
                        newItem.title = "People Graph Component";
                      }
                      else if (newItem.title === "Microsoft Graph Calendar API") {
                        newItem.title = "Agenda Graph Component";
                      }
                      else if (newItem.title === "Microsoft Graph Activity API") {
                        newItem.title = "Activity Graph Component";
                      }
          
                      results.push(newItem as any);
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