/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-ratings. Base block: carousel (container).
 * Source: https://www.agcocorp.com/us/en/home/sustainability.html (.infographic-card-carousel-grid)
 * Generated: 2026-09-08
 *
 * Library structure (authoritative): container block, no parent properties.
 *   Row 1: block name (createBlock).
 *   Each subsequent row = one slide with 2 cells:
 *     Cell 1: image (mandatory)  -> field:image
 *     Cell 2: text/richtext (description + subtext) -> field:text
 *
 * xwalk card model fields (blocks/carousel-ratings item model "card"): image, text.
 * imageAlt is collapsed to the <img alt> attribute.
 */
export default function parse(element, { document }) {
  // Each slide is an .infographic-card-carousel-grid__card (swiper-slide).
  const slides = Array.from(
    element.querySelectorAll('.infographic-card-carousel-grid__card, .swiper-slide'),
  );

  // Empty-block guard.
  if (slides.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  slides.forEach((slide) => {
    // --- Image cell ---
    const picture = slide.querySelector('.infographic-card-carousel-grid__card-image picture, picture');
    const img = slide.querySelector('.infographic-card-carousel-grid__card-image img, img');
    const imageCell = [document.createComment(' field:image ')];
    const imageEl = picture || img;
    if (imageEl) imageCell.push(imageEl);

    // --- Text cell: description (primary) + optional subtext ---
    const textCell = [document.createComment(' field:text ')];
    const description = slide.querySelector('.infographic-card-carousel-grid__card-description');
    if (description) {
      const p = document.createElement('p');
      p.innerHTML = description.innerHTML.trim();
      textCell.push(p);
    }
    const subtext = slide.querySelector('.infographic-card-carousel-grid__card-subtext');
    if (subtext) {
      const p = document.createElement('p');
      p.innerHTML = subtext.innerHTML.trim();
      textCell.push(p);
    }

    // Only add a slide row if it has an image (mandatory) or text content.
    if (imageEl || textCell.length > 1) {
      cells.push([imageCell, textCell]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-ratings', cells });
  element.replaceWith(block);
}
