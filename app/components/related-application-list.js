
import Ember from 'ember';

export default Ember.Component.extend({
    relatedApp_platform: '',
    relatedApp_url: '',
    relatedApp_id: '',
    relatedApplications: Ember.A(),
    preferRelatedApplications: false,
    showAlert: false,
    memberAlert: '',
    actions: {
        addRelatedApplication: function () {
            var self = this;

            function validateApplication() {
                self.set('showAlert', false);
                self.set('memberAlert', '');

                var platform = self.get('relatedApp_platform'),
                    url = self.get('relatedApp_url'),
                    id = self.get('relatedApp_id');
                if (!platform) {
                    self.set('showAlert', true);
                    self.set('memberAlert', 'You must enter the Platform.');
                    return false;
                }

                if (!url && !id) {
                    self.set('showAlert', true);
                    self.set('memberAlert', 'You must enter either the URL or ID.');
                    return false;
                }
                
                var urlRegExpr = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.?[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
                if (url && !urlRegExpr.test(url)) {
                    self.set('showAlert', true);
                    self.set('memberAlert', 'You must enter a valid URL.');
                    return false;
                }

                return true;
            }

            if (validateApplication()) {
                var relatedApplication = {
                    platform: this.get('relatedApp_platform')
                };
                if (this.get('relatedApp_url')) {
                    relatedApplication.url = this.get('relatedApp_url');
                }
                if (this.get('relatedApp_id')) {
                    relatedApplication.id = this.get('relatedApp_id');
                }

                self.set('relatedApp_platform', '');
                self.set('relatedApp_url', '');
                self.set('relatedApp_id', '');
                
                var _relatedApplications = this.get('relatedApplications');
                _relatedApplications.pushObject(relatedApplication);

                self.sendAction('action', 'related_applications', _relatedApplications);
            }
        },
        removeRelatedApplication: function(relatedApp) {
            var _relatedApplications = this.get('relatedApplications');
            _relatedApplications.removeObject(relatedApp);
            
            this.sendAction('action', 'related_applications', _relatedApplications);
        },
        updatepreferRelatedApplications: function() {
            this.sendAction('action', 'prefer_related_applications', !this.preferRelatedApplications);            
        }.observes("preferRelatedApplications")
    }
});