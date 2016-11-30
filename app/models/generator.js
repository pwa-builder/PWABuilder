/* global JSON: true, _:true */
import Ember from 'ember';
import ajax from 'ic-ajax';
import config from '../config/environment';

export default Ember.Object.extend({
  archiveLink: '',
  isBuilding: [],
  buildFailed: [],
  isSaving: false,
  buildReady: false,
  manifestId: null,
  siteUrl: '',
  manifest: Ember.Object.create(),
  suggestions: Ember.A(),
  warnings: Ember.A(),
  errors: Ember.A(),
  members: Ember.A(),
  buildErrors: Ember.A(),
  errorsTotal: function(){
    return _.sum(this.errors, function(n){
      return n.issues.length;
    });
  }.property('errors'),
  warningsTotal: function(){
    return _.sum(this.warnings, function(n){
      return n.issues.length;
    });
  }.property('errors'),
  suggestionsTotal: function(){
    return _.sum(this.suggestions, function(n){
      return n.issues.length;
    });
  }.property('errors'),
  hasIssues: function(){
    return this.errors.length > 0 || this.warnings.length > 0 || this.suggestions.length > 0;
  }.property('errors,suggestions,warnings'),
  display: {
    names: ['fullscreen', 'standalone', 'minimal-ui', 'browser']
  },
  orientation: {
    names: ['any', 'natural', 'landscape', 'portrait', 'portrait-primary', 'portrait-secondary', 'landscape-primary', 'landscape-secondary']
  },
  save: function () {
    this.set('isSaving', true);
    if(!this.manifestId) {
      this.create();
    } else {
      this.update();
    }
  },
  processResult: function(result){
    this.set('manifest', result.content);
    this.set('manifestId', result.id);
    if(!this.get('manifest.icons')) {
      this.set('manifest.icons',[]);
    }
    if(result.suggestions) {
      this.set('suggestions', result.suggestions);
    }
    if(result.warnings) {
      this.set('warnings', result.warnings);
    }
    if(result.errors) {
      this.set('errors', result.errors);
    }
  },
  setDefaults: function(result){
    if(result.content.display === undefined) {
      this.set('manifest.display', 'fullscreen');
    }
    if(result.content.orientation === undefined) {
      this.set('manifest.orientation', 'any');
    }
  },
  create: function(){
    var self = this;
    ajax({
      url:config.APP.API_URL+'/manifests/',
      type: 'POST',
      data: JSON.stringify({ siteUrl: this.get('siteUrl') }),
      dataType: 'json',
      contentType: 'application/json; charset=utf-8'
    }).then(function(result) {
      self.processResult(result);
      self.setDefaults(result);
      self.set('isSaving', false);
    }).catch(function(){
      self.set('isSaving', false);
    });
  },
  update: function(){
    var self = this;
    var manifest = self.get('manifest');
    manifest = _.omit(manifest,function(prop){
      if(_.isString(prop)){
        return _.isEmpty(prop);
      }else if(_.isObject(prop)){
        return _.isUndefined(prop);
      }
      return false;
    });
    ajax({
      url: config.APP.API_URL + '/manifests/' + this.get('manifestId'),
      type: 'PUT',
      data: JSON.stringify(manifest),
      dataType: 'json',
      contentType: 'application/json; charset=utf-8'
    }).then(function(result) {
      self.processResult(result);
      self.set('isSaving', false);
    }).catch(function(){
      self.set('isSaving', false);
    });
  },
  build: function(platform){
    var self = this,
      platformsList = [];

    this.set('isBuilding.' + platform, true);
    this.set('buildFailed.' + platform,false);
    this.buildErrors.clear();
    
    if (platform === 'Polyfills') {
      platformsList = [ 'windows', 'ios', 'android' ];
    } else {
      platformsList = [ platform ];
    }

    ajax({
      url: config.APP.API_URL + '/manifests/' + this.get('manifestId') + '/build',
      type: 'POST',
      data: JSON.stringify({ platforms: platformsList, dirSuffix: platform }),
      dataType: 'json',
      contentType: 'application/json; charset=utf-8'
    }).then(function(result){
      self.set('archiveLink', result.archive);
      self.set('isBuilding.' + platform, false);
      self.set('buildFailed.' + platform, false);
      self.buildErrors.clear();
    }).catch(function(err){
      self.set('isBuilding.' + platform, false);
      self.set('buildFailed.' + platform, true);
      self.set('buildReady', false);
      if(err.jqXHR.responseJSON){
        self.buildErrors.addObject(err.jqXHR.responseJSON.error);
      }
    });
  },
  package: function(platform, options){
    var self = this;
    
    var dirSuffix = platform;

    if (options.DotWeb) {
      dirSuffix += 'dotWeb';
      this.set('isBuilding.' + platform, true);
      this.set('buildFailed.' + platform,false);
    } else {
      dirSuffix += 'publish';
      this.set('isBuilding.Win10Publish', true);
      this.set('buildFailed.Win10Publish',false);
    }

    this.buildErrors.clear();

    ajax({
      url: config.APP.API_URL + '/manifests/' + this.get('manifestId') + '/package',
      type: 'POST',
      data: JSON.stringify({ platform: platform, options: options, dirSuffix: dirSuffix  }),
      dataType: 'json',
      contentType: 'application/json; charset=utf-8'
    }).then(function(result){
        if (result) {
          self.set('archiveLink', result.archive);
        }

        if (options.DotWeb) {
          self.set('isBuilding.' + platform, false);
          self.set('buildFailed.' + platform,false);
        } else {
          self.set('isBuilding.Win10Publish', false);
          self.set('buildFailed.Win10Publish',false);
        }

        self.buildErrors.clear();
    }).catch(function(err){
      if (options.DotWeb) {
        self.set('isBuilding.' + platform, false);
        self.set('buildFailed.' + platform,true);
      } else {
        self.set('isBuilding.Win10Publish', false);
        self.set('buildFailed.Win10Publish',true);
      }
      self.set('buildReady',false);
      if(err.jqXHR.responseJSON){
        self.buildErrors.addObject(err.jqXHR.responseJSON.error);
      }
    });
  },
  generateFormData: function(file) {
    var formData = new FormData();
    formData.append('file', file);
    return formData;
  },
  upload: function(file) {
    var self = this;
    var data = this.generateFormData(file);
    this.set('isSaving', true);
    ajax({
      url: config.APP.API_URL + '/manifests',
      type: 'POST',
      data: data,
      contentType: false,
      processData: false,
      cache: false
    }).then(function(result) {
      self.processResult(result);
      self.setDefaults(result);
      self.set('isSaving', false);
    }).catch(function(){
      self.set('isSaving', false);
    });
  }
});