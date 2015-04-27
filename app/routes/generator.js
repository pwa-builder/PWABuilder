import Ember from 'ember';
import GeneratorModel from '../models/generator';
//import RouteAware from '../mixins/routeaware';

export default Ember.Route.extend({
  selectedDisplay: '',
  model: function () {
    return GeneratorModel.create();
  },
  setupController: function(controller, model) {
    this.controllerFor('generator').set('model', model);
  },
  activate: function() {
    this._super();
    $('.application').addClass('l-app-style');
    $('footer').addClass('is-small');
  },
  deactivate: function() {
    this._super();
    $('.application').removeClass('l-app-style');
    $('footer').removeClass('is-small');
  },
  actions: {
    stepUpdated: function (step) {
      var model = this.modelFor('generator');
      if(step === '1'){
        model.set('step1Complete',true);
      }
      model.save();
    },
    updateLogos: function(logos) {
      var model = this.modelFor('generator');
      model.set('manifest.icons',logos);
      model.save();
    },
    updateManifest: function (result) {
      var model = this.modelFor('generator');
      model.set('step1Complete', true);
      model.set('manifestId', result.id);
      model.set('manifest', result.content);
      model.save();
    },
    updateModel: function () {
      var model = this.modelFor('generator');
      model.save();
    },
    updateModelProperty: function(name, value) {
      var model = this.modelFor('generator');
      model.set('manifest.'+ name, value);
      model.save();
    },
    manageMember: function(action, member){
      var model = this.modelFor('generator');
      var manifest = model.get('manifest');
      if(action === 'add'){
        manifest[member.member_name] = member.member_value;
      } else if (action === 'remove') {
        delete manifest[member.member_name];
      }
      model.save();
    },
    didTransition: function() {
      $('.application').addClass('l-app-style');
    }
  }
});
