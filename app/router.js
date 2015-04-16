import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

export default Router.map(function() {
	this.route('generator'); //Generator page
	this.route('usage'); //Usage page
	this.route('about'); //Usage page
	this.route('documentation'); //Usage page
	this.route('contribute'); //Usage page
	this.route('style-guide'); //Style guide
});
