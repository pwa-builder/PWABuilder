const customSettings = {
  screenEmulation: { mobile: false }, // Defaults to false, but overridden by the CLI flag
  logLevel: "silent",
  maxWaitForFcp: 10 * 1000,
  maxWaitForLoad: 15 * 1000,
  pauseAfterFcpMs: 250,
  pauseAfterLoadMs: 250,
  pauseAfterNetworkQuietMs: 250,
  pauseAfterCPUIdleMs: 250,
  networkQuietThresholdMs: 250,
  cpuQuietThresholdMs: 250,

  throttling: {
    rttMs: 0,
    throughputKbps: 0,
    requestLatencyMs: 0,
    downloadThroughputKbps: 0,
    uploadThroughputKbps: 0,
    cpuSlowdownMultiplier: 1,
  },
  throttlingMethod: "provided",

  auditMode: false,
  gatherMode: false,
  disableStorageReset: true,
  debugNavigation: false,
  channel: "node",
  usePassiveGathering: false,
  disableFullPageScreenshot: true,
  skipAboutBlank: true,
  blankPage: "about:blank",

  budgets: null,
  locale: "en-US",
  blockedUrlPatterns: null,
  additionalTraceCategories: null,
  extraHeaders: null,
  precomputedLanternData: null,
  onlyAudits: null,
  onlyCategories: null,
  skipAudits: null,
};

export default customSettings;
