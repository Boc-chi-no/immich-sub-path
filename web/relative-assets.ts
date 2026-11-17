import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { brotliCompress, gzip } from 'node:zlib';

const compressGzip = promisify(gzip);
const compressBrotli = promisify(brotliCompress);

// Run after adapter-static has finished, before the CSP manifest is calculated.
export const relativizeAssets = async (directory: string): Promise<void> => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await relativizeAssets(file);
      continue;
    }
    if (!/\.(js|html|css|json|map)$/.test(entry.name)) {
      continue;
    }

    const original = await readFile(file, 'utf8');
    const content = original
      .replaceAll(/(["'(])\/_app\//g, '$1./_app/')
      .replaceAll("'/service-worker.js'", "'./service-worker.js'");
    if (content === original) {
      continue;
    }

    await writeFile(file, content);
    await Promise.all([
      compressGzip(content).then((buffer) => writeFile(`${file}.gz`, buffer)),
      compressBrotli(content).then((buffer) => writeFile(`${file}.br`, buffer)),
    ]);
  }
};
