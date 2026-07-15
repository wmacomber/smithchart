import fs from 'node:fs';
import path from 'node:path';

const project = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const names = [
  ...Object.keys(project.dependencies ?? {}),
  ...Object.keys(project.devDependencies ?? {}),
].sort();
const rows = names.map((name) => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join('node_modules', name, 'package.json'), 'utf8'),
  );
  return `| ${name} | ${manifest.version} | ${manifest.license ?? 'REVIEW REQUIRED'} |`;
});
process.stdout.write(
  `# Direct dependency licenses\n\n| Package | Version | License |\n|---|---:|---|\n${rows.join('\n')}\n`,
);
