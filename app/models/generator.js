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
        console.log(result);
    });
  },
  update: function(){
    var self = this;
    ajax({
        url: config.APP.API_URL + '/manifests/' + this.manifestId,
        type: 'PUT',
        data: JSON.stringify(this.manifest),
    }).then(function(result) {
        self.set('manifest',result.content);
        console.log(result);
    });
  }
});
