import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    generator: function () {
      this.transitionTo('generator');
    }
  },
    beforeModel(/* transition */) {
    this.transitionTo('generator'); // Implicitly aborts the on-going transition.
  }
});

Ember.Route.reopen({
  render: function() {
    this._super();
    window.scrollTo(0, 0);
  }
});
