const env = require(`./environments/${process.env.NODE_ENV}`)
module.exports = {
  src_folders : ['./test-e2e'],
  output_folder : './e2e-logs/',
  selenium : {
    start_process : false,
    log_path : '.e2e-logs'
  }, 
  test_settings: {
    default: {
      launch_url: env.baseUrl,
      selenium_host: 'localhost',
      selenium_port : '4444',
      silent: true,
      desiredCapabilities: {
        browserName: 'chrome',
        javascriptEnabled: true
      },
      screenshots: {
        enabled: true,
        path: '.e2e-logs',
        on_failure: true,
        on_error: true
      },
    }
  }
};