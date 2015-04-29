import Ember from 'ember';
import GeneratorModel from '../models/generator';

export default Ember.Route.extend({
  model: function () {
    return GeneratorModel.create();
  },
  setupController: function(controller, model) {
    this.controllerFor('generator').set('model', model);
  },
  activate: function() {
    this._super();
    Ember.$('.application').addClass('l-app-style');
    Ember.$('footer').addClass('is-small');
  },
  deactivate: function() {
    this._super();
    Ember.$('.application').removeClass('l-app-style');
    Ember.$('footer').removeClass('is-small');
  },
  actions: {
    updateLogos: function(logos) {
      var model = this.modelFor('generator');
      model.set('manifest.icons',logos);
      model.save();
    },
    buildArchive: function(){
      ga('send', 'event', 'item', 'click', 'generator-build-trigger');
      var model = this.modelFor('generator');
      model.build();
    },
    downloadArchive: function(archiveLink){
      ga('send', 'event', 'item', 'click', 'generator-build-download');
      window.location.href = archiveLink;
    },
    updateManifest: function (result) {
      var model = this.modelFor('generator');
      var controller = this.controllerFor('generator');
      controller.set('step1Complete', true);
      model.set('manifestId', result.id);
      model.set('manifest', result.content);
      if(result.content.display === undefined) {
        model.set('manifest.display', 'fullscreen');
      }
      if(!result.content.orientation) {
        model.set('manifest.orientation', 'any');
      }

      if(!model.get('manifest.icons')) {
        model.set('manifest.icons',[]);
      }

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
      Ember.$('.application').addClass('l-app-style');
    },
    updateModel: function(){
      var model = this.modelFor('generator');
      model.save();
    }
  }
});
