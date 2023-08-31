var fs = require('fs');
const decompress = require('decompress');
import fetch from 'node-fetch';
import {pipeline} from 'node:stream';
import {promisify} from 'node:util';

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

export function replaceInFileList(listOfFilePaths: string[], replaceString: string, newString: string, directory: string = '.'): void {
  
  const replaceInFileWrapper = (filePath: string) => {
    replaceAllInFile(directory + "/" + filePath, replaceString, newString);
  };

  listOfFilePaths.map(replaceInFileWrapper);
}

export function removeDirectory(directoryName: string): void {
  fs.rmSync(directoryName, { recursive: true, force: true });
}

export function renameDirectory(oldName: string, newName: string): void {
  fs.renameSync(oldName, newName);
}

export function createFileAndWrite(filepath: string, content?: string | undefined): void {
  fs.writeFileSync(filepath, content ? content : "");
}

export function doesFileExist(filepath: string): boolean {
  return fs.existsSync(filepath);
}

export function doesStringExistInFile(filePath: string, searchString: string): boolean {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  return fileContent.includes(searchString);
}

export async function fetchZipAndDecompress(url: string): Promise<string> {
  const zipName: string = await fetchZip(url);
  return await decompressZip(zipName);
}

export async function fetchZip(url: string): Promise<string> {
  const zipName = "fetchedZip.zip";
  const streamPipeline = promisify(pipeline);

  try {
    const res = await fetch(url);
    if(res.body) {
      await streamPipeline(res.body, fs.createWriteStream(zipName));
    }  
  } catch( err ) {
    throw err;
  }

  return zipName;

}

export async function decompressZip(zipName: string): Promise<string> {
  const decompressedZipName = "decompressedZip";

  try {
    await decompress(zipName, decompressedZipName);
  } catch ( err ) {
    throw err;
  }

  return decompressedZipName;
}