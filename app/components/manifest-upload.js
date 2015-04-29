import Ember from 'ember';
import ajax from 'ic-ajax';
import config from '../config/environment';

export default Ember.Component.extend({
  generateFormData: function(file) {
    var formData = new FormData();
    formData.append('file', file);
    return formData;
  },
  actions:{
    uploadManifest: function(file) {
      console.log(file);
      var self = this;
      var data = this.generateFormData(file);
      this.$(".upload-file").attr("value", file.name);
      ajax({
        url: config.APP.API_URL + '/manifests',
        type: 'POST',
        data: data,
        contentType: false,
        processData: false,
        cache: false
      }).then(function(result) {
        self.sendAction('action', result);
      });
    }
  }
});
