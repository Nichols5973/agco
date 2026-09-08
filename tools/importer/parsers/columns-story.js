/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-story. Base: columns.
 * Source: https://www.agcocorp.com/us/en/home/sustainability.html (section.text-and-asset)
 * xwalk Columns block (core/franklin/components/columns) — NO field hints (per hinting rules).
 * Library structure: row 2 has N cells (one per column). Here 2 columns: text + image.
 * The text/image order varies per instance (image left vs right), so DOM order is preserved.
 * Generated: 2026-09-08
 */
export default function parse(element, { document }) {
  // The two columns live inside the content-wrapper: a text wrapper and an asset wrapper.
  const wrapper = element.querySelector('.text-and-asset__content-wrapper') || element;

  const textWrapper = wrapper.querySelector('.text-and-asset__text-wrapper');
  const assetWrapper = wrapper.querySelector('.text-and-asset__asset, .image');

  // Build the text column: heading + body paragraphs (+ any CTA links), skipping empty blocks.
  const buildTextCell = () => {
    const nodes = [];
    if (!textWrapper) return nodes;
    // Heading (h2 inside cmp-heading; fallbacks for level variation).
    const heading = textWrapper.querySelector(
      '.text-and-asset__heading h1, .text-and-asset__heading h2, .cmp-heading__text, .cmp-heading h1, .cmp-heading h2',
    );
    if (heading) nodes.push(heading);
    // Body: paragraphs and lists inside the text block(s).
    const body = Array.from(
      textWrapper.querySelectorAll('.text-and-asset__text > p, .text-and-asset__text > ul, .text-and-asset__text > ol'),
    );
    body.forEach((n) => nodes.push(n));
    // Subhead (usually empty on this page, but include if it has content).
    const subhead = textWrapper.querySelector('.text-and-asset__subhead');
    if (subhead && subhead.textContent.trim()) nodes.unshift(subhead);
    // CTA (back-link) if present.
    const ctaLinks = Array.from(
      textWrapper.querySelectorAll('.text-and-asset__cta a'),
    );
    ctaLinks.forEach((a) => nodes.push(a));
    return nodes;
  };

  // Build the image column.
  const buildImageCell = () => {
    if (!assetWrapper) return [];
    const picture = assetWrapper.querySelector('picture');
    const img = assetWrapper.querySelector('img');
    const imageNode = picture || img;
    return imageNode ? [imageNode] : [];
  };

  const textCell = buildTextCell();
  const imageCell = buildImageCell();

  // Empty-block guard.
  if (textCell.length === 0 && imageCell.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Determine column order from DOM position (text-wrapper vs asset-wrapper).
  let orderedCells;
  if (textWrapper && assetWrapper) {
    const pos = textWrapper.compareDocumentPosition(assetWrapper);
    // If asset comes before text in the DOM, image is the left column.
    const assetFirst = !!(pos & Node.DOCUMENT_POSITION_PRECEDING);
    orderedCells = assetFirst ? [imageCell, textCell] : [textCell, imageCell];
  } else {
    orderedCells = [textCell, imageCell];
  }

  // Row 2: two columns. Columns blocks carry no field comments.
  const cells = [orderedCells.map((c) => (c.length ? c : ''))];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-story', cells });
  element.replaceWith(block);
}
