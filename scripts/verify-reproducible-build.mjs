import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
function digest(directory) {
  const hash = crypto.createHash('sha256');
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else files.push(file);
    }
  };
  walk(directory);
  for (const file of files.sort()) {
    hash.update(path.relative(directory, file));
    hash.update(fs.readFileSync(file));
  }
  return hash.digest('hex');
}
execFileSync('bun', ['run', 'build'], { stdio: 'inherit' });
const first = digest('dist');
fs.rmSync('dist', { recursive: true, force: true });
execFileSync('bun', ['run', 'build'], { stdio: 'inherit' });
const second = digest('dist');
if (first !== second) {
  process.stderr.write(`${first} != ${second}\n`);
  process.exit(1);
}
process.stdout.write(`Reproducible build ${first}\n`);
