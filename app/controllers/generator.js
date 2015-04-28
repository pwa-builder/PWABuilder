/* global _:true */

import Ember from 'ember';

export default Ember.Controller.extend({
  step1Complete: false,
  steps: Ember.Object.create({
    step1: {
      name: 'step1',
      isCurrent: true
    },
    step2: {
      name: 'step2',
      isCurrent: false
    },
    step3: {
      name: 'step3',
      isCurrent: false
    },
    step4: {
      name: 'step4',
      isCurrent: false
    },
    step5: {
      name: 'step5',
      isCurrent: false
    }
  }),
  selectedDisplay: null,
  selectedOrientation: null,
  valueOrEmptyString: function (value) {
    if(value) {
      return value;
    } else {
      return '';
    }
  },
  customMembers: function(){
    var staticValues = ['lang','name','short_name','scope','icons','display','orientation','start_url','theme_color','related_applications','prefer_related_applications'];
    var model = this.get('model');
    var keys = _.keys(model.manifest);
    var customKeys = _.difference(keys,staticValues);
    var customProps = _.map(customKeys,function(key){
      var data = {
        member_name: key,
        member_value: model.manifest[key]
      };
      return data;
    });

    return customProps;
  }.property('model'),
  watchDisplay: function() {
    var selected = this.get('selectedDisplay');
    this.send('updateModelProperty', 'display', this.valueOrEmptyString(selected));
  }.observes('selectedDisplay'),
  watchOrientation: function() {
    var selected = this.get('selectedOrientation');
    this.send('updateModelProperty', 'orientation', this.valueOrEmptyString(selected));
  }.observes('selectedOrientation'),
  actions: {
    updateStep: function(currentStep, nextStep) {
      if(currentStep) {
        this.set('steps.step'+currentStep+'.isCurrent', false);
        if(currentStep === '1') {
          this.set('step1Complete',true);
        }
      }
      if(nextStep){
        this.set('steps.step'+nextStep+'.isCurrent', true);
      }
      this.model.save();
    }
  }
});

