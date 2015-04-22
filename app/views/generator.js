import Ember from 'ember';

export default Ember.View.extend({
	initialize: function () {
		var scope = this;
    // Set focus on the Url
    scope.$('input').first().focus();
		/*scope.$('.step header').click(function (event) {
      // Prevent this from being clickable if it's not active
      if(!this.active){
        event.preventDefault();
      }
			scope.$(this).parent('.step').toggleClass('current');
		});*/
	}.on('didInsertElement'),
	stepChange: function () {
		var scope = this;
		Ember.run.scheduleOnce('afterRender', function () {
			var $prevItems = scope.$('.active.current').not(':last');
			$prevItems.removeClass('current');
			scope.$('button', $prevItems).hide();
		});
	}.observes(
		'controller.steps.step1.active',
		'controller.steps.step2.active',
		'controller.steps.step3.active',
		'controller.steps.step4.active',
		'controller.steps.step5.active',
		'controller.steps.step6.active')
});
