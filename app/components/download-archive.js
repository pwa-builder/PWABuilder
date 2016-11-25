import Ember from 'ember';

export default Ember.Component.extend({
  isEnabled: true,
  isBuilding: false,
  isNotBuilding: Ember.computed.not('isBuilding'),
  archiveLink: '',
  platform: '',
  initialMessage: 'Generate Package',
  buildingMessage: 'Building Package&hellip;',
  failedMessage: 'Try Again?',
  tagName: 'span',
  linkMessage: function() {
    var message = '';
    if(this.isBuilding){
      message = this.buildingMessage;
    } else if(this.buildFailed){
      message = this.failedMessage;
    } else {
      message = this.initialMessage;
    }
    return new Ember.Handlebars.SafeString(message);
  }.property('isBuilding'),
  triggerArchiveDownload: function() {
    this.sendAction('download', this.archiveLink, this.platform);
  }.observes('archiveLink'),
  actions: {
    handleClick: function(){
      if(this.isEnabled && !this.isBuilding){
        this.sendAction('action', this.platform);
      }
    }
  }
});
