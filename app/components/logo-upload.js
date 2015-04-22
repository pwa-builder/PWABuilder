import Ember from 'ember';
import ajax from 'ic-ajax';

export default Ember.Component.extend({
  logoUrl: "",
  logos: Ember.A(),
  actions: {
    addLogo: function(){
      var self = this;

      ajax({
        url:'/images/',
        type: 'POST',
        data: JSON.stringify({ image: { src: self.logoUrl }}),
        dataType: 'json',
        contentType: 'application/json; charset=utf-8'
      }).then(function(result) {
        self.logos.pushObject({ src: self.logoUrl, meta: result.meta });
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
