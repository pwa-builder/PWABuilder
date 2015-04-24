import Ember from 'ember';

export default Ember.Component.extend({
  step: null,
  isShowingBody: false,
  allowToggle: false,
  tagName: 'li',
  classNames: ['step'],
  classNameBindings: ['stepId', 'isEnabled'],
  stepId: function () {
    return 'step' + this.get('step');
  }.property('step'),
  isEnabled: function () {
    var cssClass;
    if(this.get('allowToggle')){
      cssClass = 'step--enabled';
    } else {
      cssClass = 'step--disabled';
    }
    return cssClass;
  }.property('allowToggle'),
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
