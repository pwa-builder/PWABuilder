/* global _:true */
import Ember from 'ember';

export default Ember.Controller.extend({
  startReady: false,
  startComplete: function(){
    var startReady = this.get('startReady');
    var manifestId = this.get('model.manifestId');
    return startReady && manifestId;
  }.property('startReady','model.isSaving', 'model.manifestId'),
  formattedManifest: function () {
    var model = this.get('model');
    var code = model.get('manifest');

    var _code = JSON.stringify(code);
    _code = JSON.parse(_code);

    if(_code && _code.icons){
      _code.icons.map(function (icon) {
        if (icon.src.indexOf('data:') === 0){
          icon.src = "[Embedded]";
        }
        if (icon.fileName) {
          delete icon.fileName;
        }
        if (icon.generated) {
          delete icon.generated;
        }
      });
    }

    return new Ember.Handlebars.SafeString('<code class=\'language-javascript\'>' + JSON.stringify(_code, null, 2) + '</code>');
  }.property('model.manifest'),
  formattedServiceWorkerWebsiteCode : function() {
    var model = this.get('model');
    var codePreview = model.get('serviceWorkerCodePreview');
    var code = codePreview.forWebSite;
    return new Ember.Handlebars.SafeString('<code class=\'language-javascript\'>' + code + '</code>');
  }.property('model.serviceWorkerCodePreview.forWebSite'),
  formattedServiceWorkerCode : function() {
    var model = this.get('model');
    var codePreview = model.get('serviceWorkerCodePreview');
    var code = codePreview.forServiceWorker;
    return new Ember.Handlebars.SafeString('<code class=\'language-javascript\'>' + code + '</code>');
  }.property('model.serviceWorkerCodePreview.forServiceWorker'),
  isProcessing: function() {
    var model = this.get('model');
    return model.get('isBuilding') || model.get('isSaving');
  }.property('model.isBuilding', 'model.isSaving'),
  steps: Ember.A(),
  activeStep: null,
  showCustomMembers: false,
  showRelatedApps: false,
  selectedDisplay: null,
  selectedOrientation: null,
  valueOrEmptyString: function (value) {
    if(value) {
      return value;
    } else {
      return '';
    }
  },
  updateSelect: function(property, value) {
    this.model.set(property, value);
    this.model.save();
  },
  customMembers: function(){
    var staticValues = ['lang','name','short_name','scope','icons','display','orientation','start_url','theme_color','related_applications','prefer_related_applications', 'background_color'];
    var model = this.get('model');
    var keys = _.filter(_.keys(model.manifest),function(key){
      return key.indexOf('_') !== -1;
    });
    var customKeys = _.difference(keys,staticValues);
    var customProps = _.map(customKeys,function(key){
      var data = {
        member_name: key,
        member_value: model.manifest[key]
      };
      return data;
    });
    return customProps;
  }.property('model'),
  relatedApplications: function() {
    var model = this.get('model');
    return model.get('relatedApplications');
  }.property('model'),
  setActiveStep: function(stepId) {
    if (this.get('activeStep') !== null) {
      if (stepId !== this.get('activeStep')) {
        this.set('activeStep', stepId);
      }
    } else {
      this.set('activeStep', stepId);
    }
  },

  actions: {
    startOver: function(){
      this.ga('send', 'event', 'item', 'click', 'generator-startover-trigger');
      this.set('startReady', false);
      this.set('model.manifestId', null);
      this.set('activeStep', "1");

      var model = this.get('model');
      var platforms = model.get('platforms');
      if(platforms){
        platforms.forEach(function(item) {
          Ember.set(item, 'isSelected', true);
        });
      }

      model.save();

      return true;
    },
    updateStep: function(nextStep){
      this.ga('send', 'event', 'item', 'click', 'generator-nextStep-trigger');
      this.setActiveStep(nextStep);
      window.scrollTo(0,0);
    },
    startComplete: function() {
      this.set('startReady', true);
      this.set('activeStep', "1");
      this.set("showCustomMembers", false);

      return true;
    },
    updateSelection: function() {
      var allSelected = true;
      var model = this.get('model');
      model.get('platforms').forEach(function(item) {
        if (!item.isSelected) {
          allSelected = false;
        }
      });
      model.get('platforms').forEach(function(item) {
        Ember.set(item, 'isSelected', !allSelected);
      });
      model.save();
    },

    toggleCustomMembers: function() {
      var current = this.get("showCustomMembers");
      this.set("showCustomMembers", !current);
    },
    toggleRelatedApps: function() {
      var current = this.get("showRelatedApps");
      this.set("showRelatedApps", !current);
    }
  }
});