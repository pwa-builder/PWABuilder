import Ember from 'ember';

export default Ember.Component.extend({
  step: null,
  isShowingBody: false,
  allowToggle: false,
  actions: {
    toggleBody: function() {
      if(this.allowToggle) {
        this.toggleProperty('isShowingBody');
      }
    },
    updateModel: function(){
      this.sendAction('action', this.get('step'));
    }
  }
});
