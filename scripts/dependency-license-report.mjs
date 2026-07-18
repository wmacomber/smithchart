import fs from 'node:fs';
import path from 'node:path';

const write = process.argv.includes('--write');
const root = process.cwd();
const project = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const lockText = fs.readFileSync('bun.lock', 'utf8');
const allowedLicenses = new Set([
  '(MIT OR CC0-1.0)',
  '0BSD',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'BlueOak-1.0.0',
  'CC-BY-4.0',
  'CC0-1.0',
  'ISC',
  'MIT',
  'MIT-0',
  'MPL-2.0',
]);
const shippedNames = new Set([
  'lucide-react',
  'react',
  'react-dom',
  'scheduler',
  'workbox-core',
  'workbox-precaching',
  'workbox-routing',
  'workbox-strategies',
  'workbox-sw',
  'workbox-window',
]);
const reviewedOptionalLicenses = new Map([
  ['@emnapi/core', 'MIT'],
  ['@emnapi/runtime', 'MIT'],
  ['@emnapi/wasi-threads', 'MIT'],
  ['@napi-rs/wasm-runtime', 'MIT'],
  ['@tybys/wasm-util', 'MIT'],
  ['fsevents', 'MIT'],
  ['tslib', '0BSD'],
]);

function optionalLicense(name) {
  if (name.startsWith('@rolldown/binding-')) return 'MIT';
  if (name.startsWith('@rollup/rollup-')) return 'MIT';
  if (name.startsWith('lightningcss-')) return 'MPL-2.0';
  return reviewedOptionalLicenses.get(name);
}

function parseLockPackages() {
  const packages = new Map();
  for (const line of lockText.split('\n')) {
    const match = /^ {4}("(?:[^"\\]|\\.)+"): (\[.*\]),?$/.exec(line);
    if (!match) continue;
    const key = JSON.parse(match[1]);
    const tuple = JSON.parse(match[2]);
    const identity = tuple[0];
    const at = identity.lastIndexOf('@');
    const name = identity.slice(0, at);
    const version = identity.slice(at + 1);
    packages.set(`${name}@${version}`, { key, name, version });
  }
  return packages;
}

function walkManifests(directory, result) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const candidate = path.join(directory, entry.name);
    if (entry.isDirectory()) walkManifests(candidate, result);
    else if (entry.name === 'package.json') {
      try {
        const manifest = JSON.parse(fs.readFileSync(candidate, 'utf8'));
        if (typeof manifest.name === 'string' && typeof manifest.version === 'string') {
          const identity = `${manifest.name}@${manifest.version}`;
          if (!result.has(identity)) result.set(identity, { manifest, directory });
        }
      } catch {
        // Dependency test fixtures may contain intentionally invalid manifests.
      }
    }
  }
}

function licenseText(directory) {
  const entry = fs
    .readdirSync(directory)
    .find((name) => /^(?:license|licence)(?:\.(?:md|txt))?$/i.test(name));
  return entry ? fs.readFileSync(path.join(directory, entry), 'utf8').trim() : null;
}

const locked = parseLockPackages();
const installed = new Map();
walkManifests(path.join(root, 'node_modules'), installed);

const failures = [];
const inventory = [...locked.values()]
  .map((item) => {
    const resolved = installed.get(`${item.name}@${item.version}`);
    if (!resolved) {
      const license = optionalLicense(item.name);
      if (!license)
        failures.push(`${item.name}@${item.version}: locked package manifest is not installed`);
      return { ...item, license: license ?? 'MISSING', shipped: shippedNames.has(item.name) };
    }
    const license = resolved.manifest.license;
    if (typeof license !== 'string' || !license.trim())
      failures.push(`${item.name}@${item.version}: missing license identifier`);
    else if (!allowedLicenses.has(license))
      failures.push(`${item.name}@${item.version}: unreviewed license ${license}`);
    return {
      ...item,
      directory: resolved.directory,
      license: typeof license === 'string' ? license : 'MISSING',
      shipped: shippedNames.has(item.name),
    };
  })
  .sort(
    (left, right) =>
      left.name.localeCompare(right.name) || left.version.localeCompare(right.version),
  );

for (const [name] of Object.entries({ ...project.dependencies, ...project.devDependencies })) {
  const tupleMatch = new RegExp(
    `^ {4}${JSON.stringify(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}: (\\[.*\\]),?$`,
    'm',
  ).exec(lockText);
  if (!tupleMatch) failures.push(`${name}: direct dependency has no exact lock entry`);
}
for (const name of shippedNames) {
  if (!inventory.some((item) => item.name === name))
    failures.push(`${name}: shipped package missing from lock`);
}

const rows = inventory
  .map(
    (item) =>
      `| ${item.name} | ${item.version} | ${item.license} | ${item.shipped ? 'browser distribution' : 'development/build'} |`,
  )
  .join('\n');
const markdown = `# Third-Party Licenses

Generated from \`bun.lock\` and the frozen installed dependency tree by \`bun run licenses\`.
Do not edit package rows manually. “Browser distribution” identifies code represented in emitted
application/service-worker bundles; the complete lock inventory is audited to cover build and test tools.

| Package | Locked version | SPDX license | Use |
| --- | ---: | --- | --- |
${rows}

All packages retain upstream copyright and license terms. MPL-2.0 applies to covered dependency files,
not Smith Match source. CC-BY-4.0 data retains its attribution requirement. Project RF equations,
fixtures, and chart imagery are project-authored; published sources document method and convention and
do not imply endorsement.
`;

const noticeGroups = new Map();
for (const item of inventory.filter((entry) => entry.shipped)) {
  const text = item.directory ? licenseText(item.directory) : null;
  if (!text) {
    failures.push(`${item.name}@${item.version}: shipped package has no license text`);
    continue;
  }
  const key = `${item.license}\n${text}`;
  const group = noticeGroups.get(key) ?? { license: item.license, text, packages: [] };
  group.packages.push(`${item.name}@${item.version}`);
  noticeGroups.set(key, group);
}
const notices = [
  'SMITH MATCH THIRD-PARTY NOTICES',
  '',
  'The following components are represented in the browser distribution.',
  '',
  ...[...noticeGroups.values()].flatMap((group) => [
    '='.repeat(78),
    group.packages.sort().join(', '),
    `SPDX-License-Identifier: ${group.license}`,
    '',
    group.text,
    '',
  ]),
].join('\n');

function sync(file, content) {
  if (write) {
    fs.writeFileSync(file, content.endsWith('\n') ? content : `${content}\n`);
    return;
  }
  if (
    !fs.existsSync(file) ||
    fs.readFileSync(file, 'utf8') !== (content.endsWith('\n') ? content : `${content}\n`)
  )
    failures.push(`${file}: generated license artifact is stale; run bun run licenses:write`);
}

sync('THIRD_PARTY_LICENSES.md', markdown);
sync('public/THIRD_PARTY_NOTICES.txt', notices);

if (failures.length) {
  process.stderr.write(`${failures.join('\n')}\n`);
  process.exit(1);
}
process.stdout.write(
  `Verified ${inventory.length} locked packages and ${inventory.filter((item) => item.shipped).length} browser-distribution notices\n`,
);
