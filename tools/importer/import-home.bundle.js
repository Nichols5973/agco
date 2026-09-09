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
    const picture = element.querySelector(".immersive-lead__image picture, picture");
    const img = element.querySelector(".immersive-lead__image img, img");
    const heading = element.querySelector(".immersive-lead__title h1, .immersive-lead__title, h1, h2");
    const descWrap = element.querySelector(".immersive-lead__description");
    const descParas = descWrap ? Array.from(descWrap.querySelectorAll(":scope > p")) : Array.from(element.querySelectorAll(".immersive-lead__content p"));
    const cta = element.querySelector('.immersive-lead__cta a, .immersive-lead__content a[class*="btn"]');
    if (!heading && descParas.length === 0 && !img && !picture) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    const imageEl = picture || img;
    if (imageEl) {
      cells.push([[document2.createComment(" field:image "), imageEl]]);
    }
    const textContent = [document2.createComment(" field:text ")];
    if (heading) textContent.push(heading);
    descParas.forEach((p) => textContent.push(p));
    if (cta) textContent.push(cta);
    if (textContent.length > 1) {
      cells.push([textContent]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-immersive", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-story.js
  function parse2(element, { document: document2 }) {
    const textWrapper = element.querySelector(".text-and-asset__text-wrapper");
    const assetWrapper = element.querySelector(".text-and-asset__asset");
    const textCell = [];
    if (textWrapper) {
      const heading = textWrapper.querySelector(".text-and-asset__heading h1, .text-and-asset__heading h2, .cmp-heading__text, h1, h2, h3");
      if (heading) textCell.push(heading);
      const bodyParas = Array.from(textWrapper.querySelectorAll(".text-and-asset__text p"));
      if (bodyParas.length === 0) {
        Array.from(textWrapper.querySelectorAll("p")).forEach((p) => bodyParas.push(p));
      }
      bodyParas.forEach((p) => textCell.push(p));
      const cta = textWrapper.querySelector('.text-and-asset__cta a, a[class*="btn"]');
      if (cta) textCell.push(cta);
    }
    const imageCell = [];
    if (assetWrapper) {
      const picture = assetWrapper.querySelector("picture");
      const img = assetWrapper.querySelector("img");
      if (picture) imageCell.push(picture);
      else if (img) imageCell.push(img);
    }
    if (textCell.length === 0 && imageCell.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    let leftCell = textCell;
    let rightCell = imageCell;
    if (textWrapper && assetWrapper) {
      const position = textWrapper.compareDocumentPosition(assetWrapper);
      if (position & Node.DOCUMENT_POSITION_PRECEDING) {
        leftCell = imageCell;
        rightCell = textCell;
      }
    }
    const cells = [[leftCell, rightCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-story", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-framework.js
  function parse3(element, { document: document2 }) {
    const cards = Array.from(element.querySelectorAll(":scope > .card, :scope > .banner__card"));
    if (cards.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cards.forEach((card) => {
      const picture = card.querySelector(".card__image picture, .card__media picture, picture");
      const img = card.querySelector(".card__image img, .card__media img, img");
      const imageCell = [document2.createComment(" field:image ")];
      const imageEl = picture || img;
      if (imageEl) imageCell.push(imageEl);
      const textCell = [document2.createComment(" field:text ")];
      const title = card.querySelector(".card__title, h2, h3, h4");
      if (title) textCell.push(title);
      const description = card.querySelector(".card__description");
      if (description) {
        const p = document2.createElement("p");
        p.innerHTML = description.innerHTML.trim();
        textCell.push(p);
      }
      const ctas = Array.from(card.querySelectorAll(".card__btns a, .card__btn, a.btn"));
      ctas.forEach((a) => textCell.push(a));
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-framework", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/download-list-docs.js
  function parse4(element, { document: document2 }) {
    const anchors = Array.from(element.querySelectorAll(".cta-list__content a[href], a.btn[href], a[href]"));
    if (anchors.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    const valueContent = [document2.createComment(" field:individualAssets ")];
    anchors.forEach((a) => {
      const href = a.getAttribute("href") || "";
      const label = (a.textContent || "").trim();
      const link = document2.createElement("a");
      link.setAttribute("href", href);
      link.setAttribute("title", href);
      link.textContent = label || href;
      valueContent.push(link);
    });
    cells.push([
      [document2.createTextNode("individualAssets")],
      valueContent
    ]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "download-list-docs", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-ratings.js
  function parse5(element, { document: document2 }) {
    const slides = Array.from(
      element.querySelectorAll(".infographic-card-carousel-grid__card, .swiper-slide")
    );
    if (slides.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    slides.forEach((slide) => {
      const picture = slide.querySelector(".infographic-card-carousel-grid__card-image picture, picture");
      const img = slide.querySelector(".infographic-card-carousel-grid__card-image img, img");
      const imageCell = [document2.createComment(" field:image ")];
      const imageEl = picture || img;
      if (imageEl) imageCell.push(imageEl);
      const textCell = [document2.createComment(" field:text ")];
      const description = slide.querySelector(".infographic-card-carousel-grid__card-description");
      if (description) {
        const p = document2.createElement("p");
        p.innerHTML = description.innerHTML.trim();
        textCell.push(p);
      }
      const subtext = slide.querySelector(".infographic-card-carousel-grid__card-subtext");
      if (subtext) {
        const p = document2.createElement("p");
        p.innerHTML = subtext.innerHTML.trim();
        textCell.push(p);
      }
      if (imageEl || textCell.length > 1) {
        cells.push([imageCell, textCell]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-ratings", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/agco-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, ["#consent_blackbar"]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.experiencefragment",
        "footer.experiencefragment",
        ".cmp-page__skiptomaincontent",
        "link",
        "noscript"
      ]);
      element.querySelectorAll('img[src^="data:image/svg+xml"]').forEach((img) => img.remove());
    }
  }

  // tools/importer/transformers/agco-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function transform2(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = element.querySelector(section.selector);
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
        const anchor = marker || element.querySelector(section.selector);
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
  function transform3(hookName, element, payload) {
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

  // tools/importer/import-home.js
  var parsers = {
    "hero-immersive": parse,
    "columns-story": parse2,
    "cards-framework": parse3,
    "download-list-docs": parse4,
    "carousel-ratings": parse5
  };
  var PAGE_TEMPLATE = {
    name: "home",
    description: "AGCO Sustainability landing page: immersive hero, themed two-column story sections, framework cards, download lists, and an ESG ratings carousel",
    urls: [
      "https://www.agcocorp.com/us/en/home/sustainability.html"
    ],
    blocks: [
      { name: "hero-immersive", instances: [".immersive-lead"] },
      { name: "columns-story", instances: [".text-and-asset"] },
      { name: "cards-framework", instances: [".banner__cards.cards"] },
      { name: "download-list-docs", instances: [".cta-list.cta-list--layout-centered"] },
      { name: "carousel-ratings", instances: [".infographic-card-carousel-grid"] }
    ],
    sections: [
      { id: "section-1", name: "Hero / Immersive Lead", selector: ".immersive-lead", style: null, blocks: ["hero-immersive"], defaultContent: [] },
      { id: "section-2", name: "Helping farmers thrive", selector: "#maincontent > main.container.responsivegrid.maincontent > div.cmp-container > div.theme-container.container.responsivegrid.blue-theme:nth-of-type(1)", style: "navy-blue", blocks: ["columns-story"], defaultContent: [] },
      { id: "section-3", name: "Framework heading", selector: "#maincontent > main.container.responsivegrid.maincontent > div.cmp-container > div.cmp.cmp-text", style: null, blocks: [], defaultContent: [".cmp.cmp-text"] },
      { id: "section-4", name: "Framework cards", selector: "#maincontent > main.container.responsivegrid.maincontent > div.cmp-container > div.multicolumncomp:nth-of-type(4)", style: null, blocks: ["cards-framework"], defaultContent: [] },
      { id: "section-5", name: "2025 Sustainability Suite", selector: "#maincontent > main.container.responsivegrid.maincontent > div.cmp-container > div.theme-container.container.responsivegrid.tan-theme:nth-of-type(7)", style: "warm-beige", blocks: ["download-list-docs"], defaultContent: [] },
      { id: "section-6", name: "2025 ESG Ratings intro", selector: "#maincontent > main.container.responsivegrid.maincontent > div.cmp-container > div.section-intro.section-intro--layout-centered", style: null, blocks: [], defaultContent: [".section-intro.section-intro--layout-centered"] },
      { id: "section-7", name: "ESG rating cards carousel", selector: ".infographic-card-carousel-grid", style: null, blocks: ["carousel-ratings"], defaultContent: [] },
      { id: "section-8", name: "A Legacy of Progress", selector: "#maincontent > main.container.responsivegrid.maincontent > div.cmp-container > div.theme-container.container.responsivegrid.tan-theme:nth-of-type(12)", style: "warm-beige", blocks: ["download-list-docs"], defaultContent: [] },
      { id: "section-9", name: "Story 1 - PTx Trimble OutRun", selector: "#maincontent > main.container.responsivegrid.maincontent > div.cmp-container > div.theme-container.container.responsivegrid.blue-theme:nth-of-type(14)", style: "navy-blue", blocks: ["columns-story"], defaultContent: [] },
      { id: "section-10", name: "Story 2 - AGCO Power Clean Energy Lab", selector: "#maincontent > main.container.responsivegrid.maincontent > div.cmp-container > div.theme-container.container.responsivegrid.tan-theme:nth-of-type(15)", style: "warm-beige", blocks: ["columns-story"], defaultContent: [] },
      { id: "section-11", name: "Story 3 - AGCO Reman", selector: "#maincontent > main.container.responsivegrid.maincontent > div.cmp-container > div.theme-container.container.responsivegrid.blue-theme:nth-of-type(16)", style: "navy-blue", blocks: ["columns-story"], defaultContent: [] },
      { id: "section-12", name: "Story 4 - 2024 Safest Year", selector: "#maincontent > main.container.responsivegrid.maincontent > div.cmp-container > div.theme-container.container.responsivegrid.tan-theme:nth-of-type(17)", style: "warm-beige", blocks: ["columns-story"], defaultContent: [] }
    ]
  };
  var transformers = [
    transform,
    transform3,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
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
      const { document: document2, url, html, params } = payload;
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
