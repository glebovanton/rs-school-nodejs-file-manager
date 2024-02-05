import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';

export async function fileHash (filePath) {
  const hash = createHash('sha256');

  const file = await fs.open(filePath, 'r');
  const stream = file.createReadStream();

  return new Promise((resolve, reject) => {
    stream.on('data', data => {
      hash.update(data);
    });
    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });
    stream.on('error', reject);
  });
}
