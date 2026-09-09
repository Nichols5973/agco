/* eslint-disable no-console */
/**
 * Build a Universal Editor AEM content package (JCR XML) for:
 *   - the index page   (from content/us/en/home/sustainability.plain.html)
 *   - the header/nav    (content/nav.plain.html)
 *   - the footer        (content/footer.plain.html)
 *
 * Pipeline per fragment: wrap plain.html -> html2md -> md2jcr(models/definition/filters)
 * Then assemble a jcr_root tree + META-INF/vault/filter.xml and zip it.
 *
 * Run: node tools/package/build-ue-package.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const REPO = '/workspace/current';
const MODULES = '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts/node_modules';

const { html2md } = await import(`${MODULES}/@adobe/helix-importer/src/index.js`);
// The markdown-level md2jcr(md, {models,definition,filters}) splits sections on
// thematic breaks (`---`). We convert each authored section to markdown, join
// with `---`, then run this. (The HTML-level md2jcr wrapper strips <hr>, so we
// cannot express section breaks through the DOM.)
const md2jcrFromMarkdown = (await import(`${MODULES}/@adobe/helix-md2jcr/src/index.js`)).md2jcr;
const { JSDOM } = await import(`${MODULES}/jsdom/lib/api.js`);

// Load the UE component config (built by npm run build:json)
const components = {
  models: JSON.parse(readFileSync(`${REPO}/component-models.json`, 'utf-8')),
  definition: JSON.parse(readFileSync(`${REPO}/component-definition.json`, 'utf-8')),
  filters: JSON.parse(readFileSync(`${REPO}/component-filters.json`, 'utf-8')),
};

// The AEM content root for this site. The site's pages live under the
// language-masters node (confirmed by the Universal Editor URL
// .../content/agco/language-masters/index.html), and paths.json maps
// /content/agco/language-masters -> / (the home page).
const SITE_ROOT = '/content/agco/language-masters';

// [sourcePlainHtml, jcrPagePath, pageTitleOverride?]. The home page is the
// `index` child node under language-masters (confirmed by the Universal Editor
// URL .../language-masters/index.html); that child serves at the directory URL
// / and /language-masters/. nav/footer are sibling child nodes fetched by
// header.js/footer.js. When a title override is given we set jcr:title (the
// browser <title> / page title) without touching the authored content file.
const PAGES = [
  ['content/us/en/home/sustainability.plain.html', `${SITE_ROOT}/index`, 'Sustainability | AGCO'],
  ['content/nav.plain.html', `${SITE_ROOT}/nav`],
  ['content/footer.plain.html', `${SITE_ROOT}/footer`],
];

// Bump this when producing a new package so it is clearly identifiable and
// overwrites the previously-installed one in AEM Package Manager.
const VERSION = '1.5';
const PKG_NAME = 'agco-index-header-footer';

const OUT = `${REPO}/tools/package/ue-package`;
const JCR_ROOT = `${OUT}/jcr_root`;

function wrapDoc(inner) {
  // md2jcr's HTML pipeline expects a full document with a <main> wrapper.
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><main>${inner}</main></body></html>`;
}

// The block wrapper classes we authored in content/*.plain.html. Everything
// else stays as default content.
const BLOCK_CLASSES = [
  'hero-immersive', 'columns-story', 'cards-framework', 'carousel-ratings',
  'download-list-docs', 'section-metadata', 'metadata',
];

// "hero-immersive" -> "Hero Immersive" (matches the component title that
// md2jcr looks up via getComponentByTitle).
function titleFromClass(cls) {
  return cls.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/**
 * Convert one authored block div (.block > rowDiv > cellDiv) into the EDS block
 * TABLE form that html2md -> md2jcr recognizes. Without this the HTML->markdown
 * step drops the class-only wrapper divs and every block flattens to loose
 * title/text/button components.
 */
// Container blocks whose parent model carries config fields that md2jcr expects
// as leading single-cell rows (after the header) before the repeating item
// rows. We emit those rows with the model defaults so the item rows aren't
// mis-consumed as config. Order MUST match the model field order.
const CONTAINER_CONFIG_ROWS = {
  'carousel-ratings': ['false', '5000', ''], // autoplay, autoplayInterval, imageZoom
};

function blockDivToTable(document, blockEl, cls) {
  const rows = [...blockEl.children];
  const cols = Math.max(1, ...rows.map((r) => r.children.length || 1));
  const table = document.createElement('table');

  const headTr = document.createElement('tr');
  const th = document.createElement('th');
  if (cols > 1) th.setAttribute('colspan', String(cols));
  th.textContent = titleFromClass(cls);
  headTr.appendChild(th);
  table.appendChild(headTr);

  // Prepend any parent-model config rows this container requires.
  (CONTAINER_CONFIG_ROWS[cls] || []).forEach((val) => {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    if (cols > 1) td.setAttribute('colspan', String(cols));
    td.textContent = val;
    tr.appendChild(td);
    table.appendChild(tr);
  });

  rows.forEach((row) => {
    const tr = document.createElement('tr');
    const cells = [...row.children];
    if (cells.length === 0) {
      // Row content sits directly in the row (no cell wrappers).
      const td = document.createElement('td');
      if (cols > 1) td.setAttribute('colspan', String(cols));
      while (row.firstChild) td.appendChild(row.firstChild);
      tr.appendChild(td);
    } else {
      cells.forEach((cell) => {
        const td = document.createElement('td');
        // Preserve field-hint comments + content so md2jcr maps fields.
        while (cell.firstChild) td.appendChild(cell.firstChild);
        tr.appendChild(td);
      });
    }
    table.appendChild(tr);
  });

  blockEl.replaceWith(table);
}

/**
 * download-list-docs is a key-value block whose `individualAssets` field is a
 * `reference multi`. That shape does not round-trip cleanly through
 * html2md -> md2jcr (multiple links in one key-value cell crash the mapper).
 * The site's scripts.js `buildDownloadListBlocks` auto-block instead rebuilds
 * this block at runtime from a single paragraph holding >= 2 document links.
 * So we emit that paragraph form and let the runtime reconstruct the block —
 * exactly how the local preview renders it.
 */
function downloadListToLooseLinks(document, blockEl) {
  const anchors = [...blockEl.querySelectorAll('a[href]')];
  if (anchors.length < 2) {
    // Single-doc lists render fine as-is; just unwrap to a plain paragraph.
    const p = document.createElement('p');
    anchors.forEach((a) => p.appendChild(a));
    blockEl.replaceWith(p);
    return;
  }
  const p = document.createElement('p');
  anchors.forEach((a) => p.appendChild(a));
  blockEl.replaceWith(p);
}

/**
 * Rewrite the block wrappers inside one section subtree into the table form
 * md2jcr consumes. download-list-docs is emitted as loose links (the runtime
 * rebuilds it — see above); every other recognized block becomes a table.
 */
function prepareSection(document, section) {
  [...section.querySelectorAll('.download-list-docs')].forEach((el) => {
    downloadListToLooseLinks(document, el);
  });
  BLOCK_CLASSES.filter((c) => c !== 'download-list-docs').forEach((cls) => {
    [...section.querySelectorAll(`.${cls}`)].forEach((el) => {
      blockDivToTable(document, el, cls);
    });
  });
}

// Convert one prepared section element to markdown via html2md.
async function sectionToMarkdown(section, url) {
  const { document } = new JSDOM(wrapDoc(section.innerHTML)).window;
  const main = document.querySelector('main');
  // Re-run the block transform in this fresh document (innerHTML copy).
  prepareSection(document, main);
  const res = await html2md(url, document, undefined, {}, {});
  if (typeof res === 'string') return res;
  if (res && res.md) return res.md;
  if (Array.isArray(res) && res[0]?.md) return res[0].md;
  throw new Error(`html2md produced no markdown for a section of ${url}`);
}

/**
 * Fragment images need two fixes so they survive the JCR round-trip AND
 * resolve on the published site (where the fragment is served at /nav.plain.html
 * and /footer.plain.html, so a relative `images/...` src would 404):
 *  1. Rewrite relative `images/...` srcs to absolute `/content/images/...`.
 *  2. Unwrap an anchor that contains ONLY an image (e.g. the logo). md2jcr
 *     converts a solo linked-image into a button and drops the image; unwrapping
 *     the anchor keeps it as an image component. (Anchors with an image plus
 *     siblings already round-trip fine as richtext.)
 */
function normalizeFragmentImages(document) {
  document.querySelectorAll('img[src^="images/"]').forEach((img) => {
    img.setAttribute('src', `/content/${img.getAttribute('src')}`);
  });
  document.querySelectorAll('a').forEach((a) => {
    const kids = [...a.childNodes].filter((n) => !(n.nodeType === 3 && !n.textContent.trim()));
    if (kids.length === 1 && kids[0].nodeName === 'IMG') {
      a.replaceWith(kids[0]);
    }
  });
}

async function convert(srcRel, titleOverride) {
  const html = readFileSync(`${REPO}/${srcRel}`, 'utf-8');
  const url = `https://main--agco--nichols5973.aem.page/${srcRel}`;
  const { document } = new JSDOM(wrapDoc(html)).window;
  const isFragment = /\/(nav|footer)\.plain\.html$/.test(srcRel);
  if (isFragment) normalizeFragmentImages(document);
  const sections = [...document.querySelector('main').children];

  // Convert each top-level section div to markdown, then join with thematic
  // breaks so md2jcr's splitSection produces one JCR section per source div.
  const perSection = [];
  for (const section of sections) {
    // eslint-disable-next-line no-await-in-loop
    perSection.push(await sectionToMarkdown(section, url));
  }
  const md = perSection.join('\n\n---\n\n');

  let jcr = await md2jcrFromMarkdown(md, components);
  // Escape any bare ampersands md2jcr left unescaped in attribute values
  // (e.g. "S&P Global"), which otherwise produce not-well-formed XML.
  jcr = jcr.replace(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)/g, '&amp;');
  // Apply the page-title override to jcr:title (the browser <title>) if given.
  if (titleOverride) {
    const esc = titleOverride.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    jcr = jcr.replace(/jcr:title="[^"]*"/, `jcr:title="${esc}"`);
  }
  return jcr;
}

async function main() {
  mkdirSync(JCR_ROOT, { recursive: true });
  const filterPaths = [];
  for (const [srcRel, jcrPath, titleOverride] of PAGES) {
    if (!existsSync(`${REPO}/${srcRel}`)) {
      console.warn(`SKIP missing ${srcRel}`);
      continue;
    }
    console.log(`Converting ${srcRel} -> ${jcrPath}/.content.xml`);
    // eslint-disable-next-line no-await-in-loop
    const jcr = await convert(srcRel, titleOverride);
    const dir = `${JCR_ROOT}${jcrPath}`;
    mkdirSync(dir, { recursive: true });
    writeFileSync(`${dir}/.content.xml`, jcr);
    filterPaths.push(jcrPath);
  }

  // META-INF/vault/filter.xml
  const metaDir = `${OUT}/META-INF/vault`;
  mkdirSync(metaDir, { recursive: true });
  const filters = filterPaths.map((p) => `    <filter root="${p}"/>`).join('\n');
  writeFileSync(`${metaDir}/filter.xml`, `<?xml version="1.0" encoding="UTF-8"?>
<workspaceFilter version="1.0">
${filters}
</workspaceFilter>
`);
  writeFileSync(`${metaDir}/properties.xml`, `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
<properties>
    <entry key="name">${PKG_NAME}</entry>
    <entry key="group">agco</entry>
    <entry key="version">${VERSION}</entry>
  </properties>
`);

  // zip it (use Python's zipfile — the `zip` binary is not available in this image)
  const zip = `${REPO}/tools/package/${PKG_NAME}-${VERSION}.zip`;
  const py = `import zipfile,os\n`
    + `out=${JSON.stringify(zip)}\n`
    + `if os.path.exists(out): os.remove(out)\n`
    + `z=zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED)\n`
    + `for root,_,files in os.walk('.'):\n`
    + `    for f in files:\n`
    + `        if f=='_zip.py': continue\n`
    + `        p=os.path.join(root,f)\n`
    + `        z.write(p, os.path.relpath(p,'.'))\n`
    + `z.close()\n`;
  const pyFile = `${OUT}/_zip.py`;
  writeFileSync(pyFile, py);
  execSync(`cd "${OUT}" && python3 _zip.py`);
  console.log(`\nPackage built: ${zip}`);
  console.log(`Filters: ${filterPaths.join(', ')}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
