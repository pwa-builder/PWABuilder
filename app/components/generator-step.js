/* global _: global */
import Ember from 'ember';

export default Ember.Component.extend({
  step: null,
  stepTitle: null,
  nextStep: null,
  showNextStep: true,
  showCustomButton: false,
  customButtonText: "",
  allowToggle: true,
  tagName: 'li',
  classNames: ['pwa-generator-step'],
  classNameBindings: ['isActive:active'],

  isActive: function() {
    return this.get('step') === this.get('parentView.controller.activeStep');
  }.property('step', 'parentView.controller.activeStep'),

  didInsertElement: function() {
    var steps = this.get('parentView.controller').get('steps');
    if (_.some(steps, ['step', this.get('step')])) {
      return;
    }

    this.get('parentView.controller').get('steps').pushObject({step: this.get('step'), stepTitle: this.get('stepTitle')});
    if (this.get('parentView.controller').get('activeStep') === null) {
      this.get('parentView.controller').setActiveStep(this.get('step'));
    }
  },
  
  actions: {
    updateStep: function(nextStep){
      this.get('parentView.controller').setActiveStep(nextStep);
      window.scrollTo(0,0);
      return true; // keep bubbling
    }, 
    customAction: function() {
      this.sendAction('customAction');
    }
  }
});
