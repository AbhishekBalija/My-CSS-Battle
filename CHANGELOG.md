# Changelog

All notable changes to this project will be documented in this file.

## [1.1.1] - 2026-10-22

### Changed

- Visible text no longer uses em dashes, en dashes or middle dots: titles use a colon ("Battle #1: Simply Square", "Daily Target: Oct 20, 2026"), short phrases use a comma, empty cells show "-". Stored data keeps its existing format, so the extension is unaffected

## [1.1.0] - 2026-10-22

### Added

- Analytics: rank over time chart, battles section, weekly score chart, and an approach split bar with a ranked techniques list
- Analytics: highlights (best solve, biggest cut) and monthly best/worst link to their solutions
- Smooth momentum scrolling (Lenis); touch devices keep native scrolling
- Scroll-driven section reveals: scroll-linked on desktop, a light GPU-only version on touch devices
- Springy card hover/press and a nav highlight that springs between tabs
- Page transitions: the nav slides pages left or right, and a card's target image morphs into the solution page (View Transitions)

### Changed

- Approach names now match the saved approach labels (nested template, multiple elements, single element, background only); gradients, borders etc. count as techniques
- Heatmap colours follow your own character counts instead of fixed cut-offs
- Theme toggle on touch devices: instant switch under a short fade instead of the full-screen circle wipe

### Fixed

- New pages open at the top instead of keeping the previous scroll position
- Home's daily strip skips styling cards that are off-screen, which made the theme toggle and page changes much lighter on phones
- Motion animations now respect the "reduce motion" setting
- "dailies played" mislabel; it is CSSBattle's targets-played count

## [1.0.0] - 2026-10-22

### Added

- Optional approach insight: one short line (up to 200 characters) on the key trick, shown under the code as a `/* insight */` note
- Shared approach contract (`shared/approach-contract.js`) used by the site, the data validator and the cssbattle-tracker-extension
- `check:build` script and CI step that fail if the production build changes any tracked file
- `repair:data` and `sync:images` maintenance commands

### Changed

- The production build only validates data and writes `dist/`; it no longer repairs daily data, downloads target images or rewrites sitemaps in `public/`
- Target images and the generated image map are now committed, so deploys no longer depend on cssbattle.dev being reachable
- Approach validation now runs through the shared contract
