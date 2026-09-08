/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-immersive. Base: hero.
 * Source: https://www.agcocorp.com/us/en/home/sustainability.html (.immersive-lead)
 * xwalk simple block — model fields: image (+ collapsed imageAlt), text (richtext).
 * Library structure: 1 column; row for background image, row for text content.
 * Generated: 2026-09-08
 */
export default function parse(element, { document }) {
  // Field-hinted cell helper: inserts `<!-- field:name -->` before content (xwalk requirement).
  const fieldCell = (name, ...nodes) => {
    const frag = document.createDocumentFragment();
    frag.appendChild(document.createComment(` field:${name} `));
    nodes.filter(Boolean).forEach((n) => frag.appendChild(n));
    return frag;
  };

  // INPUT EXTRACTION — selectors validated against source.html
  // Background image lives in .immersive-lead__image; prefer <picture>, fall back to <img>.
  const picture = element.querySelector('.immersive-lead__image picture');
  const img = element.querySelector('.immersive-lead__image img');
  const imageNode = picture || img;

  // Title: h1 inside the heading/title wrapper (fallbacks for heading-level variation).
  const heading = element.querySelector(
    '.immersive-lead__title h1, .immersive-lead__title h2, .cmp-heading h1, .cmp-heading h2, h1, h2',
  );

  // Description: paragraphs within the description wrapper.
  const descParas = Array.from(
    element.querySelectorAll('.immersive-lead__description p'),
  );

  // Empty-block guard.
  if (!imageNode && !heading && descParas.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image (field:image). imageAlt is collapsed into the <img alt> attribute.
  if (imageNode) {
    cells.push([fieldCell('image', imageNode)]);
  }

  // Row 3: text content (field:text) — heading + description as richtext.
  const textNodes = [];
  if (heading) textNodes.push(heading);
  descParas.forEach((p) => textNodes.push(p));
  if (textNodes.length) {
    cells.push([fieldCell('text', ...textNodes)]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-immersive', cells });
  element.replaceWith(block);
}
