/* global JSON */
import Ember from 'ember';
import ajax from 'ic-ajax';

export default Ember.Object.extend({
  step1Complete: false,
  manifestId: null,
  siteUrl: 'http://www.cnn.com',
  manifest: {
    name: '',
    short_name: '',
    icons:[],
    start_url: '',
    display: '',
    orientation: ''
  },
  display: {
    names: ['fullscreen', 'standalone', 'minimal-ui', 'browser']
  },
  orientation: {
    names: ['any', 'natural', 'landscape', 'portrait', 'portrait-primary', 'portrait-secondary', 'landscape-primary', 'landscape-secondary']
  },
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
        url:'/manifests/',
        type: 'POST',
        data: JSON.stringify({ siteUrl: this.siteUrl }),
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
    }).then(function(result) {
        self.set('manifest',result.content);
        self.set('manifestId', result.id);
        //self.set('formattedContent', JSON.stringify(result.content, null, 4));
    });
  },
  update: function(){
    var self = this;
    ajax({
        url:'/manifests/' + this.manifestId,
        type: 'POST',
        data: JSON.stringify(this.manifest),
    }).then(function(result) {
        self.manifest = JSON.parse(result);
        self.set('manifest',result.content);
        self.set('manifestId', result.id);
        //self.set('formattedContent', JSON.stringify(result.content, null, 4));
    });
  }

});
