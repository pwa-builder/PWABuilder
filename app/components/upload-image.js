import Ember from 'ember';
const PLACEHOLDER = 'Choose File';

export default Ember.Component.extend({
    isEnabled: true,
    message: 'Or upload an image...',
    showDialog: false,
    classNames: ['l-inline'],
    fileName: PLACEHOLDER,
    fileInfo: null,
    generateMissingSizes: true,
    isSaving: false,
    showErrorMessage: false,
    actions: {
        accept: function() {
            this.set('isSaving', true);
            var self = this;
            this.sendAction('action', this.fileInfo, this.generateMissingSizes, function(error) {
                self.set('isSaving', false);
                if (error) {
                    self.set('showErrorMessage', true);
                } else {
                    Ember.$('body').removeClass('stop-scroll');
                    self.set('showDialog', false);

                    self.set('fileName', PLACEHOLDER);
                    self.set('fileInfo', null);
                    self.set('generateMissingSizes', true);
                }
            });
        }, 
        close: function() {
            Ember.$('body').removeClass('stop-scroll');
            this.set('fileName', PLACEHOLDER);
            this.set('showDialog', false);
        },
        showPopup : function() {
            Ember.$('body').addClass('stop-scroll');
            this.set('showDialog', true);
        },
        uploadFile: function(fileInfo) {
            this.set('fileName', fileInfo.name);
            this.set('fileInfo', fileInfo);
        }
    }
});