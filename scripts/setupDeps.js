var { getPkgFromCurrentDir, getAllPkgs, getAllDepsInOrder } =  require('./fileHelpers.js');

var execSync = require('child_process').execSync;


const envVar = 'PWABUILDER_PREINSTALL';

// skip running if already in running
if (process.env[envVar]) {
  return;
}

// run npm i and npm run build for a specific package
function setupPackage(pkg) {
  console.info('\x1b[33m%s\x1b[0m', `${pkg.json.name}: npm i `)
  execSync('npm i && npm run build', {cwd: pkg.filepath, stdio: 'inherit'});
  console.info('\x1b[33m%s\x1b[0m', `${pkg.json.name}: finished`)

}

try {
  process.env[envVar] = 'true'

  const currentPackage = getPkgFromCurrentDir();
  if (currentPackage) {
    console.info('\x1b[36m%s\x1b[0m', `Initializing all local dependencies for package ${currentPackage.name}`);
    const allPackages = getAllPkgs();

    const dependencies = getAllDepsInOrder(currentPackage.name, allPackages);

    for (let dependency of dependencies) {
      const pkg = allPackages[dependency];
      setupPackage(pkg);
    }
  } else {
    console.log('no package.json found in current directory');
  }
} catch (e) {
  throw (e);
} finally {
  delete process.env[envVar];
}