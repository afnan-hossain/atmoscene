# Atmoscene Master Task Plan

This file is the single source of truth for building Atmoscene. Work should be completed phase by phase. A phase is complete only when every acceptance criterion and validation item in that phase passes.

## Product definition

Atmoscene will be a global, open-source library of animated weather icons and atmospheric scenes. The product must:

1. Cover substantially more real-world weather and celestial combinations than a conventional icon pack.
2. Use a distinctive original design language across line, flat, fill, and monochrome styles.
3. Blend into arbitrary interfaces without an abrupt square or rectangular scene boundary.
4. Keep animated SVG lightweight and load only the visual required by current data.
5. Export equivalent static SVG, Lottie, PNG/WebP, and framework components from canonical source files.
6. Provide excellent English documentation and international SEO.
7. Credit Meteocons prominently and permanently without implying affiliation.

## Non-negotiable visual rules

- [ ] A scene may contain only one sun, one moon, or one eclipse unless the phenomenon itself requires otherwise.
- [ ] Weather overlays must never accidentally introduce a second celestial body.
- [ ] Cloud-only, rain-only, snow-only, and storm-only layers must exist for composition.
- [ ] Windsock and measurement glyphs belong in data cards, not immersive sky scenes.
- [ ] Night stars remain in place, twinkle independently, and move no more than 2–3 px.
- [ ] Moon size remains proportional to the scene; each phase has the correct illuminated geometry.
- [ ] New moon has no visible crater texture; visible lunar surfaces use recessed crater shading and inner shadows.
- [ ] Moon halo strength and colour respond to phase and special appearances.
- [ ] High-noon sun may use the approved white/silver intense treatment; other sun states use time-appropriate warmth and glow.
- [ ] Wind is shown as directional flow, cloud displacement, snow/rain drift, or subtle particles—not dancing decorative strokes.
- [ ] Scene effects are atmospheric and layered; UI metric icons never appear inside the sky composition.
- [ ] Every animation is fluid, transform-efficient, and purposeful.
- [ ] Every scene supports `prefers-reduced-motion` with a meaningful static frame.

## Phase 00 — Repository, identity, and governance

### Naming and identity

- [x] Select provisional working name: **Atmoscene**.
- [x] Define English descriptor: **Animated Weather Icons & Living Sky Scenes**.
- [x] Perform preliminary web and GitHub collision search.
- [ ] Perform npm package-name checks for `atmoscene` and planned scopes.
- [ ] Perform domain and social-handle checks.
- [ ] Perform a proper trademark search before a public brand launch.
- [ ] Approve final name, logo, wordmark, colour system, and one-sentence pitch.

### Repository foundation

- [x] Create a completely separate local repository folder.
- [x] Add master task plan, README, MIT license, and third-party notices.
- [ ] Create the public GitHub repository.
- [ ] Set default branch to `main` and protect it after the first tagged release.
- [ ] Add repository description, website URL, topics, social preview, and Discussions.
- [ ] Enable Issues, GitHub Pages, Dependabot, security advisories, and branch rules.
- [ ] Add issue templates for bug, icon request, weather-data mapping, accessibility, and documentation.
- [ ] Add pull-request template and contributor checklist.
- [ ] Add `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `SECURITY.md`, and governance notes.

### Licensing and attribution

- [x] License original Atmoscene work under MIT.
- [x] Add a Meteocons notice with original copyright and MIT terms.
- [ ] Maintain machine-readable attribution metadata in the asset manifest.
- [ ] Mark every prototype or derivative asset until an original Atmoscene replacement is approved.
- [ ] Add a permanent `/tribute/meteocons/` documentation page.
- [ ] Add an independent-project and trademark disclaimer.

### Phase 00 acceptance

- [ ] Public repository exists and clones cleanly.
- [ ] A new contributor can find scope, license, attribution, and task order in under two minutes.
- [ ] No file from the Avro project is accidentally committed to this repository.

## Phase 01 — Monorepo and canonical asset architecture

### Proposed structure

```text
atmoscene/
├─ apps/
│  ├─ docs/                 # Astro documentation and gallery
│  └─ lab/                  # Visual QA and combination simulator
├─ packages/
│  ├─ core/                 # Types, manifest, resolver, tokens
│  ├─ svg/                  # Animated and static SVG distributions
│  ├─ lottie/               # Generated Lottie JSON
│  ├─ react/                # React components
│  ├─ vue/                  # Vue components
│  ├─ svelte/               # Svelte components
│  └─ web-component/        # Framework-neutral custom element
├─ source/
│  ├─ icons/                # Canonical editable vector sources
│  ├─ scenes/               # Canonical layered scene sources
│  ├─ motion/               # Shared timelines and easing tokens
│  └─ palettes/             # Time, climate, contrast, and theme tokens
├─ tools/
│  ├─ build/                # Export and optimization pipeline
│  ├─ lint/                 # SVG, manifest, and accessibility validators
│  └─ visual-regression/    # Contact sheets and snapshots
└─ docs/                    # Project decisions and catalogue specifications
```

### Build-system tasks

- [ ] Use a pnpm workspace with TypeScript project references.
- [ ] Use Astro for a static, SEO-friendly GitHub Pages documentation site.
- [ ] Create a stable JSON Schema for icon metadata and scene composition.
- [ ] Create a canonical manifest with id, aliases, categories, tags, styles, formats, conditions, day/night support, animation status, attribution, and file hashes.
- [ ] Create deterministic build outputs; generated files must never be hand-edited.
- [ ] Add SVG optimization that preserves animation IDs, masks, filters, gradients, and accessibility metadata.
- [ ] Add asset hashing and release integrity checks.
- [ ] Decide how canonical motion exports to SVG CSS/SMIL and Lottie without visual drift.

### Phase 01 acceptance

- [ ] `pnpm install`, `pnpm build`, `pnpm test`, and `pnpm docs:build` work from a clean clone.
- [ ] One demonstration scene exports to every planned format from one canonical source.
- [ ] Generated packages contain no accidental cross-package imports.

## Phase 02 — Atmoscene design system

### Geometry and composition

- [ ] Define icon canvas, safe zone, optical centre, stroke widths, corner behaviour, and minimum readable sizes.
- [ ] Define separate icon and scene composition grids.
- [ ] Create organic cloud families rather than repeated ellipses.
- [ ] Create original rain, snow, hail, lightning, fog, haze, smoke, dust, and wind primitives.
- [ ] Define depth levels and overlap rules for foreground, midground, and sky layers.
- [ ] Define celestial size and position tokens by time phase.
- [ ] Define cloud occlusion rules so celestial bodies sit correctly behind or inside cloud layers.

### Style families

- [ ] **Line:** controlled stroke hierarchy, rounded terminals, currentColor-compatible option.
- [ ] **Flat:** layered colour, minimal depth, strong small-size recognition.
- [ ] **Fill:** bold silhouettes, accessible contrast, dashboard-friendly.
- [ ] **Monochrome:** one-colour shapes suitable for CSS theming and print.
- [ ] Ensure all style families share semantic ids and compatible view boxes.
- [ ] Add dark, light, and high-contrast palette tokens.

### Motion language

- [ ] Define duration, easing, delay, amplitude, and loop tokens.
- [ ] Use calm, moderate, active, severe, and extreme motion intensity levels.
- [ ] Make clouds travel rather than bounce.
- [ ] Make wind flow directionally with distinct breeze, steady, gust, gale, squall, and cyclone behaviours.
- [ ] Make rain and snow respond to wind direction and intensity.
- [ ] Make lightning illuminate the entire scene with varied multi-strike timing.
- [ ] Make sun, moon, stars, aurora, and atmospheric optics move independently and naturally.
- [ ] Add reduced-motion and static-poster states.

### Phase 02 acceptance

- [ ] Design tokens document exact numerical rules.
- [ ] Ten reference icons pass recognition tests at 24, 32, 48, 96, and 256 px.
- [ ] Motion remains smooth on a mid-range mobile device.

## Phase 03 — Seamless scene blending and transparent edges

This phase resolves the current square-background problem.

### Scene modes

- [ ] Support `icon` mode with no background.
- [ ] Support `scene` mode with a time-aware atmospheric background.
- [ ] Support `overlay` mode containing only weather particles/effects.
- [ ] Support `backdrop` mode containing only the sky gradient/celestial layer.

### Feathering system

- [ ] Build an SVG alpha mask that preserves a fully visible central scene and gradually fades all four sides to transparent.
- [ ] Use independent horizontal and vertical feather controls rather than a crude circular vignette.
- [ ] Expose `--atmoscene-feather-x`, `--atmoscene-feather-y`, `--atmoscene-feather-start`, and `--atmoscene-scene-opacity`.
- [ ] Provide `none`, `soft`, `wide`, and `cinematic` feather presets.
- [ ] Ensure rain, snow, stars, lightning, aurora, and wind also respect the edge mask.
- [ ] Avoid dark seams, colour fringes, and premultiplied-alpha halos.
- [ ] Provide transparent SVG and alpha-preserving Lottie/WebM exports where supported.

### Blend validation

- [ ] Test every scene over white, black, warm, cool, gradient, image, glass, and patterned backgrounds.
- [ ] Test overlapping header/body/footer regions.
- [ ] Test feathering at 1:1, 4:3, 16:9, 21:9, portrait, and responsive fluid ratios.
- [ ] Add a checkerboard transparency mode in the lab.
- [ ] Add an arbitrary background colour/image picker in the lab.

### Phase 03 acceptance

- [ ] No abrupt square edge is visible on any test background.
- [ ] The central weather event remains readable after feathering.
- [ ] Edge blending does not reduce text contrast outside the scene.

## Phase 04 — Global weather catalogue

Every item needs day/night support where physically meaningful, severity levels where meaningful, and style-family parity.

### A. Clear sky and cloud cover

- [ ] Clear, mostly clear, partly cloudy, mostly cloudy, cloudy, overcast.
- [ ] Scattered, broken, and layered cloud cover.
- [ ] Low cloud, high cloud, cloud ceiling, increasing cloud, decreasing cloud.
- [ ] Cumulus, stratus, cirrus, cumulonimbus, lenticular, mammatus, nacreous, and noctilucent cloud scenes.

### B. Rain and mixed precipitation

- [ ] Mist/drizzle: trace, light, moderate, dense.
- [ ] Rain: light, moderate, heavy, extreme, continuous, intermittent.
- [ ] Showers: isolated, scattered, frequent, passing.
- [ ] Sunshower and virga.
- [ ] Freezing drizzle and freezing rain.
- [ ] Sleet, rain/snow mix, rain/hail mix, graupel, ice pellets.
- [ ] Hail: small, large, severe.

### C. Snow and ice

- [ ] Flurries, light snow, moderate snow, heavy snow, extreme snow.
- [ ] Snow showers, lake-effect snow, blowing snow, drifting snow.
- [ ] Blizzard, whiteout, ground blizzard.
- [ ] Diamond dust, frost, hoarfrost, rime ice, freezing fog, black-ice warning.
- [ ] Snow depth, fresh snow, melting snow, avalanche risk.

### D. Thunderstorms and severe convection

- [ ] Distant thunder, isolated thunderstorm, scattered thunderstorms.
- [ ] Thunderstorm with rain, heavy rain, hail, snow, dust, or high wind.
- [ ] Severe thunderstorm, supercell, multi-cell, squall line.
- [ ] Cloud-to-ground, intra-cloud, sheet, forked, and multi-strike lightning.
- [ ] Tornado, funnel cloud, waterspout, microburst, downburst, derecho.

### E. Wind and circulation

- [ ] Calm, light air, breeze, steady wind, fresh wind, strong wind.
- [ ] Gust, gale, strong gale, storm, violent storm, hurricane-force wind.
- [ ] Crosswind, headwind, tailwind, onshore, offshore, mountain/valley flow.
- [ ] Dust devil, whirlwind, cyclone circulation, anti-cyclonic flow.
- [ ] Separate direction, Beaufort, windsock, compass, gust, and warning metric icons for data cards.

### F. Tropical and coastal weather

- [ ] Tropical disturbance, depression, tropical storm.
- [ ] Hurricane, typhoon, cyclone with category/intensity states.
- [ ] Storm surge, coastal flood, high surf, rip current, waterspout.
- [ ] Marine calm, swell, choppy sea, rough sea, very high waves, sea spray.
- [ ] Tsunami warning icon as a hazard indicator, not a forecast condition.

### G. Visibility and air

- [ ] Mist, fog, dense fog, patchy fog, freezing fog, valley fog, sea fog.
- [ ] Haze, smog, smoke, wildfire smoke, volcanic ash.
- [ ] Dust, blowing dust, sand, sandstorm, haboob.
- [ ] Pollen and bioaerosol indicator families.
- [ ] Visibility range and aviation ceiling indicators.

### H. Atmospheric optics and rare sky events

- [ ] Rainbow, double rainbow, fogbow, moonbow.
- [ ] Solar halo, lunar halo, sun dogs, moon dogs, light pillars.
- [ ] Crepuscular rays, anticrepuscular rays, glory, corona.
- [ ] Aurora borealis and aurora australis at low, moderate, strong, and storm intensity.
- [ ] Meteor shower, comet, zodiacal light, noctilucent display.

### I. Celestial and time system

- [ ] Astronomical dawn, nautical dawn, civil dawn, sunrise.
- [ ] Morning, late morning, solar noon, afternoon, late afternoon.
- [ ] Golden hour, sunset, civil dusk, nautical dusk, astronomical dusk.
- [ ] Evening, midnight, late night, pre-dawn.
- [ ] Moonrise and moonset.
- [ ] New, waxing crescent, first quarter, waxing gibbous, full, waning gibbous, last quarter, waning crescent.
- [ ] Lunar eclipse progression: penumbral, partial, total/blood moon, recovery.
- [ ] Solar eclipse progression: partial, annular, total, diamond ring, recovery.
- [ ] Pink moon, blue moon, harvest moon, supermoon, micromoon, and event-labelled full-moon appearances.
- [ ] Polar day, midnight sun, polar twilight, polar night.
- [ ] Phase-appropriate halo/glow and physically reasonable celestial size.

### J. Temperature and climate extremes

- [ ] Cold, very cold, extreme cold, frost, freeze warning, wind chill.
- [ ] Mild, warm, hot, very hot, extreme heat, humid heat, dry heat.
- [ ] Heat shimmer without a second sun.
- [ ] Drought, excessive rainfall, flash flood, river flood, coastal flood.
- [ ] Fire weather, red flag, wildfire risk.

### K. Data-card and forecast indicators

- [ ] Temperature, feels-like, dew point, humidity, wet-bulb temperature.
- [ ] Pressure, pressure tendency, visibility, cloud base, cloud ceiling.
- [ ] Wind speed, gust, direction, Beaufort scale.
- [ ] Precipitation amount/probability/type, snowfall amount/depth.
- [ ] UV index, AQI, PM1, PM2.5, PM10, ozone, NO2, SO2, CO.
- [ ] Tree, grass, weed, mould, and regional pollen families.
- [ ] Sunrise, sunset, moonrise, moonset, day length, twilight.
- [ ] Past/current/forecast, hourly/daily, alert, watch, warning, emergency.
- [ ] Sensor unavailable, stale data, estimated data, offline state.

### Catalogue acceptance

- [ ] Every Meteocons catalogue concept has an Atmoscene compatibility mapping or documented reason for omission.
- [ ] Every Atmoscene id is unique, semantic, searchable, and stable.
- [ ] All physically impossible combinations are blocked by the resolver.
- [ ] Catalogue coverage is published as a filterable matrix.

## Phase 05 — Data-driven scene engine

### Canonical scene state

- [ ] Define typed state for location, timestamp, timezone, latitude, longitude, hemisphere, season, weather code, precipitation, temperature, cloud cover, visibility, wind, AQI, alerts, sun times, moon times, moon phase, and celestial events.
- [ ] Derive local day phase from astronomical times rather than fixed clock ranges.
- [ ] Derive moon phase accurately and support event overrides.
- [ ] Respect hemisphere for seasons, cyclone rotation, aurora type, and solar paths where relevant.
- [ ] Prevent duplicate celestial assets at resolver level.
- [ ] Resolve a base sky, one celestial layer, condition layers, atmospheric effects, ground/marine context, and UI metrics separately.

### Standard and provider mappings

- [ ] WMO weather interpretation codes.
- [ ] Open-Meteo weather and air-quality fields.
- [ ] OpenWeather condition ids.
- [ ] WeatherAPI condition codes.
- [ ] MET Norway symbol codes.
- [ ] NOAA/NWS alert and observation concepts.
- [ ] Environment Canada, Met Office, BOM, JMA, and IMD adapters where licensing and public APIs permit.
- [ ] Provider-neutral custom mapping API.

### Loading and performance

- [ ] Load only the current scene asset by default.
- [ ] Lazy-load forecast assets near the viewport.
- [ ] Preload the next likely state only when data indicates a transition.
- [ ] Offer CDN, npm, local-file, and inline modes.
- [ ] Cache immutable hashed assets and refresh manifests safely.
- [ ] Provide SSR-safe and CSP-friendly builds.

### Phase 05 acceptance

- [ ] Fixture tests cover every supported provider code.
- [ ] Resolver never returns a missing file.
- [ ] Typical current-weather integration requests one manifest chunk and one visual asset.

## Phase 06 — Export formats and packages

### Canonical exports

- [ ] Animated SVG with no runtime dependency.
- [ ] Static SVG poster frame.
- [ ] Lottie JSON with visual-difference thresholds.
- [ ] Transparent PNG and WebP at documented sizes.
- [ ] Optional AVIF/WebM for complex scene previews, never as the only accessible format.
- [ ] CSS sprite and SVG symbol builds for static/mono use cases.

### Developer packages

- [ ] `@atmoscene/core`
- [ ] `@atmoscene/svg`
- [ ] `@atmoscene/lottie`
- [ ] `@atmoscene/react`
- [ ] `@atmoscene/vue`
- [ ] `@atmoscene/svelte`
- [ ] `@atmoscene/web-component`
- [ ] Optional Flutter and native mobile packages after web parity.

### API design

- [ ] `<AtmosceneIcon name="partly-cloudy-day" />`
- [ ] `<AtmosceneScene state={weatherState} feather="wide" />`
- [ ] CSS custom properties for palette, speed, intensity, feather, and opacity.
- [ ] Programmatic pause/play, reduced motion, poster frame, and accessibility labels.
- [ ] Type-safe autocompletion for every asset id.

### Phase 06 acceptance

- [ ] Equivalent examples work in vanilla HTML, React, Vue, Svelte, and Web Components.
- [ ] Package exports tree-shake correctly.
- [ ] Animated SVG remains the smallest recommended web path unless measurement proves otherwise.

## Phase 07 — Documentation and interactive laboratory

### Documentation content

- [ ] Five-minute quick start.
- [ ] Installation guides for CDN, npm, direct SVG, Lottie, and framework packages.
- [ ] Static vs animated vs Lottie decision guide.
- [ ] Data-provider mapping guides.
- [ ] Scene composition and transparent-feather guide.
- [ ] Theming, dark mode, high contrast, and monochrome guide.
- [ ] Accessibility and reduced-motion guide.
- [ ] Performance and caching guide.
- [ ] Attribution and licensing guide.
- [ ] Migration/compatibility guide for Meteocons users without copying its branding.

### Live gallery and lab

- [ ] Search and filter by weather, time, moon, severity, style, format, and category.
- [ ] Arbitrary background tester to prove edge blending.
- [ ] Live data simulator and JSON state editor.
- [ ] Day/night timeline scrubber.
- [ ] Moon phase and eclipse progression controls.
- [ ] Wind speed/direction controls.
- [ ] Temperature, rain, snow, cloud, visibility, and alert controls.
- [ ] Copy SVG, copy HTML, copy React, download SVG, download Lottie.
- [ ] Side-by-side line/flat/fill/mono comparison.
- [ ] Performance panel showing transferred bytes and loaded assets.

### Tribute page

- [ ] Explain how Meteocons inspired the project.
- [ ] Link to Meteocons, its author, source, and license.
- [ ] Display the exact required copyright notice.
- [ ] Explain which prototype materials were derived and which Atmoscene assets are original.

## Phase 08 — Global SEO and discoverability

### Technical SEO

- [ ] Static-render every documentation and asset page.
- [ ] Fast canonical URLs with clean English slugs.
- [ ] Unique title, meta description, H1, explanatory copy, and code examples per category/asset page.
- [ ] Generate `sitemap.xml`, image sitemap, `robots.txt`, RSS/changelog feed, and canonical tags.
- [ ] Add Open Graph and X cards generated from real Atmoscene visuals.
- [ ] Add JSON-LD for `SoftwareSourceCode`, `WebApplication`, `CreativeWork`, `ImageObject`, and `BreadcrumbList` where appropriate.
- [ ] Avoid keyword stuffing; write useful explanatory content around real integration tasks.
- [ ] Meet Core Web Vitals and accessibility targets.

### Keyword clusters

- [ ] animated weather icons
- [ ] free SVG weather icons
- [ ] Lottie weather animation
- [ ] weather icons for React / Vue / Svelte
- [ ] animated weather background
- [ ] transparent weather scene
- [ ] day and night weather icons
- [ ] moon phase weather icons
- [ ] sunrise sunset moonrise moonset animation
- [ ] snow, blizzard, aurora, thunderstorm, hurricane, AQI, UV, pollen icons
- [ ] open-source weather icon library
- [ ] lightweight weather animation

### Content programme

- [ ] Landing pages for each style and format.
- [ ] Category pages for rain, snow, storm, wind, air quality, celestial, marine, and rare events.
- [ ] Integration pages for major frameworks and public weather APIs.
- [ ] Comparison/decision articles based on measured format and performance differences.
- [ ] Showcase page for community implementations.

### SEO acceptance

- [ ] No duplicate titles/descriptions or thin auto-generated pages.
- [ ] Lighthouse SEO and accessibility reach 100 on representative routes.
- [ ] Structured data validates without errors.
- [ ] Pages remain useful without JavaScript.

## Phase 09 — Quality, accessibility, and performance

### Visual and semantic QA

- [ ] Automated SVG linting for duplicate ids, broken references, missing viewBox, unsafe scripts, and inaccessible motion.
- [ ] Visual regression across all styles, states, and responsive sizes.
- [ ] Contact-sheet review for accidental repetition and missing variation.
- [ ] Automated duplicate-sun/moon/eclipse tests.
- [ ] Physically impossible combination tests.
- [ ] Colour-contrast and colour-vision checks.

### Browser/device QA

- [ ] Current Chrome, Firefox, Safari, and Edge.
- [ ] iOS Safari and Android Chrome.
- [ ] Desktop, tablet, and small mobile layouts.
- [ ] Reduced motion, forced colours, high contrast, zoom, and keyboard-only use.

### Performance budgets

- [ ] Define per-icon and per-scene compressed size budgets.
- [ ] Default page loads no full catalogue bundle.
- [ ] Lazy gallery keeps DOM and animation counts bounded.
- [ ] Pause offscreen animation automatically.
- [ ] Avoid layout shift and main-thread animation bottlenecks.
- [ ] Publish measured SVG vs Lottie vs raster guidance.

## Phase 10 — Automation, releases, and GitHub Pages

- [ ] GitHub Actions: lint, typecheck, unit tests, SVG validation, visual regression, build.
- [ ] Generate manifests, formats, thumbnails, and checksums in CI.
- [ ] Deploy documentation to GitHub Pages from a reproducible static build.
- [ ] Use semantic versioning and Changesets.
- [ ] Publish npm packages with provenance.
- [ ] Publish GitHub Releases with downloadable format bundles.
- [ ] Maintain a changelog and migration notes.
- [ ] Add broken-link, bundle-size, and performance regression checks.

### Release gates

- [ ] `0.1.0`: architecture, original design tokens, 25 reference assets, docs foundation.
- [ ] `0.2.0`: 100 core weather assets, four styles, SVG/static parity.
- [ ] `0.3.0`: Lottie pipeline, resolver, WMO/Open-Meteo adapters, scene feathering.
- [ ] `0.5.0`: global snow/storm/wind/visibility/celestial coverage and framework packages.
- [ ] `0.8.0`: catalogue parity audit, advanced rare events, polished docs/lab.
- [ ] `1.0.0`: stable API, complete documentation, accessibility/performance gates, governance.

## Phase 11 — Community and long-term expansion

- [ ] Public icon-request voting and regional-weather proposals.
- [ ] Translation framework for docs and accessible labels.
- [ ] Community themes without fragmenting semantic ids.
- [ ] Figma library and design tokens.
- [ ] Storybook or equivalent component explorer if it adds value beyond the lab.
- [ ] Official adapters for mapping, dashboard, broadcast, and home-automation ecosystems.
- [ ] Optional real-time precipitation radar and map overlays as separate packages.
- [ ] Contributor recognition and release credits.

## Immediate next work session

Work only on these items next:

1. Approve or rename **Atmoscene**.
2. Install/authenticate GitHub CLI if the connected GitHub app cannot create a repository.
3. Create the public repository and first commit.
4. Scaffold the pnpm/Astro monorepo.
5. Build the transparent edge-feather proof of concept before drawing the full catalogue.
6. Create one canonical reference family—clear, cloud-only, rain-only, snow-only, wind-only, moon phase, and eclipse—to prove composition without duplicate celestial bodies.

