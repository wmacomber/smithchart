import fs from 'node:fs';
import path from 'node:path';

const required = [
  'dist/index.html',
  'dist/favicon.svg',
  'dist/LICENSE.txt',
  'dist/THIRD_PARTY_NOTICES.txt',
  'dist/sw.js',
];
for (const file of required) {
  if (!fs.existsSync(file)) {
    process.stderr.write(`Missing offline artifact: ${file}\n`);
    process.exit(1);
  }
}

const html = fs.readFileSync('dist/index.html', 'utf8');
const worker = fs.readFileSync('dist/sw.js', 'utf8');
const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((reference) => reference && !reference.startsWith('#'));

const failures = [];
const absoluteReferences = references.filter((reference) => reference.startsWith('/'));
const bases = new Set(
  absoluteReferences.map((reference) => reference.match(/^(.*?)(?:assets\/|favicon\.svg$)/)?.[1]),
);
if (bases.has(undefined) || bases.size !== 1)
  failures.push('document assets do not share one base path');
const [base = '/'] = [...bases].filter((value) => value !== undefined);
if (!base.startsWith('/') || !base.endsWith('/'))
  failures.push(`invalid emitted base path ${base}`);
for (const reference of references) {
  if (/^(?:https?:)?\/\//i.test(reference)) {
    failures.push(`remote document asset ${reference}`);
    continue;
  }
  const relative = reference.replace(/^\//, '').replace(/^.*?\/(assets\/|favicon\.svg$)/, '$1');
  if (!fs.existsSync(path.join('dist', relative)))
    failures.push(`missing document asset ${reference}`);
  const workerReference = relative.startsWith('assets/') ? relative : path.basename(relative);
  if (!worker.includes(`"${workerReference}"`)) failures.push(`asset not precached ${reference}`);
}

if (!worker.includes('"index.html"') || !worker.includes('createHandlerBoundToURL("index.html")')) {
  failures.push('navigation fallback does not target precached index.html');
}
if (/https?:\/\//i.test(worker)) failures.push('service worker contains remote URL');

const registrationAsset = fs
  .readdirSync('dist/assets')
  .find((file) => file.startsWith('serviceWorkerRegistration-') && file.endsWith('.js'));
if (!registrationAsset) failures.push('missing service-worker registration asset');
else {
  const registration = fs.readFileSync(path.join('dist/assets', registrationAsset), 'utf8');
  if (!registration.includes(`${base}sw.js`) || !registration.includes(`scope:\`${base}\``))
    failures.push(`service-worker URL or scope does not match base path ${base}`);
}

if (failures.length > 0) {
  process.stderr.write(`Offline verification failed:\n- ${failures.join('\n- ')}\n`);
  process.exit(1);
}

process.stdout.write(`Offline build verified with ${references.length} document assets\n`);
