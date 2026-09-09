# Sustainability Page Migration Plan

Migrate `https://www.agcocorp.com/us/en/home/sustainability.html` into AEM Edge Delivery Services.

## Goal
Recreate the AGCO Sustainability page as an EDS page — matching content structure, block selection, and visual design as closely as the source, then verify it in preview.

## Approach
This is a single-page content migration. I'll use the standard migration workflow: scrape the source, analyze its structure, map content sequences to available EDS blocks (reusing existing blocks where possible, creating variants where needed), generate import infrastructure, run the import, style the blocks/design to match the original, and validate the result against the source in preview.

## Checklist

- [ ] **Scrape source page** — capture HTML, metadata, and images from the sustainability URL and produce the cleaned analysis artifacts
- [ ] **Analyze page structure** — identify section boundaries, content sequences, and candidate block variants
- [ ] **Survey block inventory** — list available EDS blocks in the project + block collection to inform mapping decisions
- [ ] **Map content to blocks** — decide default content vs. blocks per sequence; reuse existing variants (80% similarity) or define new ones
- [ ] **Generate import infrastructure** — create block parsers and page transformers for the mapped variants
- [ ] **Build & run the import script** — bundle and execute the import to produce the EDS content file(s)
- [ ] **Migrate design/styling** — extract computed styles from the source and apply EDS-ready CSS for each block/section
- [ ] **Preview & verify** — render the imported page locally and confirm structure/content are present
- [ ] **Visual critique vs. original** — compare the migrated page against the source and iterate on any styling/content gaps
- [ ] **Confirm completion** — report the finished page and any items needing author follow-up

## Notes / Decisions Needed
- Header/nav and footer migration are **not** included in this single-page scope unless you want them added.
- If any sections turn out to be forms or product/commerce listings, those need specialized handling — I'll flag them if found.

> **Execution requires Execute mode.** Approve this plan to proceed with the migration.
