export function initialize(container, app) {
  var ga = window.ga || {};

  app.register('ga:main', ga, {instantiate: false});
  app.inject('router','ga','ga:main');
  app.inject('route','ga','ga:main');
  app.inject('controller','ga','ga:main');
  app.inject('view','ga','ga:main');
}

export default {
  name: 'register-google-analytics',
  initialize: initialize
};
