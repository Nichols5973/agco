/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-immersive. Base block: hero.
 * Source: https://www.agcocorp.com/us/en/home/sustainability.html (.immersive-lead)
 * Generated: 2026-09-08
 *
 * Library structure (authoritative): 1 column, max 3 rows.
 *   Row 1: block name (added by createBlock)
 *   Row 2: background image (optional)   -> field:image
 *   Row 3: title + subheading + CTA richtext (optional) -> field:text
 *
 * xwalk field hints: image cell -> field:image, text cell -> field:text.
 * imageAlt is a collapsed field (rendered as the <img alt> attribute) so it gets no comment.
 */
export default function parse(element, { document }) {
  // --- INPUT EXTRACTION (validated against source.html) ---
  // Background image lives in .immersive-lead__image; fall back to any picture/img.
  const picture = element.querySelector('.immersive-lead__image picture, picture');
  const img = element.querySelector('.immersive-lead__image img, img');

  // Title: h1 within the heading wrapper; fall back to any heading.
  const heading = element.querySelector('.immersive-lead__title h1, .immersive-lead__title, h1, h2');

  // Description paragraphs.
  const descWrap = element.querySelector('.immersive-lead__description');
  const descParas = descWrap
    ? Array.from(descWrap.querySelectorAll(':scope > p'))
    : Array.from(element.querySelectorAll('.immersive-lead__content p'));

  // Optional CTA (none in the representative source, but handle variations).
  const cta = element.querySelector('.immersive-lead__cta a, .immersive-lead__content a[class*="btn"]');

  // --- Empty-block guard ---
  if (!heading && descParas.length === 0 && !img && !picture) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image (only if present).
  const imageEl = picture || img;
  if (imageEl) {
    cells.push([[document.createComment(' field:image '), imageEl]]);
  }

  // Row 3: title + description + CTA as a single richtext cell.
  const textContent = [document.createComment(' field:text ')];
  if (heading) textContent.push(heading);
  descParas.forEach((p) => textContent.push(p));
  if (cta) textContent.push(cta);
  if (textContent.length > 1) {
    cells.push([textContent]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-immersive', cells });
  element.replaceWith(block);
}
