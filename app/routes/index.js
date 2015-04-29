import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    generator: function () {
      this.transitionTo('generator');
    }
  }
});

Ember.Route.reopen({
  render: function() {
    this._super();
    window.scrollTo(0, 0);
  }
});
