/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: AGCO section breaks + Section Metadata.
 * Driven by payload.template.sections (page-templates.json). Inserts an <hr>
 * before every non-first section and a Section Metadata block after every
 * section that carries a `style` (blue / tan themes).
 *
 * Section boundary selectors come verbatim from page-templates.json (already
 * DOM-verified during page analysis). Some entries store the selector as a
 * single-element array (e.g. ["div.theme-container.blue-theme:nth-of-type(1)"])
 * and others as a bare string — normalizeSelector() handles both.
 *
 * Uses BOTH hooks: breaks are inserted in beforeTransform (while every section
 * element still exists, before parsers replace block-wrapping sections), with a
 * marker <hr> anchoring the afterTransform metadata insertion. See
 * generate-import-transformer.md "Why both hooks".
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

function normalizeSelector(selector) {
  if (Array.isArray(selector)) return selector[0];
  return selector;
}

export default function transform(hookName, element, payload) {
  const sections = (payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    // Insert breaks now, before parsers can replace any section element.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no break, no metadata needed
      const selector = normalizeSelector(section.selector);
      if (!selector) continue;
      const sectionEl = element.querySelector(selector);
      if (!sectionEl) continue; // selector didn't match on this page — skip, never guess

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Parsers have now run and may have replaced section elements. Anchor each
    // styled section's Section Metadata block to whichever still exists: the
    // marker <hr> placed above, or (first section, no marker inserted) the
    // original element itself.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || element.querySelector(normalizeSelector(section.selector));
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never gets a real leading break
      }
    }
  }
}
