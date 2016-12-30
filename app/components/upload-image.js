
import Ember from 'ember';

export default Ember.Component.extend({
    isEnabled: true,
    message: 'Or upload an image...',
    showDialog: false,
    fileName: undefined,
    fileInfo: undefined,
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
                    self.set('showDialog', false);

                    self.set('fileName', undefined);
                    self.set('fileInfo', undefined);
                    self.set('generateMissingSizes', true);
                }
            });
        }, 
        close: function() {
            this.set('showDialog', false);
        },
        showPopup : function() {
            this.set('showDialog', true);
        },
        uploadFile: function(fileInfo) {
            this.set('fileName', fileInfo.name);
            this.set('fileInfo', fileInfo);
        }
    }
});