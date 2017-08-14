/* global Prism:true */ 

import Ember from 'ember';

export default Ember.Component.extend({
	didInsertElement: (function(){
		var codeElement = this.$("code")[0];
		if(codeElement && codeElement.textContent && codeElement.textContent.length){
			Prism.highlightElement(codeElement);
		}
	}),
	tagName:'pre',
  	schedulePrism: (function(){
    	// scheduleOnce debounces prism highlighting to only run once per
    	// runloop. highlighting is called on didInsertElement, and
    	// whenever model.formattedManifest changes.
    	Ember.run.scheduleOnce('afterRender', this, this.highlightTime);
  	}).observes('data.formattedManifest'),
  	highlightTime: (function(){
  		Prism.highlightElement(this.$("code")[0]);
  	})
});
