import VuexPersistence from 'vuex-persist';

export default ({ store }) => {
    window.onNuxtReady(() => {
        new VuexPersistence({
            key: 'vuex', // The key to store the state on in the storage provider.
            storage: window.localStorage, // or window.sessionStorage or localForage
        }).plugin(store);
    });
}