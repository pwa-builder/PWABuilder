/* global Generator */
import Ember from 'ember';
import Generator from '../models/generator';

export default Ember.Route.extend({
  currentStep: 0,
  model: function () {
    return Generator.create();
  },
  setupController : function (controller, model) {
    controller.set('model', model);
  },
  actions:{
    willTransition: function(transition) {
      console.log('transition?', transition);
      return true;
    }
  }
});
