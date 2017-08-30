import Ember from 'ember';

export default Ember.Component.extend({
  isEnabled: true,
  isBuilding: false,
  isNotBuilding: Ember.computed.not('isBuilding'),
  initialMessage: 'Generate Package',
  buildingMessage: 'Publishing Package&hellip;',
  failedMessage: 'Try Again?',
  successMessage: 'Package Published!',
  tagName: 'span',
  showDialog: false,
  showError: false,
  name: '',
  email: '',
  missingName: false,
  invalidEmail: false,
  linkMessage: function() {
    var message = '';
    if(this.isBuilding){
      message = this.buildingMessage;
    } else if(this.buildFailed){
      message = this.failedMessage;
    } else if (this.publishSuccedded) {
        message = this.successMessage;
        var that = this;
        setTimeout(function() {
          message = that.initialMessage;
          that.notifyPropertyChange('isBuilding');
        }, 4000);
    } else {
      message = this.initialMessage;
    }
    return new Ember.Handlebars.SafeString(message);
  }.property('isBuilding'),
  actions: {
    handleClick: function(){
      if(this.isEnabled && !this.isBuilding) {
        Ember.$('body').addClass('stop-scroll');
        this.set('showDialog', true);
      } else if (!this.isEnabled) {
        this.set('showError', true);
      }
    },
    close: function() {
      Ember.$('body').removeClass('stop-scroll');
      this.set('invalidEmail', false);
      this.set('missingName', false);
      this.set('showDialog', false);
      this.set('showError', false);
      this.set('publishSuccedded', false);
    },
    accept: function(){
      var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      this.set('invalidEmail', !emailRegex.test(this.email));
      this.set('missingName', this.name === '');

      if (!this.missingName && !this.invalidEmail) {
        Ember.$('body').removeClass('stop-scroll');
        this.set('showDialog', false);
        this.sendAction('action', this.name, this.email);
      }
    },
    startOver: function() {
      this.set('invalidEmail', false);
      this.set('missingName', false);
      this.set('showDialog', false);
      this.set('showError', false);
      this.sendAction('startOver', this.name, this.email);
    }
  }
});