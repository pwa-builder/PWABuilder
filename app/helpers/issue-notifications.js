/* global pluralize:true */
import Ember from 'ember';

export function issueNotifications(params) {

  var issueNotification = '';
  var errors = params[0] || 0;
  var warnings = params[1] || 0;
  var suggestions = params[2] || 0;

  if(errors > 0){
    issueNotification += pluralize('Error', errors) + ': ' + errors;
  }

  if(warnings > 0){
    if (errors > 0) {
      issueNotification += ', ';
    }
    issueNotification += pluralize('Warning', warnings) + ': ' + warnings;
  }

  if(suggestions > 0){
    if (errors > 0 || warnings > 0) {
      issueNotification += ', ';
    }

    issueNotification += pluralize('Suggestion', suggestions) + ': ' + suggestions;
  }

  return issueNotification;
}

export default Ember.HTMLBars.makeBoundHelper(issueNotifications);
