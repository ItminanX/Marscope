// OFFLINE build of frontend/dist — used only where `npm install` is impossible (no network).
// Normal path on a laptop with internet:  cd frontend && npm install && npm run build   (Vite + TypeScript check)
//
// This script bundles src/ with esbuild, taking React from a local node_modules folder (NODE_MODULES env var)
// and Leaflet 1.9.4 + font/leaflet CSS from tools/offline-vendor/ (recovered from the previous build's bundle).
// It does NOT type-check (no @types packages offline). Font files already in dist/assets/ are kept.
//
//   NODE_MODULES=/path/to/node_modules node tools/offline-build.mjs
import { createRequire } from 'module';
import { readFileSync, writeFileSync, readdirSync, unlinkSync, mkdirSync, cpSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const NM = process.env.NODE_MODULES;
if (!NM || !existsSync(join(NM, 'react'))) { console.error('Set NODE_MODULES to a folder that contains react, react-dom and esbuild.'); process.exit(1); }
const require = createRequire(join(NM, 'noop.js'));
const esbuild = require('esbuild');
const vendor = join(here, 'offline-vendor');

const stub = { name: 'offline-stubs', setup(b) {
  b.onResolve({ filter: /^@fontsource\/|^leaflet\/dist\/leaflet\.css$/ }, (a) => ({ path: a.path, namespace: 'empty' }));
  b.onLoad({ filter: /.*/, namespace: 'empty' }, () => ({ contents: '', loader: 'css' }));
  b.onResolve({ filter: /^leaflet$/ }, () => ({ path: join(vendor, 'leaflet-1.9.4.js') }));
} };

const out = join(root, 'dist', 'assets');
mkdirSync(out, { recursive: true });
for (const f of readdirSync(out)) if (/^index-.*\.(js|css)$/.test(f)) unlinkSync(join(out, f));
const res = await esbuild.build({
  entryPoints: [join(root, 'src', 'main.tsx')], bundle: true, minify: true, format: 'esm', target: 'es2020', write: false,
  outdir: out, entryNames: 'index', jsx: 'automatic', nodePaths: [NM], plugins: [stub], legalComments: 'inline',
  define: { 'process.env.NODE_ENV': '"production"' }, logLevel: 'warning',
});
const names = {};
for (const f of res.outputFiles) {
  let text = f.text;
  const ext = f.path.endsWith('.css') ? 'css' : 'js';
  if (ext === 'css') text = readFileSync(join(vendor, 'vendor.css'), 'utf8') + '\n' + text;
  const h = createHash('sha256').update(text).digest('hex').slice(0, 8);
  names[ext] = `index-${h}.${ext}`;
  writeFileSync(join(out, names[ext]), text);
}
writeFileSync(join(root, 'dist', 'index.html'), `<!doctype html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>MARSCOPE — Mission-Aware Route Intelligence for Mars</title>
<script type="module" crossorigin src="./assets/${names.js}"></script>
<link rel="stylesheet" crossorigin href="./assets/${names.css}"></head>
<body><div id="root"></div></body></html>
`);
if (existsSync(join(root, 'public'))) cpSync(join(root, 'public'), join(root, 'dist'), { recursive: true });
console.log('offline build:', names.js, names.css);
