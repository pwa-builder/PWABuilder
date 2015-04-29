import Ember from 'ember';

export default Ember.Component.extend({
  isEnabled: true,
  isBuilding: false,
  isNotBuilding: Ember.computed.not('isBuilding'),
  archiveLink: '',
  initialMessage: 'Generate Package',
  buildingMessage: 'Building Package&hellip;',
  tagName: 'li',
  linkMessage: function() {
    var message = '';
    if(this.isBuilding){
      message = this.buildingMessage;
    } else {
      message = this.initialMessage;
    }
    return new Ember.Handlebars.SafeString(message);
  }.property('isBuilding'),
  triggerArchiveDownload: function() {
    ga('send', 'event', 'item', 'click', 'generator-build-download');
    window.location.href = this.archiveLink;
  }.observes('archiveLink'),
  actions: {
    handleClick: function(){
      if(this.isEnabled && !this.isBuilding){
        ga('send', 'event', 'item', 'click', 'generator-build-trigger');
        this.sendAction('action');
      }
    }
  }
});
