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
  errorMessage: '',
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
    // Setup file to auto-download in the browser when link is set from generator action.
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
      this.set('missingName', this.name.match(/^\s*$/) !== null);
      this.set('missingPublisher', this.publisher.match(/^\s*$/) !== null);
      this.set('missingPackage', this.package.match(/^\s*$/) !== null);
      this.set('missingVersion', this.version.match(/^\s*$/) !== null);

      if (!this.missingName && !this.missingPublisher && !this.missingPackage && !this.missingVersion) {
        this.set('errorMessage', '');
        this.set('showError', false);

        var self = this;
        this.sendAction('action', this.name, this.publisher, this.package, this.version, function (error) {
          if (error) {
            // Check for common/known errors and simplify message
            if (error.indexOf("@Publisher\nPackage creation failed") !== -1) {
              error = "Invalid Publisher Identity.";
            } else if (error.indexOf("@Version\nPackage creation failed.") !== -1) {
              error = "Invalid Version Number.";
            }

            self.set('showError', true);
            self.set('errorMessage', error);
          } else {
            Ember.$('body').removeClass('stop-scroll');
            self.set('showDialog', false);
          }
        });
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