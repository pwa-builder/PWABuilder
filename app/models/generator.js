/* global JSON: true, _:true */
import Ember from 'ember';
import ajax from 'ic-ajax';
import config from '../config/environment';

export default Ember.Object.extend({
  archiveLink: '',
  isBuilding: false,
  isSaving: false,
  manifestId: null,
  siteUrl: '',
  manifest: Ember.Object.create(),
  suggestions: Ember.A(),
  warnings: Ember.A(),
  errors: Ember.A(),
  members: Ember.A(),
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
  formattedManifest: function () {
    return new Ember.Handlebars.SafeString("<code class='language-javascript'>"+JSON.stringify(this.get('manifest'), null, '    ')+"</code>");
  }.property('manifest'),
  save: function () {
    this.set('isSaving', true);
    if(!this.manifestId) {
      this.create();
    } else {
      this.update();
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
      self.set('manifest', result.content);
      self.set('manifestId', result.id);

      //Set Defaults
      self.set('manifest.display', 'fullscreen');
      self.set('manifest.orientation', 'any');

      if(!self.get('manifest.icons')) {
        self.set('manifest.icons',[]);
      }

      if(result.suggestions) {
        self.set('suggestions', result.suggestions);
      }

      if(result.warnings) {
        self.set('warnings', result.warnings);
      }

      if(result.errors) {
        self.set('errors', result.errors);
      }

      self.save();

      self.set('isSaving', false);

    }).catch(function(){
      self.set('isSaving', false);
    });
  },
  update: function(){
    var self = this,
      manifest = self.get('manifest');

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
        self.set('manifest',result.content);

      if(result.suggestions){
        self.set('suggestions', result.suggestions);
      }

      if(result.warnings){
        self.set('warnings', result.warnings);
      }

      if(result.errors) {
        self.set('errors', result.errors);
      }

      self.set('isSaving', false);

    }).catch(function(){
      self.set('isSaving', false);
    });
  },
  build: function(){
    var self = this;
    this.set('isBuilding', true);
    ajax({
      url: config.APP.API_URL + '/manifests/' + this.get('manifestId') + '/build',
      type: 'POST'
    }).then(function(result){
      self.set('archiveLink', result.archive);
      self.set('isBuilding', false);
    }).catch(function(){
      self.set('isBuilding', false);
    });
  }
});
