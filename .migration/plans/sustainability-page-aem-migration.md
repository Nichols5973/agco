# Sustainability Page Migration Plan

## Overview
Migrate the single page **https://www.agcocorp.com/us/en/home/sustainability.html** into the AEM Edge Delivery Services "agco" project (Universal Editor / crosswalk target). The migration follows the standard EXCAT workflow: analyze the source page, model its content into blocks, generate import infrastructure, run the import, and validate the result against the original.

- **Source URL:** `https://www.agcocorp.com/us/en/home/sustainability.html`
- **Project type:** xwalk (AEM Cloud Author + Universal Editor) — has `component-definition.json`, `component-models.json`, `models/`
- **Target org/site:** `Nichols5973/agco`
- **Scope:** Single page (not a full site crawl)

## Checklist

- [ ] **Confirm project properties** — verify project type (xwalk), block library endpoint, and available block palette for the `agco` project
- [ ] **Scrape the source page** — capture rendered HTML, metadata, and download images from the sustainability URL; produce cleaned HTML + analysis JSON
- [ ] **Analyze page structure** — identify section boundaries, content sequences, and decide default-content vs. block authoring for each part
- [ ] **Map to blocks / variants** — match content to existing project blocks (hero, cards, columns, teaser, etc.); create new block variants only where no existing block fits
- [ ] **Migrate the design** — extract computed styles from the source and apply CSS so new/variant blocks match the original look
- [ ] **Generate import infrastructure** — create page template, block parsers, and page transformers for the page
- [ ] **Build & run the import script** — bundle the parsers/transformers and run the bulk import to produce the page content
- [ ] **Preview & verify locally** — render the imported page in the local preview and compare structure/content against the original
- [ ] **Visual critique & fixes** — compare the migrated page to the source, fix styling/content divergences, iterate until it matches
- [ ] **(Optional) Migrate header & footer** — instrument navigation and footer if in scope for this page
- [ ] **(Optional) Upload / publish** — push content and preview to the target environment if requested

## Notes
- The page will be processed as a single-URL migration using the site-migration workflow (analysis → infrastructure → import → validation), not a full-site catalog.
- New block variants will be created only when no existing block in the project palette is a good fit, to keep the block library consistent.
- Header/footer instrumentation and publishing are optional final steps — confirm whether you want those included.

**To begin executing this plan, switch to Execute mode.** Once approved, I'll start with confirming the project properties and scraping the source page.
