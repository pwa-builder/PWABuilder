import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

export default Router.map(function() {
    this.resource('generator', function () {
      this.route('step1');
      this.route('step2');
    }); //Generator page
    this.route('deploy');
    this.route('about');
    this.route('documentation');
    this.route('community');
    this.route('style-guide');
    this.route('license');
});
