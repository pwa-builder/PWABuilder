var { getPkgFromCurrentDir, getAllPkgs, getAllDepsInOrder } =  require('./fileHelpers.js');
var { exec } = require('child_process');
var kill  = require('tree-kill');
var chalk = require('chalk');

const processes = [];

const cleanUp = () => {
  console.log('exiting, need to clean up');

  for (let proc of processes) {
    kill(proc.pid, 'SIGINT');
  }

  setTimeout(() => {
    process.exit();
  }, 2000)
};

if (process.platform === "win32") {
  var rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on("SIGINT", function () {
    process.emit("SIGINT");
  });
}

//do something when app is closing
process.on('exit', () => {cleanUp()});

//catches ctrl+c event
process.on('SIGINT', () => {cleanUp()});

//catches uncaught exceptions
process.on('uncaughtException', () => {cleanUp()});

const envVar = 'PWABUILDER_BUILD_WATCH';

// skip running if already in running
if (process.env[envVar]) {
  return;
}


try {
  process.env[envVar] = 'true'

  const currentPackage = getPkgFromCurrentDir();
  if (currentPackage) {
    console.info('\x1b[36m%s\x1b[0m', `Watching dependencies for ${currentPackage.name}`);
    
    const allPackages = getAllPkgs();
    const dependencies = getAllDepsInOrder(currentPackage.name, allPackages);

    for (let dependency of dependencies) {
      const pkg = allPackages[dependency];

      const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);

      const proc = exec("npm run build:watch", {cwd: pkg.filepath});

      // const proc = spawn('npm.cmd run build:watch', {cwd: pkg.filepath, stdio: 'inherit'})

      proc.stdout.on('data', function (data) {
        console.log(chalk.hex(randomColor).bold(dependency + ': '), data.toString());
      });
      
      proc.stderr.on('data', function (data) {
        console.log(chalk.hex(randomColor).bold(dependency + ': '), data.toString());
      });
      
      proc.on('exit', function (code) {
        console.log(chalk.hex(randomColor).bold(dependency + ':'), ' exited');
      });

      processes.push(proc);
    }
  } else {
    console.log('no package.json found in current directory');
  }
} catch (e) {
  throw (e);
} finally {
  delete process.env[envVar];
}