/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-framework. Base block: cards (container).
 * Source: https://www.agcocorp.com/us/en/home/sustainability.html (.banner__cards.cards)
 * Generated: 2026-09-08
 *
 * Library structure (authoritative): container block, no parent properties.
 *   Each child card = one row with 2 cells:
 *     Cell 1: image/icon        -> field:image (empty cell allowed but must exist)
 *     Cell 2: text (title + description + CTA rendered as richtext) -> field:text
 *
 * xwalk card model fields: image, text. imageAlt is collapsed to the <img alt> attribute.
 */
export default function parse(element, { document }) {
  // Each card in the source is a .banner__card / .card element.
  const cards = Array.from(element.querySelectorAll(':scope > .card, :scope > .banner__card'));

  // Empty-block guard.
  if (cards.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  cards.forEach((card) => {
    // --- Image cell ---
    const picture = card.querySelector('.card__image picture, .card__media picture, picture');
    const img = card.querySelector('.card__image img, .card__media img, img');
    const imageCell = [document.createComment(' field:image ')];
    const imageEl = picture || img;
    if (imageEl) imageCell.push(imageEl);

    // --- Text cell (title + description + CTA) ---
    const textCell = [document.createComment(' field:text ')];
    const title = card.querySelector('.card__title, h2, h3, h4');
    if (title) textCell.push(title);

    const description = card.querySelector('.card__description');
    if (description) {
      // Description is raw text inside a div; wrap in a <p> to preserve it as richtext.
      const p = document.createElement('p');
      p.innerHTML = description.innerHTML.trim();
      textCell.push(p);
    }

    // CTA link(s).
    const ctas = Array.from(card.querySelectorAll('.card__btns a, .card__btn, a.btn'));
    ctas.forEach((a) => textCell.push(a));

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-framework', cells });
  element.replaceWith(block);
}
