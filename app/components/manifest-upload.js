import Ember from 'ember';

export default Ember.Component.extend({
  generateFormData: function(file) {
  
  },
  uploadManifest: function() {
    ajax({
      url:config.APP.API_URL+'/manifest',
        type: 'POST',
        data: JSON.stringify({ image: { src: self.logoUrl }}),
        dataType: 'json',
        contentType: 'application/json; charset=utf-8'
      }).then(function(result) {
        self.logos.pushObject({ src: self.logoUrl, sizes: result.meta.width +'x'+result.meta.height });
        self.set('logoUrl','');
        self.sendAction('action',self.logos);
      });

  }
});
