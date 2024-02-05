import fs from 'node:fs/promises';

function TableRow (name, isDirectory = false) {
  this.name = name;
  this.type = isDirectory ? 'directory' : 'file';
}

export function consoleLog (text, method = 'log') {
  console[method](text);
}

export async function showDirContent (dirPath) {
  const dirContent = await fs.readdir(dirPath, { withFileTypes: true });

  const [directories, files] = dirContent.reduce((acc, file) => {
    acc[file.isDirectory() ? 0 : 1].push(file);

    return acc;
  }, [[], []]);

  const directoriesRows = directories.map(directory => new TableRow(directory.name, true));
  const filesRows = files.map(file => new TableRow(file.name));

  consoleLog(directoriesRows.concat(filesRows), 'table');
}

export function welcome (username) {
  consoleLog(`Welcome to the File Manager, ${username}`);
}

export function showCurrentPlace (dirPath) {
  consoleLog(`You are currently in ${dirPath}`);
}

export function goodbye (username) {
  consoleLog(`Thank you for using File Manager, ${username}, goodbye!`);
}
