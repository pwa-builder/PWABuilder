import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'manifoldjs-site/tests/helpers/start-app';

var application;

module('Acceptance: Content', {
  beforeEach: function() {
    application = startApp();
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('visiting home', function(assert) {
  visit('/');

  andThen(function() {
    var navs = find("nav > ul > li");
    assert.equal(navs.length, 6);
  });
});
