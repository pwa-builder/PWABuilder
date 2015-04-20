import Ember from 'ember';
import ajax from 'ic-ajax';

export default Ember.ObjectController.extend({
    manifestId:'',
    siteUrl:'',
    content:'',
    formattedContent:'',
    file:null,
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
    createManifest:function(){
        var self = this;
        var fd = new FormData();
        if(self.get('siteUrl') != '') {
            fd.append('siteUrl',self.get('siteUrl'));
        } else if(self.get('file')) {
            fd.append('file',self.get('file'));
        }
        console.log("FD:",fd);
        //console.log("FORMDATA:",fd);


        ajax({
            url:'/manifests/',
            type: 'POST',
            data: fd,
            contentType: false,
            processData: false,
        }).then(function(result) {
            console.log("Result:",result);
            self.set('content',result.content);
            self.set('manifestId', result.id);
            self.set('formattedContent', JSON.stringify(result.content, null, 4));
        });
    },
    actions:{
        nextstep:function(stepToActivate){
            var self = this;
            //Activate the next step
            Ember.set(this.steps["step"+stepToActivate], 'active',true);

            if(stepToActivate == 2) {
                self.createManifest();
            }
        },
        usage:function(){
            this.transitionTo('usage');
        },
        manifestUpload:function(manifestFile){
            console.log("MANIFEST CHANGED", manifestFile);
            var self = this;
            self.set('file', manifestFile);
        }
    }
});
