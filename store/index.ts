export const state = () => ({
  selected: 1,
  people: [],
  locales: ['en', 'es'],
  locale: 'en'
});

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

export const getters = {
  selectedPerson: state => {
    const p = state.people.find(person => person.id === state.selected);
    return p ? p : { first_name: "Please,", last_name: "select someone" };
  }
};

export const actions = {
  async nuxtServerInit({ commit }) {},
};
