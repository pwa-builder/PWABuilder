/* global JSON */
import Ember from 'ember';
import ajax from 'ic-ajax';
import config from '../config/environment';

export default Ember.Object.extend({
  step1Complete: false,
  manifestId: null,
  siteUrl: 'http://www.cnn.com',
  manifest: Ember.Object.create({
    name: '',
    short_name: '',
    icons:[],
    start_url: '',
    display: '',
    orientation: ''
  }),
  suggestions: Ember.Object.create(),
  warnings: Ember.Object.create(),
  members: Ember.A(),
  display: {
    names: ['fullscreen', 'standalone', 'minimal-ui', 'browser']
  },
  orientation: {
    names: ['any', 'natural', 'landscape', 'portrait', 'portrait-primary', 'portrait-secondary', 'landscape-primary', 'landscape-secondary']
  },
  formattedManifest: function () {
    console.log('formattedManifest');
    return JSON.stringify(this.get('manifest'), null, '    ');
  }.property('manifest'),
  suggestionsArray: function() {
    var keys = Object.keys(this.suggestions);
    var suggestions = Ember.A();
    if(keys){
      for (var i = 0, l = keys.length; i < l; i ++) {
        var v = keys[i];
        var section = {};
        section.title = v;
        section.suggestions = [];
        for (var j = 0, k = this.suggestions[v].length; j < k; j ++) {
          var w = this.suggestions[v][j];
          section.suggestions.push(w);
        }
        suggestions.push(section);
      }
    }
    return suggestions;
  }.property('suggestions'),
  warningsArray: function() {
    console.log(this.suggestions);
    return Ember.makeArray(this.warnings);
  }.property('warnings'),
  save: function () {
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
        self.set('manifest',result.content);
        self.set('manifestId', result.id);

        if(result.suggestions){
          self.set('suggestions', result.suggestions);
        }

        if(result.warnings){
          self.set('warnings', result.warnings);
        }

        console.log(result);
    });
  },
  update: function(){
    var self = this;
    ajax({
        url: config.APP.API_URL + '/manifests/' + this.get('manifestId'),
        type: 'PUT',
        data: JSON.stringify(this.get('manifest')),
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

        console.log(result);
    });
  }
});
