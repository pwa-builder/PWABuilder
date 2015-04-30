import Ember from 'ember';
import ajax from 'ic-ajax';
import config from '../config/environment';

export default Ember.Component.extend({
  logoUrl: '',
  baseUrl: '',
  actions: {
    addLogo: function(){
      var self = this;

      var imageSrc = self.logoUrl;

      if(imageSrc.charAt(0) === '/'){
        imageSrc = imageSrc.slice(1);
      }


      if(imageSrc.indexOf('http') === -1){
        imageSrc = self.baseUrl + '/' + imageSrc;
      }

      ajax({
        url:config.APP.API_URL+'/images',
        type: 'POST',
        data: JSON.stringify({ image: { src: imageSrc }}),
        dataType: 'json',
        contentType: 'application/json; charset=utf-8'
      }).then(function(result) {
        self.logos.pushObject({ src: self.logoUrl, sizes: result.meta.width +'x'+result.meta.height });
        self.set('logoUrl','');
        self.sendAction('action',self.logos);
      }).catch(function(){
        self.set('logoUrl','');
      });
    },
    removeLogo: function(logo){
      this.logos.removeObject(logo);
      this.sendAction('action',this.logos);
    }
  }
});
