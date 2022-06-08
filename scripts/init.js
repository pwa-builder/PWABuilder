const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports.setupScripts = () => {

  // check if node_modules exists in current script directory
  if (!fs.existsSync(path.join(__dirname, '/node_modules'))) {
    // make sure we have all dependencies before running rest of script
    execSync("npm i", {cwd: __dirname});
  }

}
