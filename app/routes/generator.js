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
    startComplete: function(siteUrl, file) {
      var model = this.modelFor('generator');
      if(siteUrl){
        model.set('siteUrl', siteUrl);
        model.save();
      } else if (file) {
        model.upload(file);
      }
    },
    updateLogos: function(logos) {
      var model = this.modelFor('generator');
      model.set('manifest.icons',logos);
      model.save();
    },
    buildArchive: function(){
      this.ga('send', 'event', 'item', 'click', 'generator-build-trigger');
      var model = this.modelFor('generator');
      model.build();
    },
    downloadArchive: function(archiveLink){
      var model = this.modelFor('generator');
      model.set('buildReady',true);
      this.ga('send', 'event', 'item', 'click', 'generator-build-download');
      window.location.href = archiveLink;
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
    },
    startOver: function(){
      this.refresh();
    }
  }
});
