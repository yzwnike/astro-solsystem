// Genera una versión standalone (un único archivo HTML) de una página ya construida.
//
//   node scripts/build-standalone.mjs                          -> dist/index.html -> dist/standalone/index.html
//   node scripts/build-standalone.mjs cargadores-de-coches-electricos
//   node scripts/build-standalone.mjs --images=inline           -> también embebe las imágenes
//
// El CSS y el JS del build quedan siempre inline. Para las imágenes hay tres modos:
//
//   --images=relative  (por defecto) rutas relativas al HTML (images/logo.png). Las
//                      imágenes usadas se copian junto al archivo generado, así que
//                      la carpeta de salida se puede subir tal cual a cualquier sitio.
//   --images=inline    se embeben en base64. Un único archivo sin dependencias,
//                      pero el peso se dispara (fondo.png son ~6,7 MB).
//   --images=cdn       apuntan a assetsPrefix + /images/...
//                      OJO: hoy el CDN sólo sirve /_astro/; habría que subir
//                      public/images/ a /solsystems.es/images/ para que funcione.

import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const CDN = 'https://lanzadera-digital.b-cdn.net/solsystems.es';
const SITE = 'https://solsystems.es/';

const argv = process.argv.slice(2);
const imageMode = argv.find((a) => a.startsWith('--images='))?.split('=')[1] ?? 'relative';
const route = argv.find((a) => !a.startsWith('--'))?.replace(/^\/|\/$/g, '') ?? '';

if (!['cdn', 'inline', 'relative'].includes(imageMode)) {
  console.error(`--images debe ser cdn, inline o relative (recibido: ${imageMode})`);
  process.exit(1);
}

const source = path.join(DIST, route, 'index.html');
const outFile = path.join(DIST, 'standalone', route, 'index.html');

if (!existsSync(source)) {
  console.error(`No existe ${path.relative(ROOT, source)}. Ejecuta primero: npm run build`);
  process.exit(1);
}

const warnings = [];
const inlined = { css: 0, js: 0, img: 0 };

// Un href del HTML (/styles/x.css, o el mismo con el prefijo del CDN) -> fichero en dist/
const toDistPath = (href) => {
  const local = href.startsWith(CDN) ? href.slice(CDN.length) : href;
  if (!local.startsWith('/')) return null; // externo (Google Fonts, etc.)
  return path.join(DIST, local.split('?')[0]);
};

const MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
};

// Assets que hay que copiar junto al HTML (sólo en modo relative).
const copied = new Set();

// Resuelve una ruta absoluta del sitio (/images/x.png) según el modo elegido.
const resolveAsset = (url) => {
  if (!url.startsWith('/')) return url;
  if (imageMode === 'cdn') return CDN + url;

  if (imageMode === 'relative') {
    const clean = url.split('?')[0];
    if (existsSync(path.join(DIST, clean))) copied.add(clean);
    else warnings.push(`${url} no existe en dist/; el enlace relativo quedará roto.`);
    // Relativa al propio HTML: el archivo y su carpeta images/ viajan juntos.
    return clean.replace(/^\//, '');
  }

  const file = path.join(DIST, url.split('?')[0]);
  const mime = MIME[path.extname(file).toLowerCase()];
  if (!existsSync(file) || !mime) {
    warnings.push(`${url} no se pudo embeber; queda apuntando al CDN.`);
    return CDN + url;
  }
  inlined.img++;
  const size = statSync(file).size;
  if (size > 500 * 1024) {
    warnings.push(`${url} pesa ${(size / 1024 / 1024).toFixed(1)} MB embebido en base64.`);
  }
  return `data:${mime};base64,${readFileSync(file).toString('base64')}`;
};

const hoistedImports = [];

// Reescribe las url() de un CSS que se va a mover al <head> del HTML: las rutas
// relativas dejan de resolverse contra la carpeta del CSS original.
const rewriteCss = (css, cssDir) => {
  const withoutImports = css.replace(/@import\s+[^;]+;/g, (stmt) => {
    hoistedImports.push(stmt);
    return '';
  });

  return withoutImports.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (match, _quote, url) => {
    if (/^(data:|https?:|#)/.test(url)) return match;
    const abs = url.startsWith('/')
      ? url
      : '/' + path.posix.normalize(path.posix.join(cssDir, url)).replace(/^\/+/, '');
    return `url('${resolveAsset(abs)}')`;
  });
};

let html = await readFile(source, 'utf8');
const seenCss = new Set();

// 1. CSS: cada <link rel="stylesheet"> local se sustituye por un <style> en su
//    misma posición, para no alterar el orden de la cascada.
html = html.replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi, (tag) => {
  const href = tag.match(/href=["']([^"']+)["']/)?.[1];
  if (!href) return tag;
  const file = toDistPath(href);
  if (!file) return tag; // Google Fonts y demás externos: se dejan igual
  if (!existsSync(file)) {
    // href del CDN cuyo hash ya no corresponde a ningún fichero del build actual.
    warnings.push(`${href} no existe en dist/ (hash obsoleto); queda como enlace remoto.`);
    return tag;
  }

  const css = readFileSync(file, 'utf8');
  // Los mismos estilos enlazados dos veces con hashes distintos sólo se inlinean una vez.
  if (seenCss.has(css)) {
    warnings.push(`${href} es un duplicado exacto de otra hoja ya inline; se omite.`);
    return '';
  }
  seenCss.add(css);

  const cssDir = path.posix.dirname(href.startsWith(CDN) ? href.slice(CDN.length) : href);
  inlined.css++;
  return `<style>\n${rewriteCss(css, cssDir)}\n</style>`;
});

// 2. JS: los <script src> del propio build pasan a inline.
html = html.replace(/<script\b([^>]*)\bsrc=["']([^"']+)["']([^>]*)><\/script>/gi, (tag, pre, src, post) => {
  const file = toDistPath(src);
  if (!file || !existsSync(file)) return tag;
  const attrs = (pre + post).replace(/\s*type=["']module["']/i, '').trim();
  inlined.js++;
  return `<script type="module"${attrs ? ' ' + attrs : ''}>\n${readFileSync(file, 'utf8')}\n</script>`;
});

// 3. Imágenes y favicon.
html = html
  .replace(/(<img\b[^>]*\bsrc=["'])(\/[^"']+)(["'])/gi, (_m, a, url, b) => a + resolveAsset(url) + b)
  .replace(/(<link\b[^>]*\brel=["']icon["'][^>]*\bhref=["'])(\/[^"']+)(["'])/gi, (_m, a, url, b) => a + resolveAsset(url) + b)
  .replace(/(<source\b[^>]*\bsrcset=["'])(\/[^"']+)(["'])/gi, (_m, a, url, b) => a + resolveAsset(url) + b);

// 4. Enlaces de navegación internos -> absolutos al dominio de producción, para que
//    sigan funcionando aunque el archivo se sirva desde otro dominio o subcarpeta.
html = html.replace(/(<a\b[^>]*\bhref=["'])(\/[^"'#][^"']*|\/)(["'])/gi, (_m, a, url, b) => a + SITE + url.replace(/^\//, '') + b);

// 5. Los @import extraídos van en un <style> propio lo más arriba posible del
//    <head> (un @import sólo es válido al inicio de su hoja), pero después del
//    snippet de Google Tag Manager si existe, para no relegarlo.
if (hoistedImports.length) {
  const block = `<style>\n${[...new Set(hoistedImports)].join('\n')}\n</style>`;
  const gtmEnd = '<!-- End Google Tag Manager -->';
  const anchor = html.includes(gtmEnd) ? gtmEnd : '<head>';
  html = html.replace(anchor, `${anchor}${block}`);
}

await mkdir(path.dirname(outFile), { recursive: true });
await writeFile(outFile, html, 'utf8');

// Sólo se copian las imágenes que la página realmente referencia, no toda public/.
for (const asset of copied) {
  const dest = path.join(path.dirname(outFile), asset.replace(/^\//, ''));
  await mkdir(path.dirname(dest), { recursive: true });
  await copyFile(path.join(DIST, asset), dest);
}

const size = Buffer.byteLength(html);
const pretty = size > 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} MB` : `${(size / 1024).toFixed(0)} kB`;
console.log(
  `✓ ${path.relative(ROOT, outFile)}  (${pretty} · ${inlined.css} CSS + ${inlined.js} JS` +
    (inlined.img ? ` + ${inlined.img} img` : '') +
    ` inline · imágenes: ${imageMode})`,
);
if (copied.size) console.log(`  ${copied.size} imágenes copiadas junto al HTML: ${[...copied].join(', ')}`);
for (const w of [...new Set(warnings)]) console.warn(`  ⚠ ${w}`);
