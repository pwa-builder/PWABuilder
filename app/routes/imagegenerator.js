import Ember from 'ember';
import config from '../config/environment';

export default Ember.Route.extend({
  redirect: function () {
      window.location.replace(config.APP.IMAGEGENERATOR_URL);
    }
});
