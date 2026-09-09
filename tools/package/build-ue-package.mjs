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

const { html2md, md2jcr } = await import(`${MODULES}/@adobe/helix-importer/src/index.js`);
const { JSDOM } = await import(`${MODULES}/jsdom/lib/api.js`);

// Load the UE component config (built by npm run build:json)
const components = {
  models: JSON.parse(readFileSync(`${REPO}/component-models.json`, 'utf-8')),
  definition: JSON.parse(readFileSync(`${REPO}/component-definition.json`, 'utf-8')),
  filters: JSON.parse(readFileSync(`${REPO}/component-filters.json`, 'utf-8')),
};

// The AEM content root for this site (from the fstab mountpoint
// franklin.delivery/Nichols5973/agco -> JCR /content/agco).
const SITE_ROOT = '/content/agco';

// Fragments to convert: [sourcePlainHtml, jcrPagePath]. The index IS the
// site-root node (paths.json maps /content/agco -> /), so it serves as the home
// page at /. nav/footer are child nodes fetched by header.js/footer.js.
const PAGES = [
  ['content/us/en/home/sustainability.plain.html', `${SITE_ROOT}`],
  ['content/nav.plain.html', `${SITE_ROOT}/nav`],
  ['content/footer.plain.html', `${SITE_ROOT}/footer`],
];

const OUT = `${REPO}/tools/package/ue-package`;
const JCR_ROOT = `${OUT}/jcr_root`;

function wrapDoc(inner) {
  // md2jcr's HTML pipeline expects a full document with a <main> wrapper.
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><main>${inner}</main></body></html>`;
}

async function convert(srcRel) {
  const html = readFileSync(`${REPO}/${srcRel}`, 'utf-8');
  const { document } = new JSDOM(wrapDoc(html)).window;
  // html2md -> markdown, then md2jcr consumes markdown internally via the wrapper.
  const res = await md2jcr(
    `https://main--agco--nichols5973.aem.page/${srcRel}`,
    document,
    undefined,
    { ...components, toJcr: true },
    {},
  );
  // res may be an object with .jcr / .md or a string; normalize.
  let jcr;
  if (typeof res === 'string') jcr = res;
  else if (res && res.jcr) jcr = res.jcr;
  else if (Array.isArray(res) && res[0]?.jcr) jcr = res[0].jcr;
  else throw new Error(`Unexpected md2jcr result for ${srcRel}: ${JSON.stringify(Object.keys(res || {}))}`);
  // Escape any bare ampersands md2jcr left unescaped in attribute values
  // (e.g. "S&P Global"), which otherwise produce not-well-formed XML.
  return jcr.replace(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)/g, '&amp;');
}

async function main() {
  mkdirSync(JCR_ROOT, { recursive: true });
  const filterPaths = [];
  for (const [srcRel, jcrPath] of PAGES) {
    if (!existsSync(`${REPO}/${srcRel}`)) {
      console.warn(`SKIP missing ${srcRel}`);
      continue;
    }
    console.log(`Converting ${srcRel} -> ${jcrPath}/.content.xml`);
    // eslint-disable-next-line no-await-in-loop
    const jcr = await convert(srcRel);
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
    <entry key="name">agco-index-header-footer</entry>
    <entry key="group">agco</entry>
    <entry key="version">1.0</entry>
  </properties>
`);

  // zip it (use Python's zipfile — the `zip` binary is not available in this image)
  const zip = `${REPO}/tools/package/agco-index-header-footer.zip`;
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
