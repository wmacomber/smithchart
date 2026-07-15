import fs from 'node:fs';
import path from 'node:path';
const banned = [
  /\bfetch\s*\(/,
  /\bXMLHttpRequest\b/,
  /\bWebSocket\b/,
  /\bEventSource\b/,
  /https?:\/\/(?!www\.w3\.org\/2000\/svg)/,
];
const failures = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/\.(ts|tsx|css)$/.test(file)) {
      const text = fs.readFileSync(file, 'utf8');
      if (banned.some((rule) => rule.test(text))) failures.push(file);
    }
  }
}
walk('src');
if (failures.length) {
  process.stderr.write(`Runtime network patterns found: ${failures.join(', ')}\n`);
  process.exit(1);
}
process.stdout.write('No runtime network APIs or remote assets found\n');
