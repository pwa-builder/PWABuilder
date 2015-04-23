import Ember from 'ember';
import ajax from 'ic-ajax';
import config from '../config/environment';

export default Ember.Component.extend({
  generateFormData: function() {

  },
  uploadManifest: function() {
    ajax({
      url: config.APP.API_URL + '/manifest',
        type: 'POST',
        data: null,
        dataType: 'json',
        contentType: 'application/json; charset=utf-8'
      }).then(function(result) {
        console.log(result);
      });

  }
});
