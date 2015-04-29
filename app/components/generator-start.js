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
        this.set('message', 'Please provide a URL or manifest file.');
      } else {
        this.set('message', '');
        this.sendAction('action', siteUrl, file);
      }
    },
    uploadFile: function(file) {
      this.set('file', file);
      this.set('fileName', file.name);
      this.sendAction('upload', file);
    }
  }
});
