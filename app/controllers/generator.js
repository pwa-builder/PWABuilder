import Ember from 'ember';
import ajax from 'ic-ajax';

export default Ember.ObjectController.extend({
    manifestId:'',
    siteUrl:'',
    content:null,
    steps:{
        step1: {
            id:"step1",
            active:true,
        },
        step2:{
            id:"step2",
            active:false,
        },
        step3:{
            id:"step3",
            active:false,
        },
        step4:{
            id:"step4",
            active:false,
        },
        step5:{
            id:"step5",
            active:false,
        },
        step6:{
            id:"step6",
            active:false,
        },
        step7:{
            id:"step7",
            active:false,
        },
    },
    actions:{
        nextstep:function(stepToActivate){
            var self = this;
            //Activate the next step
            Ember.set(this.steps["step"+stepToActivate], 'active',true);

            if(stepToActivate == 2) {
                //console.log(self.data.get('siteUrl'));
                //console.log(ajax);
                //var content = ajax.request('http://localhost:3000/manifests/');
                ajax({
                    url:'/manifests/',
                    type: 'POST',
                    data:{
                        siteUrl:self.get('siteUrl')
                    }
                }).then(function(result) {
                    console.log("Result:",result);
                    self.set('content',result.content);
                    self.set('manifestId', result.id);
                  // result.response
                  // result.textStatus
                  // result.jqXHR
                });

            }
        },
        usage:function(){
            this.transitionTo('usage');
        }
    }
});
