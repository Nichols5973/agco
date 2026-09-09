/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-story. Base block: columns.
 * Source: https://www.agcocorp.com/us/en/home/sustainability.html (.text-and-asset)
 * Generated: 2026-09-08
 *
 * Library structure (authoritative): multi-column. Row 1 = block name (createBlock).
 * Row 2 = as many cells as columns. Here: 2 columns (text | image), preserving the
 * left/right order found in the source DOM (some stories are image-left, some image-right).
 *
 * xwalk: this is a Columns block (resourceType core/franklin/components/columns).
 * Per field-hinting Rule 4, Columns blocks do NOT use field comments — cells hold
 * default content only.
 *
 * The asset may be a Scene7/Dynamic Media <img>; the parser places it in its natural
 * cell and the DM transformer rewrites it in afterTransform.
 */
export default function parse(element, { document }) {
  // Text side: subhead (often empty), heading, body copy, optional CTA.
  const textWrapper = element.querySelector('.text-and-asset__text-wrapper');
  // Image/asset side.
  const assetWrapper = element.querySelector('.text-and-asset__asset');

  // Build the text cell content from meaningful children (skip empty wrappers).
  const textCell = [];
  if (textWrapper) {
    const heading = textWrapper.querySelector('.text-and-asset__heading h1, .text-and-asset__heading h2, .cmp-heading__text, h1, h2, h3');
    if (heading) textCell.push(heading);
    // Body copy paragraphs.
    const bodyParas = Array.from(textWrapper.querySelectorAll('.text-and-asset__text p'));
    if (bodyParas.length === 0) {
      // Fallback: any paragraph directly under the text side.
      Array.from(textWrapper.querySelectorAll('p')).forEach((p) => bodyParas.push(p));
    }
    bodyParas.forEach((p) => textCell.push(p));
    // Optional CTA link.
    const cta = textWrapper.querySelector('.text-and-asset__cta a, a[class*="btn"]');
    if (cta) textCell.push(cta);
  }

  // Build the image cell.
  const imageCell = [];
  if (assetWrapper) {
    const picture = assetWrapper.querySelector('picture');
    const img = assetWrapper.querySelector('img');
    if (picture) imageCell.push(picture);
    else if (img) imageCell.push(img);
  }

  // Empty-block guard.
  if (textCell.length === 0 && imageCell.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Preserve DOM order (image-left vs image-right variants).
  let leftCell = textCell;
  let rightCell = imageCell;
  if (textWrapper && assetWrapper) {
    const position = textWrapper.compareDocumentPosition(assetWrapper);
    // If asset precedes the text wrapper, image is on the left.
    if (position & Node.DOCUMENT_POSITION_PRECEDING) {
      leftCell = imageCell;
      rightCell = textCell;
    }
  }

  const cells = [[leftCell, rightCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-story', cells });
  element.replaceWith(block);
}
