var path = require('path');
var fs = require('fs');
var execSync = require('child_process').execSync;

// get package.json from current directory
// const pkg = getPkg();
// console.log(pkg);


// function to get package.json from current directory
function getPkg() {
  try {
    // var pkg = require(path.join(dir, 'package.json'));
    const pkg = require(path.join(process.cwd(), 'package.json'));
    return pkg;
  } catch (e) {
    return null;
  }
}

const ignoreDirs = ['node_modules'];

const getAllPkgs = (startPath = '.') => {
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
        // console.log(path.resolve(filename, 'package.json'));
        let pkg = require(path.resolve(filename, 'package.json'));

        results[pkg.name] = path.resolve(filename);
        // console.log(pkg.name);
      } else {
        results = {...results, ...getAllPkgs(filename)}; //recurse
      }

    } 
    
    // else if (filename.indexOf('package.json') >= 0) {
    //   results.push(filename);
    // }
  }

  return results;
}

const pkgs = getAllPkgs();
console.log(pkgs);

for (const pkgName in pkgs) {
  execSync('npm i', {cwd: pkgs[pkgName], stdio: 'inherit'});
}