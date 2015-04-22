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
    this.route('usage'); //Usage page
    this.route('about'); //Usage page
    this.route('documentation'); //Usage page
    this.route('contribute'); //Usage page
    this.route('style-guide'); //Style guide
});
