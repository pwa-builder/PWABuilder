// Root mutations
export const mutations = {
  select(state, id) {
    state.selected = id;
  },
  setPeople(state, people) {
    state.people = people;
  },
  SET_LANG(state, locale) {
    if (state.locales.indexOf(locale) !== -1) {
      state.locale = locale
    }
  }
};