# Atmoscene Public Asset API Release Goal

Status: complete
Owner: Afnan Hossain
Target: a versioned, static-first public asset API on GitHub Pages that reuses the exact Atmoscene registry and compositor used by the website.

## Architecture contract

- Generate the API from `AtmosceneSceneRenderer` and `AtmosceneRegistry`; never maintain a second handwritten catalogue.
- Keep released scene IDs deterministic and immutable inside a major version.
- GitHub Pages is static: v1 exposes cacheable JSON plus a browser SDK that resolves locally. Documentation must not pretend query-string computation is a server REST endpoint.
- Every scene describes family, mode, phase, moon where applicable, weather state, motion, accessible label, attribution, version, and renderer dependencies.
- All developer URLs derive from a configurable base so the same release works on Pages, another CDN, or self-hosting.
- The SDK mounts the existing compositor; no alternate renderer.
- Publish only generated states that pass contract and renderer-parity tests.

## Chunk 01 — Audit and contract freeze

- [x] Trace registry, engine, renderer, catalogue, live demo, docs, and hosting with Graphify.
- [x] Confirm `window.AtmosceneSceneRenderer` and `window.AtmosceneRegistry` as the public seams.
- [x] Confirm the catalogue currently resolves 3,552 combinations.
- [x] Confirm no reproducible Pages workflow exists yet.
- [ ] Freeze v1 scene ID grammar, collection names, aliases, error objects, licensing, and attribution.

Acceptance: every released catalogue card can be represented without deriving visual state differently from the catalogue.

## Chunk 02 — Reproducible generator

- [ ] Add a Node generator that evaluates the browser registry/renderer in an isolated DOM shim.
- [ ] Generate root manifest, collection summaries/payloads, compact scene index, schemas, version record, checksums, and health document.
- [ ] Generate a weather-key-to-family lookup so the SDK loads one collection, not the entire catalogue.
- [ ] Sort output deterministically.
- [ ] Fail on duplicate IDs, missing labels/families, invalid mode/phase combinations, or count drift.
- [ ] Add generation to build and contract verification to tests.

Acceptance: identical source produces byte-identical JSON.

## Chunk 03 — Versioned endpoints

- [ ] `/api/v1/manifest.json`
- [ ] `/api/v1/health.json`
- [ ] `/api/v1/scenes/index.json`
- [ ] `/api/v1/collections/{core,snow-ice,aurora-polar,tropical-marine,aerosols,rare-celestial}.json`
- [ ] `/api/v1/schema/scene.schema.json`
- [ ] `/api/v1/schema/resolve-input.schema.json`
- [ ] `/api/v1/client.mjs`
- [ ] `/api/v1/client.js`

Acceptance: every advertised URL works through the local Pages-equivalent server and deployed Pages origin.

## Chunk 04 — Browser SDK

- [ ] `createAtmosceneClient({ baseUrl })`.
- [ ] Cached/deduplicated `manifest()` and `collection(family)`.
- [ ] Deterministic `resolve(input)`.
- [ ] One-time `loadRuntime()` for registry, engine, renderer, and stylesheet.
- [ ] `mount(target, input, options)` through `AtmosceneSceneRenderer.sceneMarkup` and `unmount(target)`.
- [ ] AbortSignal support and typed errors: invalid input, unknown family/state, network, manifest mismatch, runtime, target.
- [ ] Accessible labels, reduced motion, no keys/cookies/tracking/location collection.

Acceptance: a blank page imports one module, resolves one scene, and mounts catalogue-identical markup.

## Chunk 05 — API consumer app

- [ ] Build `/api/demo/` as a standalone public app that uses HTTP `fetch`.
- [ ] Select mode, phase, moon, family, and weather.
- [ ] Show resolved ID and compact JSON.
- [ ] Offer copyable fetch, ESM, and script examples.
- [ ] Demonstrate loading, invalid input, network error, and reduced motion.
- [ ] Keep only one animated scene mounted.

Acceptance: it proves third-party consumption without homepage globals.

## Chunk 06 — Complete documentation

- [ ] Five-minute starts for direct JSON, ESM, and plain script.
- [ ] Endpoint table, response examples, scene ID grammar, input vocabulary, schemas, and error contract.
- [ ] Vanilla, React, Vue, Svelte, Web Component, and SSR guidance.
- [ ] Accessibility, reduced motion, pause/offscreen, performance, lazy loading, caching, preload, and request budgets.
- [ ] Accurate CORS/GitHub Pages limits, versioning, deprecation, migration, troubleshooting, and self-hosting.
- [ ] License, Meteocons and Atmoscene attribution, privacy/security statement, support CTA, and machine-readable discovery links.

Acceptance: developers can integrate Atmoscene without reading source or guessing identifiers.

## Chunk 07 — Site discovery

- [ ] Add API links to shared navigation and docs.
- [ ] Add API docs/demo to sitemap, robots, `llms.txt`, and structured data.
- [ ] Add concise homepage API copy without increasing homepage scene load.
- [ ] Keep support CTAs useful and non-intrusive.

Acceptance: humans and search/AI crawlers can discover API, docs, license, and examples.

## Chunk 08 — Hero proportion system

- [ ] Use one 600×400 coordinate system and safe areas for header/text.
- [ ] Scale celestial art, clouds, lightning, precipitation, snow, wind, and marine layers from shared variables.
- [ ] Replace oversized rain strokes with thin depth-varied layers; heavier rain increases density, not drop width.
- [ ] Keep foreground precipitation softer and storm wind subordinate to the condition focal point.
- [ ] Add responsive containment/overflow assertions.

Acceptance: drizzle/rain/heavy rain/storm are distinct and proportionate at desktop, tablet, and mobile sizes.

## Chunk 09 — Cyclone redesign

Meteorological structure: a calm precipitation-light eye, dense eyewall, long curved rainbands spiralling inward, strongest energy near the eyewall, and weaker outer bands. Northern and southern hemisphere rotation must be supported when hemisphere is known.

- [ ] Replace the single thick rotating coil.
- [ ] Draw cloud shield, outer/inner rainbands, eyewall, and clear eye separately.
- [ ] Animate band advection and subtle asymmetric breathing; never rotate the whole drawing like a fan.
- [ ] Add disturbance/depression, tropical storm, cyclone/hurricane, and major-cyclone intensity states.
- [ ] Add reduced-motion poster state and keep hazard symbols separate.

Acceptance: the living scene reads as a tropical cyclone without relying on a coil icon.

## Chunk 10 — Verification

- [ ] Schema validation, count parity, unique IDs, one-family-per-weather-key, SDK/renderer parity, and all URL checks.
- [ ] HTTP consumer test and GitHub Pages base-path tests.
- [ ] Syntax, SEO, sitemap, structured-data, and app-integrity checks.
- [ ] Representative day/night, moon, rain, storm, snow, aurora, cyclone, aerosol, and celestial fixtures.
- [ ] Reduced-motion and accessible-label assertions.

Acceptance: one command rebuilds the API and fails on contract drift.

## Chunk 11 — Release

- [ ] Exclude caches, Graphify output, archives, and temporary files from the commit.
- [ ] Add a Pages workflow that publishes `apps/` only after tests pass.
- [ ] Commit the intended Atmoscene application/API coherently and push when verified.
- [ ] Confirm public home, manifest, docs, demo, collection, SDK, and representative asset URLs.
- [ ] Record release URL and commit in README.

## Release gate

Do not call v1 complete if an endpoint is missing, the demo uses a private path, counts drift, cyclone motion remains a coil, or docs omit hosting limitations, attribution, accessibility, and versioning.
