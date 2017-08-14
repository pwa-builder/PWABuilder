import Ember from 'ember';

export default Ember.Component.extend({
  step: null,
  tagName: 'li',
  classNames: ['pwa-generator-tab'],
  attributeBindings: ['stepNumber:data-step'],
  stepNumber: function() {
    return this.get('step');
  }.property(),
  classNameBindings: ['isActive:active'],
  isActive: function() {
    return this.get('step') === this.get('parentView.controller.activeStep');
  }.property('step', 'parentView.controller.activeStep'),
  click: function() {
    this.get('parentView.controller').setActiveStep(this.get('step'));
  }
});
