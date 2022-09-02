import { SignInResult } from "./signin-result";
import { SignInProvider } from "./signin-provider";

const JP = (...a) => { try { return JSON.parse(...a); } catch (_) { return undefined; } };

const any = AbortSignal.any ?? (S => {
  const  C = new AbortController(); for (const s of S) { if (s === undefined) continue; if (s.aborted) { C.abort(); break; } s.addEventListener('abort', () => C.abort(), { once: true, signal: C.signal }); }
  return C.signal; 
});

const event = (name, { source: on = globalThis, map = x => x, find = e => true, signal, default: { value: V, error: E } = {} } = {}) => new Promise(async (Y, N) => { const s = signal; const A = new AbortController();
  const a = async () => (V === undefined ?    N(E)        :            Y(await V)  ); if (s?.aborted) return (A.abort(), a()); s?.addEventListener?.('abort', a, {   once: true });
  const l = async e  => { e = map(e); if (!find(e)) return; A.abort(); Y(await e); };                                          on.addEventListener  (name,    l, { signal: any([ s, A.signal ]) });
});

const wait = {};


export class GoogleProvider implements SignInProvider {

    static readonly apiUrl = "https://apis.google.com/js/api:client.js";

    constructor(private clientId: string) {
    }

    signIn(): Promise<SignInResult> {
        return this.loadDependencies()
            .then(() => this.signInWithGoogleAuth2());
    }

    loadDependencies(): Promise<void> {
        return this.appendGoogleScript()
            .then(() => this.loadAuth());
    }

    private appendGoogleScript(): Promise<void> {
        const gapiLoad = window.gapi?.load;
        if (!gapiLoad) {
            return new Promise<void>((resolve, reject) => {
                const scriptEl = window.document.createElement("script");
                scriptEl.async = true;
                scriptEl.src = GoogleProvider.apiUrl;
                scriptEl.onload = () => resolve();
                scriptEl.onerror = (error) => reject({ message: "Error loading Google Platform library", error: error });
                window.document.head.appendChild(scriptEl);
            });
        }

        // GApi is already loaded.
        return Promise.resolve();
    }

    private loadAuth(): Promise<void> {
        if (!window.gapi || !window.gapi.load) {
            return Promise.reject("Couldn't find gapi.load");
        }

        // If we already have auth2, cool, we're done.
        if(window.gapi.auth2) {
            return Promise.resolve();
        }

        // Otherwise, pull in auth2.
        return new Promise<void>(resolve => window.gapi.load("auth2", () => resolve()));
    }

    private signInWithGoogleAuth2(): Promise<SignInResult> {
        if (!gapi?.auth2) {
            return Promise.reject("gapi.auth2 wasn't loaded");
        }

        const auth = gapi.auth2.init({
            client_id: this.clientId,
            cookie_policy: "single_host_origin"
        });

        // Speed through the process if we're already signed in.
        if (auth.isSignedIn.get()) {
            const user = auth.currentUser.get();
            return Promise.resolve(this.getSignInResultFromUser(user));
        }

        // Otherwise, kick off the OAuth flow.
        // (Use only a reduced response when people Block third-party cookies or use InPrivate browsing.)
        const I = auth.signIn();
        const Y = async signal => {
          const z = await event('message', { signal, map: e => JP(e.data), find: d => d?.params?.type == 'authResult' });
          const id_token = z.params.authResult.id_token;
          const j = await fetch(`https://oauth2.googleapis.com/tokeninfo?${new URLSearchParams({ id_token })}`).then(f => f.json());
          const x = {
            email: j.email,
            idToken: id_token,
            provider: 'Google',
            error: null,
            providerData: j
          };
          try       { return this.getSignInResultFromUser(await I); }
          catch (q) { return                                    x ; }
        };
        const N = async signal => {                       event('message', { signal, map: e => JP(e.data), find: d => d?.params?.type == 'idpError' }).then(_ => wait.twice = true);
          /**/                           let e; e = await event('error',   { signal }); console.warn('intercept', 'err', 0, wait, e);
          if (wait.twice) { wait.twice = false; e = await event('error',   { signal }); console.warn('intercept', 'err', 1, wait, e); }
          throw new Error('User cancelled the flow!');
        };
        let    E; const C = new AbortController();
        let    R; try { R = await Promise.race([ Y(C.signal), N(C.signal) ]); } catch (e) { E = e; }; C.abort(); if (E !== undefined) throw E;
        return R;
    }

    private getSignInResultFromUser(user: gapi.auth2.GoogleUser): SignInResult {
        const profile = user.getBasicProfile();
        const authResponse = user.getAuthResponse(true);
        return {
            email: profile.getEmail(),
            name: profile.getName(),
            imageUrl: profile.getImageUrl(),
            accessToken: authResponse?.id_token,
            accessTokenExpiration: new Date(authResponse.expires_at),
            provider: "Google",
            error: null,
            providerData: user
        };
    }
}
