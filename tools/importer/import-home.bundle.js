/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/hero-immersive.js
  function parse(element, { document: document2 }) {
    const fieldCell = (name, ...nodes) => {
      const frag = document2.createDocumentFragment();
      frag.appendChild(document2.createComment(` field:${name} `));
      nodes.filter(Boolean).forEach((n) => frag.appendChild(n));
      return frag;
    };
    const picture = element.querySelector(".immersive-lead__image picture");
    const img = element.querySelector(".immersive-lead__image img");
    const imageNode = picture || img;
    const heading = element.querySelector(
      ".immersive-lead__title h1, .immersive-lead__title h2, .cmp-heading h1, .cmp-heading h2, h1, h2"
    );
    const descParas = Array.from(
      element.querySelectorAll(".immersive-lead__description p")
    );
    if (!imageNode && !heading && descParas.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (imageNode) {
      cells.push([fieldCell("image", imageNode)]);
    }
    const textNodes = [];
    if (heading) textNodes.push(heading);
    descParas.forEach((p) => textNodes.push(p));
    if (textNodes.length) {
      cells.push([fieldCell("text", ...textNodes)]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-immersive", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-story.js
  function parse2(element, { document: document2 }) {
    const wrapper = element.querySelector(".text-and-asset__content-wrapper") || element;
    const textWrapper = wrapper.querySelector(".text-and-asset__text-wrapper");
    const assetWrapper = wrapper.querySelector(".text-and-asset__asset, .image");
    const buildTextCell = () => {
      const nodes = [];
      if (!textWrapper) return nodes;
      const heading = textWrapper.querySelector(
        ".text-and-asset__heading h1, .text-and-asset__heading h2, .cmp-heading__text, .cmp-heading h1, .cmp-heading h2"
      );
      if (heading) nodes.push(heading);
      const body = Array.from(
        textWrapper.querySelectorAll(".text-and-asset__text > p, .text-and-asset__text > ul, .text-and-asset__text > ol")
      );
      body.forEach((n) => nodes.push(n));
      const subhead = textWrapper.querySelector(".text-and-asset__subhead");
      if (subhead && subhead.textContent.trim()) nodes.unshift(subhead);
      const ctaLinks = Array.from(
        textWrapper.querySelectorAll(".text-and-asset__cta a")
      );
      ctaLinks.forEach((a) => nodes.push(a));
      return nodes;
    };
    const buildImageCell = () => {
      if (!assetWrapper) return [];
      const picture = assetWrapper.querySelector("picture");
      const img = assetWrapper.querySelector("img");
      const imageNode = picture || img;
      return imageNode ? [imageNode] : [];
    };
    const textCell = buildTextCell();
    const imageCell = buildImageCell();
    if (textCell.length === 0 && imageCell.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    let orderedCells;
    if (textWrapper && assetWrapper) {
      const pos = textWrapper.compareDocumentPosition(assetWrapper);
      const assetFirst = !!(pos & Node.DOCUMENT_POSITION_PRECEDING);
      orderedCells = assetFirst ? [imageCell, textCell] : [textCell, imageCell];
    } else {
      orderedCells = [textCell, imageCell];
    }
    const cells = [orderedCells.map((c) => c.length ? c : "")];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-story", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-framework.js
  function parse3(element, { document: document2 }) {
    const fieldCell = (name, ...nodes) => {
      const frag = document2.createDocumentFragment();
      frag.appendChild(document2.createComment(` field:${name} `));
      nodes.filter(Boolean).forEach((n) => frag.appendChild(n));
      return frag;
    };
    const cardEls = Array.from(element.querySelectorAll(".banner__card, .card"));
    const cards = cardEls.filter((el, i) => cardEls.indexOf(el) === i && el.matches(".banner__card"));
    const cells = [];
    cards.forEach((card) => {
      const picture = card.querySelector(".card__image picture, .card__media picture");
      const img = card.querySelector(".card__image img, .card__media img");
      const imageNode = picture || img;
      const textNodes = [];
      const title = card.querySelector(".card__title, h2, h3, h4");
      if (title) textNodes.push(title);
      const description = card.querySelector(".card__description");
      if (description && description.textContent.trim()) {
        const p = document2.createElement("p");
        p.innerHTML = description.innerHTML.trim();
        textNodes.push(p);
      }
      const ctaLinks = Array.from(card.querySelectorAll(".card__btns a, .card__btn"));
      ctaLinks.forEach((a) => textNodes.push(a));
      const imageCell = imageNode ? fieldCell("image", imageNode) : "";
      const textCell = textNodes.length ? fieldCell("text", ...textNodes) : "";
      cells.push([imageCell, textCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-framework", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-rating.js
  function parse4(element, { document: document2 }) {
    const fieldCell = (name, ...nodes) => {
      const frag = document2.createDocumentFragment();
      frag.appendChild(document2.createComment(` field:${name} `));
      nodes.filter(Boolean).forEach((n) => frag.appendChild(n));
      return frag;
    };
    const cards = Array.from(
      element.querySelectorAll(".infographic-card-carousel-grid__card")
    );
    const cells = [];
    cards.forEach((card) => {
      const picture = card.querySelector(".infographic-card-carousel-grid__card-image picture");
      const img = card.querySelector(".infographic-card-carousel-grid__card-image img");
      const imageNode = picture || img;
      const textNodes = [];
      const description = card.querySelector(".infographic-card-carousel-grid__card-description");
      if (description && description.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = description.textContent.trim();
        textNodes.push(p);
      }
      const subtext = card.querySelector(".infographic-card-carousel-grid__card-subtext");
      if (subtext && subtext.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = subtext.textContent.trim();
        textNodes.push(p);
      }
      if (!imageNode && textNodes.length === 0) return;
      const imageCell = imageNode ? fieldCell("image", imageNode) : "";
      const textCell = textNodes.length ? fieldCell("text", ...textNodes) : "";
      cells.push([imageCell, textCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-rating", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/agco-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#consent_blackbar",
        "#teconsent"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.experiencefragment",
        ".cmp-experiencefragment--header",
        "footer.experiencefragment",
        ".cmp-experiencefragment--footer",
        ".cmp-page__skiptomaincontent",
        "link",
        "noscript"
      ]);
      element.querySelectorAll('img[src^="data:image/svg+xml"]').forEach((img) => img.remove());
    }
  }

  // tools/importer/transformers/agco-dm-images.js
  function detectDynamicMediaUrl(urlStr) {
    let u;
    try {
      u = new URL(urlStr, "https://x/");
    } catch (e) {
      return false;
    }
    if (u.pathname.startsWith("/is/image/")) {
      return "scene7";
    }
    if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname) && u.pathname.startsWith("/adobe/assets/urn:")) {
      return "dm-openapi";
    }
    return false;
  }
  var LINKED_DM_INLINE_WRAPPER_TAGS = /* @__PURE__ */ new Set(["PICTURE"]);
  var LINKED_DM_WRAPPER_SIBLING_TAGS = /* @__PURE__ */ new Set(["SOURCE"]);
  function findLinkedDmCarrier(img) {
    if (!img || !img.parentElement) return null;
    let node = img;
    let parent = img.parentElement;
    while (parent && LINKED_DM_INLINE_WRAPPER_TAGS.has(parent.tagName)) {
      let foundNode = false;
      for (const child of parent.children) {
        if (child === node) {
          foundNode = true;
        } else if (!LINKED_DM_WRAPPER_SIBLING_TAGS.has(child.tagName)) {
          return null;
        }
      }
      if (!foundNode) return null;
      node = parent;
      parent = parent.parentElement;
    }
    if (!parent || parent.tagName !== "A") return null;
    if (parent.children.length !== 1 || parent.children[0] !== node) return null;
    if (parent.textContent.trim() !== "") return null;
    return parent;
  }
  var EMPTY_ALT_SENTINEL = "Image without alt text";
  function altToLinkText(alt) {
    return alt || EMPTY_ALT_SENTINEL;
  }
  function transform2(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    const doc = element.ownerDocument;
    element.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (!detectDynamicMediaUrl(src)) return;
      const alt = img.getAttribute("alt") || "";
      const linkedAnchor = findLinkedDmCarrier(img);
      if (linkedAnchor) {
        linkedAnchor.setAttribute("title", src);
        linkedAnchor.textContent = altToLinkText(alt);
        return;
      }
      const parent = img.parentElement;
      if (parent && parent.tagName === "A") {
        console.warn("DM image inside mixed-content anchor, skipped:", src);
        return;
      }
      const a = doc.createElement("a");
      a.href = src;
      a.textContent = altToLinkText(alt);
      img.replaceWith(a);
    });
  }

  // tools/importer/transformers/agco-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function normalizeSelector(selector) {
    if (Array.isArray(selector)) return selector[0];
    return selector;
  }
  function transform3(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const selector = normalizeSelector(section.selector);
        if (!selector) continue;
        const sectionEl = element.querySelector(selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || element.querySelector(normalizeSelector(section.selector));
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-home.js
  var PAGE_TEMPLATE = {
    name: "home",
    description: "Sustainability landing page: immersive hero, story columns, framework cards, ESG rating cards, and themed download sections",
    urls: [
      "https://www.agcocorp.com/us/en/home/sustainability.html"
    ],
    blocks: [
      {
        name: "hero-immersive",
        instances: [".immersive-lead"]
      },
      {
        name: "columns-story",
        instances: ["section.text-and-asset"]
      },
      {
        name: "cards-framework",
        instances: [".multicolumncomp"]
      },
      {
        name: "cards-rating",
        instances: [".infographic-card-carousel-grid"]
      }
    ],
    sections: [
      { id: "section-1", name: "Hero", selector: ".immersivelead > .immersive-lead", style: null, blocks: ["hero-immersive"], defaultContent: [] },
      { id: "section-2", name: "Intro Story", selector: ["div.theme-container.blue-theme:nth-of-type(1)"], style: "blue", blocks: ["columns-story"], defaultContent: [] },
      { id: "section-3", name: "Framework Heading", selector: "#maincontent > main.container.responsivegrid.maincontent > div.cmp-container > div.cmp.cmp-text", style: null, blocks: [], defaultContent: ["div.cmp.cmp-text"] },
      { id: "section-4", name: "Framework Cards", selector: "div.multicolumncomp", style: null, blocks: ["cards-framework"], defaultContent: [] },
      { id: "section-5", name: "Sustainability Suite", selector: ["div.theme-container.tan-theme:nth-of-type(7)"], style: "tan", blocks: [], defaultContent: [] },
      { id: "section-6", name: "ESG Ratings", selector: "div.infographic-card-carousel-grid", style: null, blocks: ["cards-rating"], defaultContent: [] },
      { id: "section-7", name: "Legacy of Progress", selector: ["div.theme-container.tan-theme:nth-of-type(12)"], style: "tan", blocks: [], defaultContent: [] },
      { id: "section-8", name: "Story Teaser 1", selector: ["div.theme-container.blue-theme:nth-of-type(14)"], style: "blue", blocks: ["columns-story"], defaultContent: [] },
      { id: "section-9", name: "Story Teaser 2", selector: ["div.theme-container.tan-theme:nth-of-type(15)"], style: "tan", blocks: ["columns-story"], defaultContent: [] },
      { id: "section-10", name: "Story Teaser 3", selector: ["div.theme-container.blue-theme:nth-of-type(16)"], style: "blue", blocks: ["columns-story"], defaultContent: [] },
      { id: "section-11", name: "Story Teaser 4", selector: ["div.theme-container.tan-theme:nth-of-type(17)"], style: "tan", blocks: ["columns-story"], defaultContent: [] }
    ]
  };
  var parsers = {
    "hero-immersive": parse,
    "columns-story": parse2,
    "cards-framework": parse3,
    "cards-rating": parse4
  };
  var transformers = [
    transform,
    transform2,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform3] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_home_default = {
    transform: (payload) => {
      const {
        document: document2,
        url,
        html,
        params
      } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_home_exports);
})();
