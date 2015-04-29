import Ember from 'ember';

export default Ember.View.extend({
	classNames:['application'],
	didInsertElement:function(){
		//Analytics Event Tracking
		$(".event").click(function(){
			ga('send', 'event', 'item', 'click', $(this).data('eventname'));
		});
	}
});
