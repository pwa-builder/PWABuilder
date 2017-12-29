module.exports = {
  src_folders : ['./test-e2e'],
  output_folder : './e2e-logs/',
  selenium : {
    start_process : false,
    log_path : './e2e-logs/'
  }, 
  test_settings: {
    default: {
    launch_url: 'localhost:3000',
    selenium_host: '127.0.0.1',
    selenium_port : '4444',
      silent: true
    }
  }
};