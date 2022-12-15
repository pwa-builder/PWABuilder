var fs = require('fs');

function replaceInFile(filePath: string, replaceRegex: string, newString: string) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if(err) {
      return console.log(err);
    }
    var result = data.replace(replaceRegex, newString);
    fs.writeFile(filePath, result, 'utf8', (err) => {
      if(err) {
        return console.log(err);
      }
    });
  });
}

function replaceInFileList(listOfFilePaths: string[], replaceRegex: string, newString: string) {
  
}