/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-rating. Base: cards.
 * Source: https://www.agcocorp.com/us/en/home/sustainability.html (.infographic-card-carousel-grid)
 * xwalk container block. Item model card-rating fields: image (+collapsed imageAlt), text (richtext).
 * Library structure: each card = one row with 2 cells — [image] and [text: description + scale subtext].
 * Excludes swiper navigation, pagination, and cta-list chrome.
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

  // INPUT EXTRACTION — each rating card is an .infographic-card-carousel-grid__card (validated against source.html).
  const cards = Array.from(
    element.querySelectorAll('.infographic-card-carousel-grid__card'),
  );

  const cells = [];

  cards.forEach((card) => {
    // Image cell: prefer <picture>, fall back to <img>.
    const picture = card.querySelector('.infographic-card-carousel-grid__card-image picture');
    const img = card.querySelector('.infographic-card-carousel-grid__card-image img');
    const imageNode = picture || img;

    // Text cell: description + optional scale subtext, as richtext paragraphs.
    const textNodes = [];
    const description = card.querySelector('.infographic-card-carousel-grid__card-description');
    if (description && description.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = description.textContent.trim();
      textNodes.push(p);
    }
    const subtext = card.querySelector('.infographic-card-carousel-grid__card-subtext');
    if (subtext && subtext.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = subtext.textContent.trim();
      textNodes.push(p);
    }

    // Skip empty carousel/chrome nodes that carry neither an image nor text.
    if (!imageNode && textNodes.length === 0) return;

    const imageCell = imageNode ? fieldCell('image', imageNode) : '';
    const textCell = textNodes.length ? fieldCell('text', ...textNodes) : '';
    cells.push([imageCell, textCell]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-rating', cells });
  element.replaceWith(block);
}
