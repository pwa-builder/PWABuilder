var path = require('path');
var fs = require('fs');

const ignoreDirs = ['node_modules'];

// function to get package.json from current directory
const getPkgFromCurrentDir = () => {
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
          localDeps: getAllLocalDeps(pkg),
          json: pkg
        }
      } else {
        results = {...results, ...getAllPkgs(filename)}; //recurse
      }

    } 
  }

  return results;
}

// returns an array of all local dependencies for a package
const getAllLocalDeps = (pkgJson) => {
  let deps = [];
  const allDeps = {...(pkgJson.dependencies || {}), ...(pkgJson.devDependencies || {})};
  for (let dep in allDeps) {
    if (allDeps[dep].indexOf('file:') === 0) {
      deps.push(dep);
    }
  }
  return deps;
}

// function to recursively run npm i and npm run build on all dependencies 
// this will not work if there are circular dependencies
const getAllDepsInOrder = (packageName, allPackages, mainPackage = packageName, completedDeps = new Set()) => {
  const currentPackage = allPackages[packageName];
  let results = [];

  if (completedDeps.has(packageName)) {
    return [];
  }

  if (currentPackage) {
    // iterate through all packages and setup
    for (let dependency of currentPackage.localDeps) {
      results = [...results, ...getAllDepsInOrder(dependency, allPackages, mainPackage, completedDeps, results)];
    }

    // only setup if not the calling package
    if (packageName !== mainPackage) {
      results.push(packageName);
    }

    completedDeps.add(packageName);
  }

  return results;
}

module.exports.getPkgFromCurrentDir = getPkgFromCurrentDir;
module.exports.getAllPkgs = getAllPkgs;
module.exports.getAllDepsInOrder = getAllDepsInOrder;
module.exports.getAllLocalDeps = getAllLocalDeps;