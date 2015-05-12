import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'manifoldjs-site/tests/helpers/start-app';

var App;

module('Acceptance: Content', {
  beforeEach: function() {
    App = startApp();
    var mockGa = function(){};
    App.register('ga:main',mockGa,{ instantiate: false });
  },

  afterEach: function() {
    Ember.run(App, 'destroy');
  }
});

test('visiting home', function(assert) {
  visit('/');

  andThen(function() {
    var navs = find("nav > ul > li");
    assert.equal(navs.length, 5);
  });
});
