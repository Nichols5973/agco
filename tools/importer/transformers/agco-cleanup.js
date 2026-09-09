/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: AGCO site-wide cleanup.
 * Removes non-authorable site chrome (cookie banner, header/nav, footer,
 * skip-to-content link, inline SVG icon sprites, stray <link>/<noscript>).
 * All selectors verified against migration-work/cleaned.html.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // TrustArc cookie/consent banner — found in cleaned.html: <div id="consent_blackbar">
    WebImporter.DOMUtils.remove(element, ['#consent_blackbar']);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome — selectors from cleaned.html:
    //  - <header class="experiencefragment"> (line 17): global top nav
    //  - <footer class="experiencefragment"> (line 1414): global footer incl. #teconsent cookie prefs
    //  - <div class="cmp-page__skiptomaincontent"> (line 11): skip-to-main-content link
    WebImporter.DOMUtils.remove(element, [
      'header.experiencefragment',
      'footer.experiencefragment',
      '.cmp-page__skiptomaincontent',
      'link',
      'noscript',
    ]);

    // Inline SVG icon sprites rendered as data-URI <img> (e.g. top-of-body
    // sprite sheet and nav/UI glyphs) — not authorable content.
    element.querySelectorAll('img[src^="data:image/svg+xml"]').forEach((img) => img.remove());
  }
}
