var path = require('path');
var fs = require('fs');
var execSync = require('child_process').execSync;

const ignoreDirs = ['node_modules'];

// function to get package.json from current directory
function getPkgFromCurrentDir() {
  try {
    // var pkg = require(path.join(dir, 'package.json'));
    const pkg = require(path.join(process.cwd(), 'package.json'));
    return pkg;
  } catch (e) {
    return null;
  }
}

// function to get all packages in repo
const getAllPkgs = (startPath = path.join(__dirname, '..')) => {
  let results = {};

  if (!fs.existsSync(startPath)) {
    console.log('no dir ', startPath);
    return;
  }

  var files = fs.readdirSync(startPath);
  for (var i = 0; i < files.length; i++) {
    var filename = path.join(startPath, files[i]);
    var stat = fs.lstatSync(filename);
    if (stat.isDirectory() && ignoreDirs.indexOf(path.basename(filename)) < 0) {
      if (fs.existsSync(path.join(filename, 'package.json'))) {
        let pkg = require(path.resolve(filename, 'package.json'));

        results[pkg.name] = {
          filepath: path.resolve(filename), 
          localDeps: getAllLocalDeps(pkg)
        }
      } else {
        results = {...results, ...getAllPkgs(filename)}; //recurse
      }

    } 
  }

  return results;
}

// returns an array of all local dependencies for a package
function getAllLocalDeps(pkgJson) {
  let deps = [];
  const allDeps = {...(pkgJson.dependencies || {}), ...(pkgJson.devDependencies || {})};
  for (let dep in allDeps) {
    if (allDeps[dep].indexOf('file:') === 0) {
      deps.push(dep);
    }
  }
  return deps;
}

// run npm i and npm run build for a specific package
function setupPackage(packageName, packageLocation) {
  console.info('\x1b[33m%s\x1b[0m', `${packageName}: npm i && npm run build`)
  execSync('npm i && npm run build', {cwd: packageLocation, stdio: 'inherit'});
  console.info('\x1b[33m%s\x1b[0m', `${packageName}: finished`)

}

// function to recursively run npm i and npm run build on all dependencies 
// this will not work if there are circular dependencies
function setupAllDeps(packageName, allPackages, mainPackage = packageName) {
  const package = allPackages[packageName];
  if (package) {
    // iterate through all packages and setup
    for (let dependency of package.localDeps) {
      setupAllDeps(dependency, allPackages, mainPackage);
    }

    // only setup if not the calling package
    if (packageName !== mainPackage) {
      setupPackage(packageName, allPackages[packageName].filepath);
    }
  }
}

const currentPackage = getPkgFromCurrentDir();
if (currentPackage) {
  console.info('\x1b[36m%s\x1b[0m', `Initializing all local dependencies for package ${currentPackage.name}`);
  const pkgs = getAllPkgs();
  setupAllDeps(currentPackage.name, pkgs);
} else {
  console.log('no package.json found in current directory');
}