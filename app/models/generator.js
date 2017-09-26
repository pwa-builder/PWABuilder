/* global JSON: true, _:true */
import Ember from 'ember';
import ajax from 'ic-ajax';
import config from '../config/environment';
import langConst from './languageConst';

export default Ember.Object.extend({
  archiveLink: '',
  appXLink: '',
  isBuilding: [],
  buildFailed: [],
  isSaving: false,
  buildReady: false,
  publishSuccedded: false,
  manifestId: null,
  siteUrl: '',
  siteServiceWorkers: null,
  manifest: Ember.Object.create(),
  suggestions: Ember.A(),
  warnings: Ember.A(),
  errors: Ember.A(),
  members: Ember.A(),
  startFailure: null,
  buildErrors: Ember.A(),
  assets: Ember.A(),
  errorsTotal: function(){
    return _.sumBy(this.errors, function(n){
      return n.issues.length;
    });
  }.property('errors'),
  warningsTotal: function(){
    return _.sumBy(this.warnings, function(n){
      return n.issues.length;
    });
  }.property('errors'),
  suggestionsTotal: function(){
    return _.sumBy(this.suggestions, function(n){
      return n.issues.length;
    });
  }.property('errors'),
  hasIssues: function(){
    return this.errors.length > 0 || this.warnings.length > 0 || this.suggestions.length > 0;
  }.property('errors,suggestions,warnings'),
  hasNoErrors: function() {
    return this.errors.length === 0;
  }.property('errors'),
  isHTTPS: function() {
    return this.siteUrl.indexOf('https') === 0;
  }.property('siteUrl'),
  display: {
    names: ['fullscreen', 'standalone', 'minimal-ui', 'browser']
  },
  orientation: {
    names: ['any', 'natural', 'landscape', 'portrait', 'portrait-primary', 'portrait-secondary', 'landscape-primary', 'landscape-secondary']
  },
  selectedServiceWorker: 1,
  serviceWorkers: [
    {id: 1, name: 'Offline page', isDisabled: false, description: "This simple but elegant solution pulls a file from your web server called \"offline.html\" (make sure that file is actually there) and serves the file whenever a network connection can not be made." },
    {id: 2, name: 'Offline copy of pages', isDisabled: false, description: "A solution that expands the offline capabilities of your app. A copy of each pages is stored in the cache as your visitors view them. This allows a visitor to load any previously viewed page while they are offline." },
    {id: 3, name: 'Offline copy with Backup offline page', isDisabled: false, description: "A copy of each pages is stored in the cache as your visitors view them. This allows a visitor to load any previously viewed page while they are offline. This then adds the \"offline page\" that allows you to customize the message and experience if the app is offline, and the page is not in the cache." },
    {id: 4, name: 'Cache-first network',isDisabled: false, description: "Use this service worker to pre-cache content. The content you add to the \"cache-array\" will be added immediately to the cache and service from the cache whenever a page requests it. At the same time it will update the cache with the version you have on the server. Configure your file array to include all your site files, or a subset that you want to be served quickly." },
    {id: 5, name: 'Advanced Pre-cache (coming soon)', isDisabled: true, description: "Use this service worker to improve the performance of your app, and make it work offline. The advanced pre-cache allows you to configure files and routs that are cached in different manors (pre-cache, server first, cache first etc). The tool can be used to build a lightening fast app (even for dynamic content) that works offline." }
  ],
  serviceWorkerCodePreview: { forWebSite: '', forServiceWorker: '' },
  hasServiceWorkersSelected: function() {
    this.getServiceWorkerCodePreview(this.selectedServiceWorker);
    return this.selectedServiceWorker;
  }.property('selectedServiceWorker'),
  siteRegistersServiceWorker: function(){
    return this.siteServiceWorkers && this.siteServiceWorkers.length !== 0;
  }.property('siteServiceWorkers'),
  save: function () {
    this.set('isSaving', true);
    this.set('startFailure', null);

    if(!this.manifestId) {
      this.create();
    } else {
      this.update();
    }
  },
  processResult: function(result){
    this.set('manifest', result.content);
    this.set('manifestId', result.id);
    this.set('siteServiceWorkers', result.siteServiceWorkers);
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
    if (result.content.lang === undefined) {
      this.set('manifest.lang', '');
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

      if (result.content.lang === undefined) {
        this.set('manifest.lang', '');
      }

      self.set('isSaving', false);
    }).catch(function(err){
      self.set('startFailure', err.jqXHR.responseJSON.error || 'No error details received.');
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
    }).catch(function(err){
      self.set('startFailure', err.jqXHR.responseJSON.error || 'No error details received.');
      self.set('isSaving', false);
    });
  },
  // Create downloadable Archive for user
  build: function(platform){
    var self = this,
      platformsList = [];

    this.set('isBuilding.' + platform, true);
    this.set('buildFailed.' + platform,false);
    this.buildErrors.clear();

    if (platform === 'All') {
      platformsList = [ 'web', 'windows10', 'windows', 'ios', 'android' ];
    } else {
      platformsList = [ platform ];
    }

    ajax({
      url: config.APP.API_URL + '/manifests/' + this.get('manifestId') + '/build?ids=' + self.selectedServiceWorker,
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
  buildAppX: function(name, publisheridentity, packagename, version, callback){
    var self = this;

    this.set('isBuilding.appX', true);
    this.set('buildFailed.appX',false);
    this.buildErrors.clear();

    ajax({
      url: config.APP.API_URL + '/manifests/' + this.get('manifestId') + '/appx',
      type: 'POST',
      data: JSON.stringify({ name: name, publisher: publisheridentity, package: packagename, version: version }),
      dataType: 'json',
      contentType: 'application/json; charset=utf-8'
    }).then(function(result){
      self.set('appXLink', result.archive);
      self.set('isBuilding.appX', false);
      self.set('buildFailed.appX', false);
      self.buildErrors.clear();
      callback();
    }).catch(function(err){
      self.set('isBuilding.appX', false);
      self.set('buildFailed.appX', true);
      self.set('buildReady', false);
      if(err.jqXHR.responseJSON){
        self.buildErrors.addObject(err.jqXHR.responseJSON.error);
        console.error('Error: ' + err.jqXHR.responseJSON.error);
        callback(err.jqXHR.responseJSON.error);
      } else {
        console.error('Error: ' + err);
        callback(err);
      }
    });
  },
  // Package and send to our DropBox location
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
      url: config.APP.API_URL + '/manifests/' + this.get('manifestId') + '/package?ids=' + self.selectedServiceWorker,
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
          self.set('publishSuccedded', true);
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
  },
  downloadServiceWorker: function() {
    var self = this;
    var platform = "serviceWorker";
    self.set('isBuilding.' + platform, true);
    this.set('buildFailed.' + platform,false);

    ajax({
      url: config.APP.API_URL + '/serviceworkers?ids=' + self.selectedServiceWorker,
      type: 'GET',
      dataType: 'json',
      contentType: 'application/json; charset=utf-8'
    }).then(function(result){
      self.set('isBuilding.' + platform, false);
      self.set('archiveLink', result.archive);
    }).catch(function() {
      self.set('isBuilding.' + platform, false);
      self.set('buildFailed.' + platform, true);
    });
  },
  getServiceWorkerCodePreview: function(hasServiceWorkersSelected) {
    var self = this;
    if (hasServiceWorkersSelected){

      ajax({
        url: config.APP.API_URL + '/serviceworkers/previewcode?ids=' + self.selectedServiceWorker,
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json; charset=utf-8'
      }).then(function(result) {
        self.set('serviceWorkerCodePreview.forWebSite', result.webSite);
        self.set('serviceWorkerCodePreview.forServiceWorker', result.serviceWorker);
      });
    }
    else {
      self.set('serviceWorkerCodePreview.forWebSite', '');
      self.set('serviceWorkerCodePreview.forServiceWorker', '');
    }
  },
  languages: [{"code": '', "name": " "}].pushObjects(langConst.languageConst()),
  watchLang: function() {
    var manifest = this.get('manifest');
    if (manifest.lang && manifest.lang === "") {
      delete manifest.lang;
    }
  }.observes("manifest.lang"),
  watchBackgroundColor: function() {
    var manifest = this.get('manifest');
    if (manifest.background_color && manifest.background_color === "none") {
      delete manifest.background_color;
    }
  }.observes("manifest.background_color"),
  generateMissingImages: function(fileInfo, callback) {
    var self = this;

    var formData = new FormData();
    formData.append('file', fileInfo);

    ajax({
      url: config.APP.API_URL + '/manifests/' + this.get('manifestId') + '/generatemissingimages' ,
      type: 'POST',
      data: formData,
      contentType: false,
      processData: false,
      cache: false
    }).then(function(result){
      self.set('manifest', result.content);
      self.set('assets', result.assets);
      callback();
    }).catch(function(error) {
      console.error('Error: ' + error);
      callback(error);
    });
  },
  hasAssets: function() {
    return (this.assets && this.assets.length > 0);
  }.property('assets'),

});