// Root getters
export const getters = {
  selectedPerson: state => {
    const p = state.people.find(person => person.id === state.selected);
    return p ? p : { first_name: "Please,", last_name: "select someone" };
  }
}