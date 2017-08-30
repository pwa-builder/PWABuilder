import Ember from 'ember';

export default Ember.Component.extend({
  isEnabled: true,
  isBuilding: false,
  isNotBuilding: Ember.computed.not('isBuilding'),
  initialMessage: 'Generate AppX',
  buildingMessage: 'Generating AppX&hellip;',
  failedMessage: 'Try Again?',
  successMessage: 'Download AppX',
  tagName: 'span',
  showDialog: false,
  showError: false,
  name: '',
  publisher: '',
  package: '',
  version: '',
  missingName: false,
  missingPublisher: false,
  missingPackage: false,
  missingVersion: false,
  archiveLink: '',
  platform: 'appx',
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
      if(this.isEnabled && !this.isBuilding) {
        // Prevent page from scrolling, so inner-div can scroll instead.
        Ember.$('body').addClass('stop-scroll');
        this.set('showDialog', true);
      } else if (!this.isEnabled) {
        this.set('showError', true);
      }
    },
    close: function() {
      Ember.$('body').removeClass('stop-scroll');
      this.set('missingName', false);
      this.set('missingPublisher', false);
      this.set('missingPackage', false);
      this.set('missingVersion', false);
      this.set('showDialog', false);
      this.set('showError', false);
    },
    accept: function(){
      // TODO: More Client-Side Validation Here
      this.set('missingName', this.name === '');
      this.set('missingPublisher', this.publisher === '');
      this.set('missingPackage', this.package === '');
      this.set('missingVersion', this.version === '');


      if (!this.missingName && !this.missingPublisher && !this.missingPackage && !this.missingVersion) {
        Ember.$('body').removeClass('stop-scroll');
        this.set('showDialog', false);
        this.sendAction('action', this.name, this.publisher, this.package, this.version);
        // TODO: Hook-in to error result and display other dialog properly
      }
    },
    startOver: function() {
      this.set('missingName', false);
      this.set('missingPublisher', false);
      this.set('missingPackage', false);
      this.set('missingVersion', false);
      this.set('showError', false);
      this.sendAction('startOver', this.name, this.publisher, this.package, this.version);
    }
  }
});