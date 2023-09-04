var fs = require('fs');
const decompress = require('decompress');
import fetch from 'node-fetch';
import {pipeline} from 'node:stream';
import {promisify} from 'node:util';

export const DECOMPRESSED_NAME_STRING: string = 'decompressedZip';
export const FETCHED_ZIP_NAME_STRING: string = 'fetchedZip.zip';

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

export function removeAll(filenames: string[]) {
  for(let filename of filenames) {
    removeDirectory(filename);
  }
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

export async function fetchZipAndDecompress(url: string): Promise<void> {
  await fetchZip(url);
  await decompressZip();
}

export async function fetchZip(url: string): Promise<void> {
  const streamPipeline = promisify(pipeline);

  const res = await fetch(url);
  if(res.body) {
    await streamPipeline(res.body, fs.createWriteStream(FETCHED_ZIP_NAME_STRING));
  }  
}

export async function decompressZip(): Promise<void> {
  await decompress(FETCHED_ZIP_NAME_STRING, DECOMPRESSED_NAME_STRING);
  removeDirectory(FETCHED_ZIP_NAME_STRING);
}