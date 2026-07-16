import fs from 'node:fs';
import path from 'node:path';

const banned = [
  /\bfetch\s*\(/,
  /\bXMLHttpRequest\b/,
  /\bWebSocket\b/,
  /\bEventSource\b/,
  /@import\s+url/i,
  /https?:\/\/(?!www\.w3\.org\/2000\/svg)/,
  /(?:src|href)\s*=\s*["']\/\//i,
];
const failures = [];

function check(file) {
  const source = fs.readFileSync(file, 'utf8');
  if (banned.some((rule) => rule.test(source))) failures.push(file);
}

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (!/\.test\.(?:ts|tsx)$/.test(file) && /\.(?:ts|tsx|css|html)$/.test(file)) check(file);
  }
}

walk('src');
walk('public');
check('index.html');

if (failures.length) {
  process.stderr.write(`Runtime network patterns found: ${failures.join(', ')}\n`);
  process.exit(1);
}
process.stdout.write('No runtime network APIs or remote assets found\n');
