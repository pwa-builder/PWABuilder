/* global Prism */

import Ember from 'ember';
import ajax from 'ic-ajax';

export default Ember.Controller.extend({
  createManifest:function () {
    //this.model.set('steps.step1.active',true);
    /*var fd = new FormData();
    if(scope.get('siteUrl') !== '') {
      fd.append('siteUrl',scope.get('siteUrl'));
    } else if(scope.get('file')) {
      fd.append('file',scope.get('file'));
    }
    ajax({
      url:'/manifests/',
      type: 'POST',
      data: fd,
      contentType: false,
      processData: false
    }).then(function (result) {
      scope.set('content',result.content);
      scope.set('manifestId', result.id);
      scope.set('formattedContent', JSON.stringify(result.content, null, 4));
    });
    var el = scope.$('.manifest-body');
    Prism.highlightElement(el[0]);*/
  },
  actions:{
    toggleStep: function (index) {

      /*var steps = this.model.get('steps');

      console.log(steps);

      steps.forEach(function (step) {
        console.log(step);
        step.active = false;
        step.current = false;
        //step.set('active', false);
        //step.set('current', false);
      });

      var step = this.model.get('steps').objectAt(index);

      Ember.set(step, 'active', true);
      Ember.set(step, 'current', true);*/

    },
    nextstep:function (stepToActivate){
      //Activate the next step
      /*Ember.set(this.steps['step' + stepToActivate], 'active',true);
      if(stepToActivate === 2) {
        this.createManifest();
      }*/
    },
    usage:function () {
      this.transitionTo('usage');
    },
    manifestUpload:function (manifestFile){
      this.set('file', manifestFile);
    }
  }
});
