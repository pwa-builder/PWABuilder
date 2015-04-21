/* global Prism */
import Ember from 'ember';
import ajax from 'ic-ajax';

export default Ember.Controller.extend({
  manifestId: '',
  siteUrl: '',
  content: '',
  formattedContent: '',
  file: null,
  steps:{
    step1: {
      id: 'step1',
      active:true
    },
    step2:{
      id: 'step2',
      active:false
    },
    step3:{
      id: 'step3',
      active:false
    },
    step4:{
      id: 'step4',
      active:false
    },
    step5:{
      id: 'step5',
      active:false
    },
    step6:{
      id: 'step6',
      active:false
    },
    step7:{
      id: 'step7',
      active:false
    }
  },
  createManifest:function () {
    var scope = this;
    var fd = new FormData();
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
    Prism.highlightElement(scope.$('.manifest-body'));
  },
  actions:{
    nextstep:function (stepToActivate){
      //Activate the next step
      Ember.set(this.steps['step' + stepToActivate], 'active',true);
      if(stepToActivate === 2) {
        this.createManifest();
      }
    },
    usage:function () {
      this.transitionTo('usage');
    },
    manifestUpload:function (manifestFile){
      this.set('file', manifestFile);
    }
  }
});
