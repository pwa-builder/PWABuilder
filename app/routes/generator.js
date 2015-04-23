import Ember from 'ember';
import GeneratorModel from '../models/generator';
//import RouteAware from '../mixins/routeaware';

export default Ember.Route.extend({
  model: function () {
    return GeneratorModel.create();
  },
  actions: {
    stepUpdated: function (step) {
      var model = this.modelFor('generator');
      if(step === '1'){
        model.set('step1Complete',true);
      }
      model.save();
    },
    updateLogos: function(logos){
      var model = this.modelFor('generator');
      model.set('logos',logos);
      model.save();
    }
  }
});
