import { gzipSync } from 'node:zlib';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const files = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });

const all = files('dist');
const largest = (extension) =>
  all
    .filter((path) => path.endsWith(extension))
    .map((path) => ({ path, gzip: gzipSync(readFileSync(path)).byteLength }))
    .sort((left, right) => right.gzip - left.gzip)[0];
const mainJs = largest('.js');
const mainCss = largest('.css');
const precacheBytes = all.reduce((sum, path) => sum + statSync(path).size, 0);

const budgets = [
  ['main JavaScript gzip', mainJs?.gzip ?? Infinity, 100 * 1024],
  ['main CSS gzip', mainCss?.gzip ?? Infinity, 8 * 1024],
  ['precache payload', precacheBytes, 350 * 1024],
];

let failed = false;
for (const [label, actual, limit] of budgets) {
  const passed = actual <= limit;
  process.stdout.write(`${passed ? 'PASS' : 'FAIL'} ${label}: ${actual} / ${limit} bytes\n`);
  failed ||= !passed;
}
if (failed) process.exitCode = 1;
