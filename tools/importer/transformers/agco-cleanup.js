/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: AGCO site-wide cleanup.
 * Removes non-authorable global chrome (cookie/consent banner, header nav,
 * footer, skip-to-content link, sprite/icon stylesheets) so the import
 * contains only page-level authorable content.
 *
 * All selectors verified against migration-work/cleaned.html:
 *   #consent_blackbar                          -> line 2  (TrustArc cookie/consent banner)
 *   .cmp-page__skiptomaincontent               -> line 11 (skip-to-main-content a11y link)
 *   header.experiencefragment /
 *     .cmp-experiencefragment--header          -> line 17 (global header/nav experience fragment)
 *   footer.experiencefragment /
 *     .cmp-experiencefragment--footer          -> lines 1414-1415 (global footer experience fragment)
 *   #teconsent                                 -> line 1582 (footer "Cookie Preferences" TrustArc widget)
 *   leading inline SVG sprite <img data:image/svg+xml> -> line 10 (icon sprite sheet, non-authorable)
 *   <link>                                     -> line 14 (clientlib stylesheet)
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Consent/cookie banner and its footer widget — remove before parsing so
    // they never interfere with block matching. (cleaned.html lines 2, 1582)
    WebImporter.DOMUtils.remove(element, [
      '#consent_blackbar',
      '#teconsent',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable global chrome. (cleaned.html lines 11, 14, 17, 1414-1415)
    WebImporter.DOMUtils.remove(element, [
      'header.experiencefragment',
      '.cmp-experiencefragment--header',
      'footer.experiencefragment',
      '.cmp-experiencefragment--footer',
      '.cmp-page__skiptomaincontent',
      'link',
      'noscript',
    ]);

    // Leading inline SVG icon-sprite image (data:image/svg+xml). Non-authorable
    // icon sheet injected by the site shell. (cleaned.html line 10)
    element.querySelectorAll('img[src^="data:image/svg+xml"]').forEach((img) => img.remove());
  }
}
