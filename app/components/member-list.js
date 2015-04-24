import Ember from 'ember';

export default Ember.Component.extend({
  member_name: '',
  member_value: '',
  members: Ember.A(),
  actions: {
    addMember: function () {
      var member = {};
      var members = this.get('members');
      var member_name = this.get('member_name');
      var member_value = this.get('member_value');
      if(member_name && member_value) {
        member.member_name = member_name;
        member.member_value = member_value;
        members.pushObject(member);
        this.sendAction('action', 'add', member);
      }
    },
    removeMember: function(member){
      var members = this.get('members');
      members.removeObject(member);
      this.sendAction('action', 'remove', member);
    }
  }
});
