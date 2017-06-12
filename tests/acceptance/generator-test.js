import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import { defineFixture } from 'ic-ajax';
import startApp from 'pwabuilder-site/tests/helpers/start-app';

var App;

module('Acceptance: Generator', {
  beforeEach: function() {
    App = startApp();
    App.register('ga:main',function(){},{ instantiate: false });
    defineFixture('http://testserver/manifests/',{
      response: {
        "content":{
          "start_url":"http://bing.com",
          "short_name":"BingCom"
        },
        "format":"w3c",
        "id":"123",
        "errors":[],
        "suggestions":[],
        "warnings":[]
      },
      jqXHR: {},
      textStatus: 'success'
    });
  },

  afterEach: function() {
    Ember.run(App, 'destroy');
  }
});

test('shows the form after a url is submitted',function(assert){
  visit('/generator');
  fillIn('.form-item.url > input','bing.com');
  click('.get-started');
  andThen(function(){
    var shortNameInput = find('input[name=short_name]');
    assert.equal(shortNameInput.length,1);
    assert.equal(shortNameInput.val(),'BingCom');
  });
});
