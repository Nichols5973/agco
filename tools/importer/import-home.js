/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroImmersiveParser from './parsers/hero-immersive.js';
import columnsStoryParser from './parsers/columns-story.js';
import cardsFrameworkParser from './parsers/cards-framework.js';
import cardsRatingParser from './parsers/cards-rating.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/agco-cleanup.js';
import dmImagesTransformer from './transformers/agco-dm-images.js';
import sectionsTransformer from './transformers/agco-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'home',
  description: 'Sustainability landing page: immersive hero, story columns, framework cards, ESG rating cards, and themed download sections',
  urls: [
    'https://www.agcocorp.com/us/en/home/sustainability.html',
  ],
  blocks: [
    {
      name: 'hero-immersive',
      instances: ['.immersive-lead'],
    },
    {
      name: 'columns-story',
      instances: ['section.text-and-asset'],
    },
    {
      name: 'cards-framework',
      instances: ['.multicolumncomp'],
    },
    {
      name: 'cards-rating',
      instances: ['.infographic-card-carousel-grid'],
    },
  ],
  sections: [
    { id: 'section-1', name: 'Hero', selector: '.immersivelead > .immersive-lead', style: null, blocks: ['hero-immersive'], defaultContent: [] },
    { id: 'section-2', name: 'Intro Story', selector: ['div.theme-container.blue-theme:nth-of-type(1)'], style: 'blue', blocks: ['columns-story'], defaultContent: [] },
    { id: 'section-3', name: 'Framework Heading', selector: '#maincontent > main.container.responsivegrid.maincontent > div.cmp-container > div.cmp.cmp-text', style: null, blocks: [], defaultContent: ['div.cmp.cmp-text'] },
    { id: 'section-4', name: 'Framework Cards', selector: 'div.multicolumncomp', style: null, blocks: ['cards-framework'], defaultContent: [] },
    { id: 'section-5', name: 'Sustainability Suite', selector: ['div.theme-container.tan-theme:nth-of-type(7)'], style: 'tan', blocks: [], defaultContent: [] },
    { id: 'section-6', name: 'ESG Ratings', selector: 'div.infographic-card-carousel-grid', style: null, blocks: ['cards-rating'], defaultContent: [] },
    { id: 'section-7', name: 'Legacy of Progress', selector: ['div.theme-container.tan-theme:nth-of-type(12)'], style: 'tan', blocks: [], defaultContent: [] },
    { id: 'section-8', name: 'Story Teaser 1', selector: ['div.theme-container.blue-theme:nth-of-type(14)'], style: 'blue', blocks: ['columns-story'], defaultContent: [] },
    { id: 'section-9', name: 'Story Teaser 2', selector: ['div.theme-container.tan-theme:nth-of-type(15)'], style: 'tan', blocks: ['columns-story'], defaultContent: [] },
    { id: 'section-10', name: 'Story Teaser 3', selector: ['div.theme-container.blue-theme:nth-of-type(16)'], style: 'blue', blocks: ['columns-story'], defaultContent: [] },
    { id: 'section-11', name: 'Story Teaser 4', selector: ['div.theme-container.tan-theme:nth-of-type(17)'], style: 'tan', blocks: ['columns-story'], defaultContent: [] },
  ],
};

// PARSER REGISTRY
const parsers = {
  'hero-immersive': heroImmersiveParser,
  'columns-story': columnsStoryParser,
  'cards-framework': cardsFrameworkParser,
  'cards-rating': cardsRatingParser,
};

// TRANSFORMER REGISTRY
// cleanup and DM images run first; the section transformer runs after so its
// <hr> breaks and Section Metadata blocks are applied to the cleaned DOM.
const transformers = [
  cleanupTransformer,
  dmImagesTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook.
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
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
 * Find all blocks on the page based on the embedded template configuration.
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
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

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
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

    // 4. afterTransform (final cleanup + section breaks/metadata + DM image anchors)
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
