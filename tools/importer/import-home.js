/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroImmersiveParser from './parsers/hero-immersive.js';
import columnsStoryParser from './parsers/columns-story.js';
import cardsFrameworkParser from './parsers/cards-framework.js';
import downloadListDocsParser from './parsers/download-list-docs.js';
import carouselRatingsParser from './parsers/carousel-ratings.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/agco-cleanup.js';
import sectionsTransformer from './transformers/agco-sections.js';
import dmImagesTransformer from './transformers/agco-dm-images.js';

// PARSER REGISTRY
const parsers = {
  'hero-immersive': heroImmersiveParser,
  'columns-story': columnsStoryParser,
  'cards-framework': cardsFrameworkParser,
  'download-list-docs': downloadListDocsParser,
  'carousel-ratings': carouselRatingsParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'home',
  description: 'AGCO Sustainability landing page: immersive hero, themed two-column story sections, framework cards, download lists, and an ESG ratings carousel',
  urls: [
    'https://www.agcocorp.com/us/en/home/sustainability.html',
  ],
  blocks: [
    { name: 'hero-immersive', instances: ['.immersive-lead'] },
    { name: 'columns-story', instances: ['.text-and-asset'] },
    { name: 'cards-framework', instances: ['.banner__cards.cards'] },
    { name: 'download-list-docs', instances: ['.cta-list.cta-list--layout-centered'] },
    { name: 'carousel-ratings', instances: ['.infographic-card-carousel-grid'] },
  ],
  sections: [
    { id: 'section-1', name: 'Hero / Immersive Lead', selector: '.immersive-lead', style: null, blocks: ['hero-immersive'], defaultContent: [] },
    { id: 'section-2', name: 'Helping farmers thrive', selector: '#maincontent > main.container.responsivegrid.maincontent > div.cmp-container > div.theme-container.container.responsivegrid.blue-theme:nth-of-type(1)', style: 'navy-blue', blocks: ['columns-story'], defaultContent: [] },
    { id: 'section-3', name: 'Framework heading', selector: '#maincontent > main.container.responsivegrid.maincontent > div.cmp-container > div.cmp.cmp-text', style: null, blocks: [], defaultContent: ['.cmp.cmp-text'] },
    { id: 'section-4', name: 'Framework cards', selector: '#maincontent > main.container.responsivegrid.maincontent > div.cmp-container > div.multicolumncomp:nth-of-type(4)', style: null, blocks: ['cards-framework'], defaultContent: [] },
    { id: 'section-5', name: '2025 Sustainability Suite', selector: '#maincontent > main.container.responsivegrid.maincontent > div.cmp-container > div.theme-container.container.responsivegrid.tan-theme:nth-of-type(7)', style: 'warm-beige', blocks: ['download-list-docs'], defaultContent: [] },
    { id: 'section-6', name: '2025 ESG Ratings intro', selector: '#maincontent > main.container.responsivegrid.maincontent > div.cmp-container > div.section-intro.section-intro--layout-centered', style: null, blocks: [], defaultContent: ['.section-intro.section-intro--layout-centered'] },
    { id: 'section-7', name: 'ESG rating cards carousel', selector: '.infographic-card-carousel-grid', style: null, blocks: ['carousel-ratings'], defaultContent: [] },
    { id: 'section-8', name: 'A Legacy of Progress', selector: '#maincontent > main.container.responsivegrid.maincontent > div.cmp-container > div.theme-container.container.responsivegrid.tan-theme:nth-of-type(12)', style: 'warm-beige', blocks: ['download-list-docs'], defaultContent: [] },
    { id: 'section-9', name: 'Story 1 - PTx Trimble OutRun', selector: '#maincontent > main.container.responsivegrid.maincontent > div.cmp-container > div.theme-container.container.responsivegrid.blue-theme:nth-of-type(14)', style: 'navy-blue', blocks: ['columns-story'], defaultContent: [] },
    { id: 'section-10', name: 'Story 2 - AGCO Power Clean Energy Lab', selector: '#maincontent > main.container.responsivegrid.maincontent > div.cmp-container > div.theme-container.container.responsivegrid.tan-theme:nth-of-type(15)', style: 'warm-beige', blocks: ['columns-story'], defaultContent: [] },
    { id: 'section-11', name: 'Story 3 - AGCO Reman', selector: '#maincontent > main.container.responsivegrid.maincontent > div.cmp-container > div.theme-container.container.responsivegrid.blue-theme:nth-of-type(16)', style: 'navy-blue', blocks: ['columns-story'], defaultContent: [] },
    { id: 'section-12', name: 'Story 4 - 2024 Safest Year', selector: '#maincontent > main.container.responsivegrid.maincontent > div.cmp-container > div.theme-container.container.responsivegrid.tan-theme:nth-of-type(17)', style: 'warm-beige', blocks: ['columns-story'], defaultContent: [] },
  ],
};

// TRANSFORMER REGISTRY - cleanup + dm-images run always; sections run when 2+ sections
const transformers = [
  cleanupTransformer,
  dmImagesTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform transformers (final cleanup + section breaks/metadata + DM images)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
