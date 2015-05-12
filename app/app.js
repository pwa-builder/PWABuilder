import Ember from 'ember';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';
import config from './config/environment';

Ember.MODEL_FACTORY_INJECTIONS = true;

var App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver: Resolver
});

//Allow data-eventname to be set on link-to's
Ember.LinkView.reopen({
	attributeBindings: ['data-eventname']
});

loadInitializers(App, config.modulePrefix);

export default App;
