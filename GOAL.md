# Atmoscene Release Goal

This file is the active, chunked delivery contract for turning Atmoscene into a coherent public weather-scene library, a live demonstration app, and a versioned static API that works on GitHub Pages.

## Non-negotiable product rules

- Atmoscene is an asset library first. The live weather homepage demonstrates the library; it is not positioned as a consumer weather service.
- The homepage must render the canonical Atmoscene scene compositor. It must not replace scene layers with ad-hoc homepage artwork.
- Every sky must remain proportionate: celestial bodies stay in the sky, weather layers do not cover interface copy, and precipitation scales with the scene.
- Sunrise and sunset use a scene-aware horizon inside the hero scene. A horizon is never a decorative divider below the hero.
- The shared header is transparent and readable over every day, dawn, dusk, night, cloud, rain, storm, snow and visibility state.
- Forecast cards wrap into the document. They never require horizontal scrolling to understand the timeline.
- Public routes use the same brand shell, typography, tokens, navigation and interaction language.
- API documentation must disclose endpoints, schemas, errors, caching, versioning, accessibility, attribution, self-hosting and framework examples.

## Chunk 00 — Graphify architecture trace

- [x] Trace `updateHeroContrast()`, `renderForecast()`, `determineDayPhase()`, the shared shell and the canonical scene renderer.
- [x] Confirm that the public API can reuse `AtmosceneSceneRenderer` and `AtmosceneRegistry` instead of duplicating scene logic.
- [x] Identify the false hero seam and the mobile/desktop horizontal-scroll rules.
- Acceptance: each implementation change maps to an existing renderer, theme, shell or timeline symbol.

## Chunk 01 — Remove the false hero divider

- [x] Delete the standalone `sky-contour-seam` markup and its CSS/animation.
- [x] Remove any pseudo-element presented as a decorative horizon between sections.
- [x] Use a clean, full-bleed content surface transition with no feathering and no partial-width ornament.
- Acceptance: the first content section begins cleanly after the hero and no element can be mistaken for a horizon outside the scene.

## Chunk 02 — Put the horizon inside the sky

- [x] Give dawn, sunrise, sunset and dusk distinct horizon color tokens derived from their sky palettes.
- [x] Align the solar disc to the horizon at sunrise/sunset and below it at the edge phases.
- [x] Keep morning/noon/afternoon scenes horizon-free unless the resolved scene explicitly needs one.
- [x] Keep the sun proportional to clouds and contained below the shared header zone.
- Acceptance: the sun visibly rises from or sets into the rendered Atmoscene horizon; the horizon never appears below the hero.

## Chunk 03 — Two-zone contrast system

- [x] Separate product-copy ink from weather-copy ink instead of applying one color to both halves of the hero.
- [x] Resolve shared-header brand ink independently from right-side navigation ink on split-brightness skies.
- [x] Define readable near-dark and near-light palettes without pure black or pure white.
- [x] Verify normal, hover, current, focus and disabled states for links, buttons, toggles and the search field.
- Acceptance: WCAG-oriented contrast checks pass for representative day, dawn, dusk and night tokens, and no menu or weather text disappears over the screenshot’s split sky.

## Chunk 04 — Proportion and motion correction

- [x] Reduce drizzle, rain and heavy-rain stroke sizes and preserve stroke scale inside responsive SVG scenes.
- [x] Replace the coil-like cyclone with a structured eye, eyewall, spiral rainbands, feeder bands and convection cells based on NOAA/NWS references.
- [x] Verify the hero uses the correct wind profile for calm, breeze, precipitation, turbulent, laminar, drift and aerosol conditions.
- [x] Verify reduced-motion behavior retains scene meaning.
- Acceptance: drops, clouds, sun/moon and severe-weather layers remain proportionate at desktop, tablet and mobile widths.

## Chunk 05 — Forecast timeline layout

- [x] Remove automatic `scrollLeft` centering.
- [x] Replace column-flow and mobile flex scrolling with responsive wrapping grids.
- [x] Preserve past/current/future distinction and keep the current day visually central in source order.
- [x] Make 7-, 15- and 30-day views readable without hidden horizontal content.
- Acceptance: no forecast container has horizontal overflow at supported viewport widths.

## Chunk 06 — Public static API

- [x] Generate a deterministic v1 manifest, health document, scene index, collection indexes, lookup tables, checksums and JSON Schemas.
- [x] Generate 3,552 stable scene descriptors from the canonical registry and renderer data.
- [x] Provide ESM and classic-browser SDKs with caching, request de-duplication, validation and typed errors.
- [x] Build a real consumer demo that fetches the public JSON API and mounts the canonical runtime.
- [ ] Confirm public GitHub Pages URLs after deployment.
- Acceptance: a consumer can resolve and mount an Atmoscene scene without importing private project code.

## Chunk 07 — Complete developer documentation

- [x] Document endpoints, identifiers, schemas, collection browsing, SDK methods and errors.
- [x] Document ESM, classic JS, React, Vue, Svelte, Web Components and SSR usage.
- [x] Document performance, lazy loading, accessibility, reduced motion, privacy, security, attribution, versioning and self-hosting.
- [ ] Verify every documented URL against the deployed release.
- Acceptance: no required integration step is implicit or hidden.

## Chunk 08 — Automated release safeguards

- [x] Add integrity assertions for the removed seam, in-scene horizon, split contrast tokens and non-scrolling timeline.
- [x] Include API docs and demo pages in SEO validation.
- [x] Run the complete build, syntax, SEO, route, API and representative-scene tests.
- [x] Inspect representative day, dawn, dusk, night, rain, storm, sunrise and sunset scenes in-browser.
- Acceptance: `npm run build` passes and visual smoke tests show no regression.

## Chunk 09 — Commit, publish and consume

- [ ] Stage the Atmoscene application, generator, docs, tests and workflow without staging local Graphify output or unrelated archives.
- [ ] Commit the verified release.
- [ ] Push to GitHub and verify the Pages deployment.
- [ ] Load a public scene through the deployed API in the consumer demo.
- Acceptance: the public API, documentation and demo return successful responses from the published origin.

## Linked workstreams

- API implementation detail: [`ATMSCENE_PUBLIC_API_RELEASE_GOAL.md`](ATMSCENE_PUBLIC_API_RELEASE_GOAL.md)
- Global collection production: [`ATMOSCENE_GLOBAL_LIBRARY_GOAL.md`](ATMOSCENE_GLOBAL_LIBRARY_GOAL.md)
- Final route/brand convergence: [`ATMOSCENE_FINAL_BRAND_DELIVERABLES.md`](ATMOSCENE_FINAL_BRAND_DELIVERABLES.md)
