/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-framework. Base: cards.
 * Source: https://www.agcocorp.com/us/en/home/sustainability.html (.multicolumncomp)
 * xwalk container block. Item model card-framework fields: image (+collapsed imageAlt), text (richtext).
 * Library structure: each card = one row with 2 cells — [image] and [text: title + description + CTA].
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

  // INPUT EXTRACTION — each card is a .banner__card (validated against source.html).
  const cardEls = Array.from(element.querySelectorAll('.banner__card, .card'));
  // De-dupe in case .banner__card and .card double-match the same node.
  const cards = cardEls.filter((el, i) => cardEls.indexOf(el) === i && el.matches('.banner__card'));

  const cells = [];

  cards.forEach((card) => {
    // Image cell: prefer <picture>, fall back to <img>.
    const picture = card.querySelector('.card__image picture, .card__media picture');
    const img = card.querySelector('.card__image img, .card__media img');
    const imageNode = picture || img;

    // Text cell: title (h3) + description + CTA link, as richtext.
    const textNodes = [];
    const title = card.querySelector('.card__title, h2, h3, h4');
    if (title) textNodes.push(title);

    const description = card.querySelector('.card__description');
    if (description && description.textContent.trim()) {
      // Wrap loose description text in a <p> so it renders as a paragraph.
      const p = document.createElement('p');
      p.innerHTML = description.innerHTML.trim();
      textNodes.push(p);
    }

    const ctaLinks = Array.from(card.querySelectorAll('.card__btns a, .card__btn'));
    ctaLinks.forEach((a) => textNodes.push(a));

    // Image cell (field:image) and text cell (field:text). Keep both cells even if one is empty.
    const imageCell = imageNode ? fieldCell('image', imageNode) : '';
    const textCell = textNodes.length ? fieldCell('text', ...textNodes) : '';
    cells.push([imageCell, textCell]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-framework', cells });
  element.replaceWith(block);
}
