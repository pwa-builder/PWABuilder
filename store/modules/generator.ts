import { ActionTree, MutationTree, GetterTree, Action, ActionContext } from 'vuex';
import { RootState } from 'store';
import colorConverter from '~/utils/color-converter';

const apiUrl = `${process.env.apiUrl}/manifests`;

const isValidUrl = (siteUrl: string): boolean => {
    return /^(http|https):\/\/[^ "]+$/.test(siteUrl);
};

export const name = 'generator';

export const types = {
    SET_LANGUAGES: 'SET_LANGUAGES',
    SET_DISPLAYS: 'SET_DISPLAYS',
    SET_ORIENTATIONS: 'SET_ORIENTATIONS',
    UPDATE_LINK: 'UPDATE_LINK',
    UPDATE_WITH_MANIFEST: 'UPDATE_WITH_MANIFEST',
    OVERWRITE_MANIFEST: 'OVERRIDE_MANIFEST',
    SET_DEFAULTS_MANIFEST: 'SET_DEFAULTS_MANIFEST',
    UPDATE_ICONS: 'UPDATE_ICONS',
    ADD_ICON: 'ADD_ICON',
    ADD_ASSETS: 'ADD_ASSETS',
    RESET_STATES: 'RESET_STATES',
    ADD_RELATED_APPLICATION: 'ADD_RELATED_APPLICATION',
    REMOVE_RELATED_APPLICATION: 'REMOVE_RELATED_APPLICATION',
    UPDATE_PREFER_RELATED_APPLICATION: 'UPDATE_PREFER_RELATED_APPLICATION',
    ADD_CUSTOM_MEMBER: 'ADD_CUSTOM_MEMBER',
    REMOVE_CUSTOM_MEMBER: 'REMOVE_CUSTOM_MEMBER',
    UPDATE_COLOR: 'UPDATE_COLOR'
};

export interface Manifest {
    background_color: string | null;
    description: string | null;
    dir: string | null;
    display: string;
    lang: string | null;
    name: string | null;
    orientation: string | null;
    prefer_related_applications: boolean;
    related_applications: RelatedApplication[];
    scope: string | null;
    short_name: string | null;
    start_url: string | null;
    theme_color: string | null;
}

export interface StaticContent {
    code: string;
    name: string;
}

export interface Icon {
    src: string;
    generated?: boolean;
    sizes: string;
}

export interface Asset {
    filename: string;
    data: Blob;
}

export interface RelatedApplication {
    platform: string;
    url: string;
    id: string;
}

export interface CustomMember {
    name: string;
    value: string;
}

export interface ColorOptions {
    colorOption: string;
    color: string;
}

export interface State {
    url: string | null;
    manifest: Manifest | null;
    manifestId: string | null;
    siteServiceWorkers: any;
    icons: Icon[];
    members: CustomMember[];
    suggestions: string[] | null;
    warnings: string[] | null;
    errors: string[] | null;
    assets: Asset[] | null;
}

export const state = (): State => ({
    url: null,
    manifest: null,
    manifestId: null,
    siteServiceWorkers: null,
    icons: [],
    members: [],
    suggestions: null,
    warnings: null,
    errors: null,
    assets: null
});

export const helpers = {
    MEMBER_PREFIX: 'mjs_',
    COLOR_OPTIONS: {
        none: 'none',
        transparent: 'transparent',
        pick: 'pick'
    },
    getImageIconSize(aSrc: string): Promise<{ width: number, height: number }> {
        return new Promise(resolve => {
            if (typeof document === 'undefined') {
                resolve({ width: 0, height: 0 });
            }

            let tmpImg = document.createElement('img');

            tmpImg.onload = () => resolve({
                width: tmpImg.width,
                height: tmpImg.height
            });

            tmpImg.src = aSrc;
        });
    },

    prepareIconsUrls(icons: Icon[], baseUrl: string) {
        return icons.map(icon => {
            if (!icon.src.includes('http')) {
                icon.src = baseUrl + icon.src;
            }

            return icon;
        });
    },

    async getImageDataURI(file: File): Promise<string> {
        return new Promise<string>(resolve => {
            const reader = new FileReader();

            reader.onload = (aImg: any) => {
                const result: string = aImg.target.result;
                resolve(result);
            };

            reader.readAsDataURL(file);
        });
    },

    hasRelatedApplicationErrors(app: RelatedApplication): string | undefined {
        if (!app.platform) {
            return 'You must enter the Platform.';
        }

        if (!app.url && !app.id) {
            return 'You must enter either the URL or ID.';
        }

        const urlRegExpr = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.?[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
        if (app.url && !urlRegExpr.test(app.url)) {
            return 'You must enter a valid URL.';
        }

        return;
    },

    fixColorFromServer(color: string): string {
        if (!color) {
            return '';
        }

        return '#' + colorConverter.toHexadecimal(color).slice(4, 10);
    }
};

export interface Actions<S, R> extends ActionTree<S, R> {
    updateLink(context: ActionContext<S, R>, url: string): void;
    getManifestInformation(context: ActionContext<S, R>): Promise<void>;
    removeIcon(context: ActionContext<S, R>, icon: Icon): void;
    resetStates(context: ActionContext<S, R>): void;
    addIconFromUrl(context: ActionContext<S, R>, newIconSrc: string): void;
    uploadIcon(context: ActionContext<S, R>, iconFile: File): void;
    generateMissingImages(context: ActionContext<S, R>, iconFile: File): void;
    addRelatedApplication(context: ActionContext<S, R>, payload: RelatedApplication): void;
    removeRelatedApplication(context: ActionContext<S, R>, id: string): void;
    changePreferRelatedApplication(context: ActionContext<S, R>, status: boolean): void;
    addCustomMember(context: ActionContext<S, R>, payload: CustomMember): void;
    removeCustomMember(context: ActionContext<S, R>, name: string): void;
    updateColor(context: ActionContext<S, R>, payload: ColorOptions): void;
}

export const actions: Actions<State, RootState> = {
    updateLink({ commit }, url: string): void {
        if (url && !url.startsWith('http')) {
            url = 'https://' + url;
        }

        if (!isValidUrl(url)) {
            throw 'Please provide a URL.';
        }

        commit(types.UPDATE_LINK, url);
    },

    async getManifestInformation({ commit, state, rootState }): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            if (!state.url) {
                throw 'Url is empty';
            }

            const options = {
                siteUrl: state.url
            };

            try {
                const result = await this.$axios.$post(apiUrl, options);
                // Convert color if necessary
                result.background_color = helpers.fixColorFromServer(result.background_color);

                commit(types.UPDATE_WITH_MANIFEST, result);
                commit(types.SET_DEFAULTS_MANIFEST, {
                    displays: rootState.displays ? rootState.displays[0].name : '',
                    orientations: rootState.orientations ? rootState.orientations[0].name : ''
                });

                resolve();
            } catch (e) {
                let errorMessage = e.response.data ? e.response.data.error : e.response.data || e.response.statusText;
                throw errorMessage;
            }
        });
    },

    removeIcon({ commit, state }, icon: Icon): void {
        let icons = [...state.icons];
        const index = icons.findIndex(i => {
            return i.src === icon.src;
        });

        if (index > -1) {
            icons.splice(index, 1);
            commit(types.UPDATE_ICONS, icons);
        }
    },

    resetStates({ commit }): void {
        commit(types.RESET_STATES);
    },

    async addIconFromUrl({ commit, state }, newIconSrc: string): Promise<void> {
        let src = newIconSrc;

        if (!src) {
            return;
        }

        if (src.charAt(0) === '/') {
            src = src.slice(1);
        }

        if (!src.includes('http')) {
            let prefix = state.manifest ? state.manifest.start_url : state.url;
            src = (prefix || '') + src;
        }

        try {
            const sizes = await helpers.getImageIconSize(src);
            commit(types.ADD_ICON, { src, sizes: `${sizes.width}x${sizes.height}` });
        } catch (e) {
            throw e;
        }
    },

    async uploadIcon({ commit, state }, iconFile: File): Promise<void> {
        const dataUri: string = await helpers.getImageDataURI(iconFile);
        const sizes = await helpers.getImageIconSize(dataUri);
        commit(types.ADD_ICON, { src: dataUri, sizes: `${sizes.width}x${sizes.height}` });
    },

    async generateMissingImages({ commit, state }, iconFile: File): Promise<void> {
        let formData = new FormData();
        formData.append('file', iconFile);

        const result = await this.$axios.$post(`${apiUrl}/${state.manifestId}/generatemissingimages`, formData);
        commit(types.OVERWRITE_MANIFEST, result);
        commit(types.ADD_ASSETS, result.assets);
    },

    addRelatedApplication({ commit }, payload: RelatedApplication): void {
        const errors = helpers.hasRelatedApplicationErrors(payload);

        if (errors) {
            throw errors;
        }

        commit(types.ADD_RELATED_APPLICATION, payload);
    },

    removeRelatedApplication({ commit }, id: string): void {
        commit(types.REMOVE_RELATED_APPLICATION, id);
    },

    changePreferRelatedApplication({ commit }, status: boolean): void {
        commit(types.UPDATE_PREFER_RELATED_APPLICATION, state);
    },

    addCustomMember({ commit, state }, payload: CustomMember): void {

        if (state.members.find(member => member.name === payload.name)) {
            throw 'A custom value with that key already exists';
        }

        if (!payload.name.includes('_')) {
            payload.name = helpers.MEMBER_PREFIX + payload.name;
        }

        try {
            payload.value = JSON.parse(payload.value);
            commit(types.ADD_CUSTOM_MEMBER, payload);
        } catch (e) {
            throw 'There was a problem parsing the value.  Make sure it is valid JSON (strings must be wrapped in quotes)';
        }
    },

    removeCustomMember({ commit }, name: string): void {
        commit(types.REMOVE_CUSTOM_MEMBER, name);
    },

    updateColor({ commit }, payload: ColorOptions): void {
        let color = payload.colorOption;

        if (color === helpers.COLOR_OPTIONS.pick) {
            color = payload.color;
        }

        commit(types.UPDATE_COLOR, color);
    }
};

export const mutations: MutationTree<State> = {
    [types.UPDATE_LINK](state, url: string): void {
        state.url = url;
    },

    [types.UPDATE_WITH_MANIFEST](state, result): void {
        state.manifest = result.content;
        state.manifestId = result.id;
        state.siteServiceWorkers = result.siteServiceWorkers;
        state.icons = helpers.prepareIconsUrls(result.content.icons, state.manifest && state.manifest.start_url ? state.manifest.start_url : '') || [];
        state.suggestions = result.suggestions;
        state.warnings = result.warnings;
        state.errors = result.errors;
    },

    [types.OVERWRITE_MANIFEST](state, result): void {
        state.manifest = result.content;
        state.icons = result.content.icons;
    },

    [types.SET_DEFAULTS_MANIFEST](state, payload): void {
        if (!state.manifest) {
            return;
        }

        state.manifest.lang = state.manifest.lang || '';
        state.manifest.display = state.manifest.display || payload.defaultDisplay;
        state.manifest.orientation = state.manifest.orientation || payload.defaultOrientation;
    },

    [types.UPDATE_ICONS](state, icons: Icon[]): void {
        state.icons = icons;
    },

    [types.ADD_ASSETS](state, assets: Asset[]): void {
        state.assets = assets;
    },

    [types.ADD_ICON](state, icon: Icon): void {
        state.icons.push(icon);
    },

    [types.RESET_STATES](state): void {
        state.url = null;
        state.manifest = null;
        state.manifestId = null;
        state.siteServiceWorkers = null;
        state.icons = [];
        state.suggestions = null;
        state.warnings = null;
        state.errors = null;
    },

    [types.ADD_RELATED_APPLICATION](state, payload: RelatedApplication): void {
        if (!state.manifest || !state.manifest.related_applications) {
            return;
        }

        state.manifest.related_applications = state.manifest.related_applications || [];

        state.manifest.related_applications.push(payload);
    },

    [types.REMOVE_RELATED_APPLICATION](state, id: string): void {
        if (!state.manifest || !state.manifest.related_applications) {
            return;
        }

        state.manifest.related_applications = state.manifest.related_applications || [];

        const index = state.manifest.related_applications.findIndex(app => {
            return app.id === id;
        });
        
        if (index < 0) {
            return;
        }

        state.manifest.related_applications.splice(index, 1);
    },

    [types.UPDATE_PREFER_RELATED_APPLICATION](state, status: boolean): void {
        if (!state.manifest) {
            return;
        }

        state.manifest.prefer_related_applications = status;
    },

    [types.ADD_CUSTOM_MEMBER](state, payload: CustomMember): void {
        if (!state.members) {
            return;
        }

        state.members.push(payload);
    },

    [types.REMOVE_CUSTOM_MEMBER](state, name: string): void {
        if (!state.members) {
            return;
        }

        const index = state.members.findIndex(member => {
            return member.name === name;
        });

        if (index < 0) {
            return;
        }

        state.members.splice(index, 1);
    },

    [types.UPDATE_COLOR](state, color: string): void {
        if (!state.manifest) {
            return;
        }

        state.manifest.background_color = color;
    },
};

