const defaultSettings = {
  output: 'json',
  maxWaitForFcp: 10 * 1000,
  maxWaitForLoad: 15 * 1000,
  pauseAfterFcpMs: 1,
  pauseAfterLoadMs: 1,
  networkQuietThresholdMs: 1,
  cpuQuietThresholdMs: 1,

  formFactor: 'desktop',
  throttling: {
    rttMs: 0,
    throughputKbps: 0,
    requestLatencyMs: 0,
    downloadThroughputKbps: 0,
    uploadThroughputKbps: 0,
    cpuSlowdownMultiplier: 1,
  },
  throttlingMethod: 'provided',

  auditMode: false,
  gatherMode: false,
  disableStorageReset: true,
  debugNavigation: false,
  channel: 'node',
  usePassiveGathering: false,
  disableFullPageScreenshot: true,
  skipAboutBlank: true,
  blankPage: 'about:blank',

  // the following settings have no defaults but we still want ensure that `key in settings`
  // in config will work in a typechecked way
  budgets: null,
  locale: 'en-US', // actual default determined by Config using lib/i18n
  blockedUrlPatterns: null,
  additionalTraceCategories: null,
  extraHeaders: null,
  precomputedLanternData: null,
  onlyAudits: null,
  onlyCategories: null,
  skipAudits: null,
};

export default defaultSettings;
