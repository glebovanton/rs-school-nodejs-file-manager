import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';

export async function add (filePath) {
  const file = await fs.open(filePath, 'wx');
  await file.close();
}

export async function read (filePath) {
  const stream = createReadStream(filePath, 'utf8');

  return new Promise((resolve, reject) => {
    stream.on('data', data => {
      process.stdout.write(data);
    });
    stream.on('end', resolve);
    stream.on('error', reject);
  });
}

export async function rename (oldPath, newPath) {
  let isExists = false;

  try {
    await fs.access(newPath);
    isExists = true;
  } catch {
    isExists = false;
  }

  if (isExists) {
    throw new Error('The file already exists');
  }

  await fs.rename(oldPath, newPath);
}

export async function remove (filePath) {
  await fs.rm(filePath);
}

export async function copy (sourceFilePath, destinationDirPath) {
  const fileName = path.basename(sourceFilePath);
  const destinationFilePath = path.join(destinationDirPath, fileName);

  const sourceFile = await fs.open(sourceFilePath, 'r');
  const stream = sourceFile.createReadStream();

  const destinationFile = await fs.open(destinationFilePath, 'wx');
  const write = destinationFile.createWriteStream();

  await pipeline(stream, write);
}

export async function move (sourceFilePath, destinationDirPath) {
  await copy(sourceFilePath, destinationDirPath);
  await remove(sourceFilePath);
}
