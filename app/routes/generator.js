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
    deleteAssets: function() {
      var model = this.modelFor('generator');
      model.set('assets', []);
    },
    updateLogos: function(logos) {
      var model = this.modelFor('generator');
      model.set('manifest.icons',logos);
      model.save();
    },
    buildArchive: function(platform){
      this.ga('send', 'event', 'item', 'click', 'generator-build-trigger');
      var model = this.modelFor('generator');
      model.build(platform);
    },
    downloadArchive: function(archiveLink, platform){
      var model = this.modelFor('generator');
      model.set('build' + platform + 'Ready',true);
      this.ga('send', 'event', 'item', 'click', 'generator-build-download');
      window.location.href = archiveLink;
    },
    publishWin10Package: function(publishName, publishEmail){
      this.ga('send', 'event', 'item', 'click', 'generator-publishWindows10-trigger');
      var model = this.modelFor('generator');
      
      var platform = 'windows10';
      
      var options = { 
        DotWeb: false, 
        AutoPublish: true, 
        autoPublishName: publishName, 
        autoPublishEmail: publishEmail
      };
      
      model.package(platform, options);
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
    manageRelatedApplications: function(action, relatedApp) {
      var model = this.modelFor('generator');
      var manifest = model.get('manifest');
      if(action === 'add'){
        if (!manifest.related_applications) {
          manifest.related_applications = Ember.A();
        }
        manifest.related_applications.pushObject(relatedApp);
      } else if (action === 'remove') {
        var _relatedApp = manifest.related_applications.filter(function(item) {
          return item.platform === relatedApp.platform && item.url === relatedApp.url && item.id === relatedApp.id;
        });
        if (_relatedApp) {
          manifest.related_applications.removeObjects(_relatedApp);
        }
        if (manifest.related_applications.length === 0) {
          delete manifest["related_applications"];
        }
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
    },
    downloadServiceWorker: function() {
      var model = this.modelFor('generator');
      model.downloadServiceWorker();
    },
    getServiceWorkerCodePreview: function() {
      var model = this.modelFor('generator');
      model.getServiceWorkerCodePreview();
    }, 
    addUploadedImage: function(imageInfo, callback) {
      var model = this.modelFor('generator');
      model.generateMissingImages(imageInfo, callback);
    }
  }
});