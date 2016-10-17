import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Ember.Router.reopen({
  notifyGoogleAnalytics: function() {
    if (!this.ga) { return; }
    return this.ga('send', 'pageview', {
        'page': this.get('url'),
        'title': this.get('url')
      });
  }.on('didTransition')
});

export default Router.map(function() {
    this.resource('generator', function () {
      this.route('step1');
      this.route('step2');
    }); //Generator page
    this.route('deploy');
    this.route('about');
    this.route('style-guide');
    this.route('license');
});
