/* eslint-disable */
/* global WebImporter */
/**
 * Parser for download-list-docs. Base block: download-list-docs (custom, no library match).
 * Source: https://www.agcocorp.com/us/en/home/sustainability.html (.cta-list.cta-list--layout-centered)
 * Generated: 2026-09-08
 *
 * Model (blocks/download-list-docs/_download-list-docs.json) is a key-value block
 * ("key-value": true). Authorable fields include: title, assetFolder, individualAssets,
 * fileTypes, sortBy, limit, downloadLabel, bgColor, textColor.
 *
 * The source is a list of direct DAM document links (XLSX/PDF). We map those to the
 * `individualAssets` field so the block lists exactly the picked files. The block's
 * runtime (readIndividualAssets) reads DAM paths from <a href>/<a title>, so we emit
 * the anchors verbatim in the value cell.
 *
 * key-value shape: each row = [ <key label cell>, <value cell> ].
 * xwalk field hints: the value cell carries the field comment; the key cell is the label.
 */
export default function parse(element, { document }) {
  // Collect the document download links from the source list.
  const anchors = Array.from(element.querySelectorAll('.cta-list__content a[href], a.btn[href], a[href]'));

  // Empty-block guard.
  if (anchors.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row: individualAssets -> the picked document files.
  // Normalize each anchor: keep the DAM href, use the visible label text.
  const valueContent = [document.createComment(' field:individualAssets ')];
  anchors.forEach((a) => {
    const href = a.getAttribute('href') || '';
    const label = (a.textContent || '').trim();
    const link = document.createElement('a');
    link.setAttribute('href', href);
    // Preserve the DAM path as title too, mirroring how asset picks round-trip.
    link.setAttribute('title', href);
    link.textContent = label || href;
    valueContent.push(link);
  });

  cells.push([
    [document.createTextNode('individualAssets')],
    valueContent,
  ]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'download-list-docs', cells });
  element.replaceWith(block);
}
