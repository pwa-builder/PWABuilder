import Ember from 'ember';

export default Ember.Component.extend({
  disabled: true,
  isGenerating: false,
  initialMessage: 'Generate Package',
  buildingMessage: 'Building Package&hellip;',
  buttonMessage: function() {
    var message = '';
    if(this.isGenerating){
      message = this.buildingMessage;
    } else {
      message = this.initialMessage;
    }
    return new Ember.Handlebars.SafeString(message);
  }.property('isGenerating'),
  actions: {
    requestArchive: function(){
      this.set('disabled', true);
      this.set('isGenerating', true);
      this.sendAction('action', this);
    }
  }
});
