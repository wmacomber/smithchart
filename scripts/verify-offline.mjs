import fs from 'node:fs';
for (const file of ['dist/index.html', 'dist/sw.js']) {
  if (!fs.existsSync(file)) {
    process.stderr.write(`Missing offline artifact: ${file}\n`);
    process.exit(1);
  }
}
process.stdout.write('Offline build artifacts present\n');
