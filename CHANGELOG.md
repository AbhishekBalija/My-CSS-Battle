# Changelog

All notable changes to this project will be documented in this file.

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
