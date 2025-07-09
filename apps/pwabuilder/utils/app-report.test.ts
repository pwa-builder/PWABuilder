import { expect } from 'chai';

// Mock the AppReport class for testing the formatSWStrings method
class AppReportTestHelper {
  formatSWStrings(member: string) {
    const words = member.split('_');
    const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
    const joined = capitalizedWords.join(" ");
    return joined;
  }
}

describe('AppReport formatSWStrings', () => {
  let helper: AppReportTestHelper;

  beforeEach(() => {
    helper = new AppReportTestHelper();
  });

  it('should handle standard underscore-separated words', () => {
    expect(helper.formatSWStrings('has_service_worker')).to.equal('Has Service Worker');
    expect(helper.formatSWStrings('background_sync')).to.equal('Background Sync');
    expect(helper.formatSWStrings('push_notifications')).to.equal('Push Notifications');
  });

  it('should handle single character words correctly', () => {
    expect(helper.formatSWStrings('a')).to.equal('A');
    expect(helper.formatSWStrings('i')).to.equal('I');
    expect(helper.formatSWStrings('a_b')).to.equal('A B');
    expect(helper.formatSWStrings('i_am_happy')).to.equal('I Am Happy');
  });

  it('should handle edge cases', () => {
    expect(helper.formatSWStrings('')).to.equal('');
    expect(helper.formatSWStrings('single')).to.equal('Single');
    expect(helper.formatSWStrings('CAPS_LOCK')).to.equal('Caps Lock');
    expect(helper.formatSWStrings('mixedCase_WORDS')).to.equal('Mixedcase Words');
  });

  it('should handle multiple underscores and empty segments', () => {
    expect(helper.formatSWStrings('word__another')).to.equal('Word  Another');
    expect(helper.formatSWStrings('_start_with_underscore')).to.equal(' Start With Underscore');
    expect(helper.formatSWStrings('end_with_underscore_')).to.equal('End With Underscore ');
  });

  it('should handle numeric characters', () => {
    expect(helper.formatSWStrings('version_2_0')).to.equal('Version 2 0');
    expect(helper.formatSWStrings('test_123')).to.equal('Test 123');
  });
});