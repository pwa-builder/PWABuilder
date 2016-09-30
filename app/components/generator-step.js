import Ember from 'ember';

export default Ember.Component.extend({
  step: null,
  nextStep: null,
  isShowingBody: false,
  showNextStep: true,
  showCustomButton: false,
  customButtonText: "",
  allowToggle: true,
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
    updateStep: function(currentStep, nextStep){
      this.toggleProperty('isShowingBody');
      this.sendAction('action', currentStep, nextStep);
      return true; // keep bubbling
    }, 
    customAction: function() {
      this.sendAction('customAction');
    }
  }
});
