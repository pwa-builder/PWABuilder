import Ember from 'ember';
import ajax from 'ic-ajax';
import config from '../config/environment';

export default Ember.Component.extend({
  logoUrl: "",
  logos: Ember.A(),
  actions: {
    addLogo: function(){
      var self = this;
      ajax({
        url:config.APP.API_URL+'/images',
        type: 'POST',
        data: JSON.stringify({ image: { src: self.logoUrl }}),
        dataType: 'json',
        contentType: 'application/json; charset=utf-8'
      }).then(function(result) {
        self.logos.pushObject({ src: self.logoUrl, sizes: result.meta.width +'x'+result.meta.height });
        self.set('logoUrl','');
        self.sendAction('action',self.logos);
      });
    },
    removeLogo: function(logo){
      this.logos.removeObject(logo);
      this.sendAction('action',this.logos);
    }
  }
});
