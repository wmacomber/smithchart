import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = path.resolve('src/rf');
const bannedGlobals = new Set([
  'window',
  'document',
  'navigator',
  'location',
  'history',
  'localStorage',
  'sessionStorage',
  'URL',
  'URLSearchParams',
  'fetch',
  'setTimeout',
  'setInterval',
  'Date',
  'console',
  'process',
  'Buffer',
  'global',
  'globalThis',
  'require',
]);
const failures = [];

function checkModuleSpecifier(file, specifier) {
  if (!specifier.startsWith('./')) {
    failures.push(`${file}: forbidden import ${specifier}`);
    return;
  }
  const resolved = path.resolve(path.dirname(file), specifier);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    failures.push(`${file}: import escapes RF boundary ${specifier}`);
  }
}

function visitFile(file) {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.ES2022,
    true,
  );
  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      checkModuleSpecifier(file, node.moduleSpecifier.text);
    }
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      failures.push(`${file}: dynamic import forbidden`);
    }
    if (ts.isImportTypeNode(node)) {
      failures.push(`${file}: inline import type forbidden`);
    }
    if (ts.isIdentifier(node) && bannedGlobals.has(node.text))
      failures.push(`${file}: forbidden global ${node.text}`);
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node))
      failures.push(`${file}: JSX forbidden`);
    ts.forEachChild(node, visit);
  }
  visit(source);
}

for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith('.ts')) visitFile(path.join(root, entry.name));
}
if (failures.length) {
  process.stderr.write(`${failures.join('\n')}\n`);
  process.exit(1);
}
process.stdout.write('RF boundary clean\n');
