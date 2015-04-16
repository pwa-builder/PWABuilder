import Ember from 'ember';

export default Ember.View.extend({
	initialize: function(){
		var scope = this;

		scope.$(".step header").click(function(e){
			$(this).parent(".step").toggleClass("current");
		});
	}.on('didInsertElement'),
	stepChange: function(){
		var scope = this;
		Ember.run.scheduleOnce('afterRender', function(){
			console.log("CHANGE");
			var $prevItems = scope.$(".active.current").not(":last");
			$prevItems.removeClass("current");
			$("button", $prevItems).hide();
		});
	}.observes(
		'controller.steps.step1.active',
		'controller.steps.step2.active',
		'controller.steps.step3.active',
		'controller.steps.step4.active',
		'controller.steps.step5.active',
		'controller.steps.step6.active')
});
