import Ember from 'ember';

export default Ember.Component.extend({
  siteUrl: null,
  file: null,
  fileName: null,
  message: '',
  isSaving: false,
  actions:{
    startComplete: function(){
      var siteUrl = this.get('siteUrl');
      var file = this.get('file');
      if(!siteUrl && !file){
        this.set('message', 'Please provide a URL.');
      } else {
        this.set('message', '');
        this.sendAction('action', siteUrl, file);
      }
    },
    goToSecondStep: function() {
      let controller = this.get('parentView.parentView.controller');
      controller.setActiveStep(controller.get('steps')[1].step);
    }
  }
});
