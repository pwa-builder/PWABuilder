var fs = require('fs');

export function replaceAllInFile(filePath: string, replaceString: string, newString: string) {
  fs.readFile(filePath, 'utf8', (err, data: string) => {
    if(err) {
      return console.log(err);
    }
    var result = data.replaceAll(replaceString, newString);
    fs.writeFile(filePath, result, 'utf8', (err) => {
      if(err) {
        return console.log(err);
      }
    });
  });
}

export function replaceInFileList(listOfFilePaths: string[], replaceString: string, newString: string, directory: string = '.') {
  
  const replaceInFileWrapper = (filePath: string) => {
    replaceAllInFile(directory + "/" + filePath, replaceString, newString);
  };

  listOfFilePaths.map(replaceInFileWrapper);
}

export function removeDirectory(directoryName: string) {
  fs.rmSync(directoryName, { recursive: true, force: true });
}

export function createFileAndWrite(filepath: string, content?: string | undefined) {
  fs.writeFileSync(filepath, content ? content : "");
}

export function doesFileExist(filepath: string) {
  return fs.existsSync(filepath);
}

export function doesStringExistInFile(filePath: string, searchString: string): boolean {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  return fileContent.includes(searchString);
}