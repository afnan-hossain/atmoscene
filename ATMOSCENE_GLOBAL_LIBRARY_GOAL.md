# Atmoscene Global Library Completion Goal

Objective: finish Atmoscene as a globally useful, public-facing animated weather scene library—not a private production diary. Expand the canonical renderer with four complete global families, make every public route speak to developers and product teams worldwide, and keep the Library and Catalogue fast by loading only the category and page a visitor is viewing.

## Non-negotiable product rules

- Atmoscene is an asset library first; live local weather is a demonstration of the library.
- Public copy addresses developers, designers, weather services, broadcasters, educators and product teams. It must not speak as if the site is only for its creator or for an internal approval workflow.
- No public route may expose internal phrases such as “production roadmap,” “batch,” “after approval,” “future resolver,” “not yet a live endpoint,” or “expanding carefully.”
- Every scene must use the canonical Atmoscene compositor. Category pages, catalogue cards, documentation examples and homepage previews must not create alternative artwork.
- One route must never build the full catalogue DOM. Initial catalogue output is capped at 24 cards; category pages show six representative scenes; the Library landing page shows one hero scene plus one preview per category.
- Animation must remain SVG/CSS based, fluid, reduced-motion aware, keyboard accessible and free of emoji.

## Canonical global expansion matrix

The expanded registry contains 3,552 scene combinations:

- Existing/core and snow/ice: 1,578 scenes.
- Aurora & polar sky: 502 scenes — 5 daylight states × 8 daylight phases plus 7 night states × 66 night/moon phases.
- Tropical & marine: 592 scenes — 8 daylight states × 8 daylight phases plus 8 night states × 66 night/moon phases.
- Dust, smoke & ash: 444 scenes — 6 daylight states × 8 daylight phases plus 6 night states × 66 night/moon phases.
- Rare celestial events: 436 scenes — 5 daylight states × 8 daylight phases plus 6 night states × 66 night/moon phases.

Global totals after integration: 384 daylight scenes, 3,168 night/moon scenes, 3,552 total scenes.

## Chunk 00 — Baseline and public-language audit

Status: complete

- Inventory every indexable page, catalogue state, renderer input, registry count and scene mount.
- Find and classify creator-centric, internal-review, roadmap, unfinished-product and Bengali/local-only wording.
- Preserve factual attribution, licensing, funding CTA and technical limitations where users genuinely need them.

Acceptance:

- A deterministic text audit fails when internal production language returns to a public route.
- Existing core scenes and all user-authored work remain preserved.

## Chunk 01 — Global registry and family schema

Status: complete

- Add family metadata, day/night state counts, routes, SEO labels, descriptions and catalogue query keys to the canonical registry.
- Make total, daylight, night, category and family counts derive from the registry across Home, Library, Catalogue, categories, Docs, structured data and automated checks.
- Add `family` as a first-class renderer and catalogue property while preserving existing `state` URLs.

Acceptance:

- No hard-coded public count can drift from the registry.
- The renderer resolves every new state by semantic key.

## Chunk 02 — Aurora & polar sky assets

Status: complete

- Day: polar-day clear, polar-day cloud, nacreous clouds, diamond-dust sunlight and polar twilight.
- Night: polar-night clear, faint aurora, moderate aurora, strong aurora, aurora corona, cloudy aurora and noctilucent clouds.
- Create layered auroral curtains, horizon glow, polar haze, ice shimmer and cloud interaction with intensity-specific motion.
- Keep moon phase, stars, cloud cover and aurora independently readable.

Acceptance:

- Faint, moderate, strong and corona aurora are visibly distinct.
- Aurora curtains flow rather than rotate or bounce; reduced motion preserves a legible static curtain.

## Chunk 03 — Tropical & marine assets

Status: complete

- Day and night variants: sea breeze, tropical shower, monsoon rain, tropical thunderstorm, tropical cyclone, waterspout, marine fog and high surf.
- Create layered swells, foam, spray, rotating cyclone bands, a tapered waterspout and weather-responsive horizon light.
- Reuse canonical rain, lightning and wind layers while adding marine-specific motion.

Acceptance:

- Cyclone, waterspout, monsoon and high surf cannot be mistaken for one generic storm.
- Marine layers never obscure celestial state, location copy or catalogue controls.

## Chunk 04 — Dust, smoke & ash assets

Status: complete

- Day and night variants: airborne dust, sandstorm, smoke, wildfire smoke, volcanic ash and urban smog.
- Create stratified dust flow, granular sand sheets, buoyant smoke curls, ember traces, ash fall and smog diffusion.
- Visibility, sky tint, sun/moon attenuation and wind response must change by aerosol type and severity.

Acceptance:

- Fog, haze, smoke, dust, sand and ash remain visually and semantically distinct.
- Particle motion follows the resolved wind profile and does not look like precipitation.

## Chunk 05 — Rare celestial event assets

Status: complete

- Day: solar halo, sun dogs, circumzenithal arc, rainbow and double rainbow.
- Night: meteor shower, comet, zodiacal light, lunar halo, light pillars and supermoon.
- Preserve the one-celestial-body rule; no event may introduce a duplicate sun or moon.
- Add rare-event glow, reflection and scene-wide illumination without turning stars into fireworks.

Acceptance:

- Meteors travel on varied one-way paths; stars stay in place and blink subtly.
- Halo, rainbow, comet, zodiacal light and pillars are recognizable at catalogue-card size.

## Chunk 06 — Lightweight category routes

Status: complete

- Add `/library/aurora-polar/`, `/library/tropical-marine/`, `/library/dust-smoke-ash/` and `/library/rare-celestial/`.
- Each route includes public product copy, six immediate canonical scenes, family facts, related categories and catalogue deep links.
- Rewrite all existing category copy to describe available user value rather than internal production status.

Acceptance:

- Every category opens directly to visible scenes.
- All 12 category routes share the same header, footer, theme, typography and renderer.

## Chunk 07 — Fast Library and Catalogue architecture

Status: complete

- Replace the Library “roadmap” with a complete browsable global family index.
- Keep the Library landing page to one hero scene plus one lazy preview for each category.
- Make Catalogue family-first with query-state navigation, a maximum of 24 cards per page, next/previous pagination, in-place filtering and no document reload.
- Build only the selected family, mode, state and page; unload offscreen animation while preserving card metadata.
- Preserve old `production=snow-ice` links as a compatibility alias without showing internal production language.

Acceptance:

- Catalogue never creates more than 24 `.variant-card` elements initially or after a filter action.
- Category/filter/page changes update only catalogue results and URL history.
- Library and Catalogue remain responsive on low-power mobile hardware.

## Chunk 08 — Global-audience copy and documentation

Status: complete

- Audit Home, Library, Catalogue, every category, Docs, README, metadata and footer.
- Replace creator-facing or unfinished-product language with concise public documentation, supported-format language and transparent alpha/version statements where necessary.
- Explain how global developers can browse, embed, map weather codes, load on demand, use reduced motion and attribute Meteocons-derived work.
- Keep Buy Me a Coffee CTAs restrained to the shared header, one support band and footer.

Acceptance:

- Public pages contain no internal approval/roadmap/batch wording.
- Copy is idiomatic international English, specific, useful and free of keyword stuffing.

## Chunk 09 — SEO, discovery and route manifests

Status: complete

- Update titles, descriptions, canonicals, schema, sitemap, robots, `llms.txt`, README links and internal navigation for all four new collections.
- Add answer-oriented copy for aurora animation, tropical cyclone SVG, animated marine weather, dust/smoke/ash weather icons and celestial-event scenes.
- Keep catalogue query states `noindex,follow`; category pages remain canonical indexable destinations.

Acceptance:

- Automated SEO checks cover every indexable route.
- Counts, URLs and descriptions match the canonical registry.

## Chunk 10 — Performance, accessibility and browser verification

Status: complete

- Add automated limits for route scene counts, card counts, family coverage and banned internal copy.
- Verify day, twilight and night contrast; keyboard controls; focus visibility; reduced motion; animation containment; mobile, tablet and desktop layouts.
- Browser-test Home, Library, Catalogue, Docs and all 12 categories.
- Run syntax, build, SEO, integrity and whitespace checks.

Acceptance:

- All automated checks pass.
- No route uses a second renderer, duplicated celestial artwork or eager full-catalogue DOM.
- The finished local HTML preview is ready for user review without publishing.

## Definition of done

This goal is complete only when all four global families are rendered by the canonical compositor, all 12 categories are directly browsable, Catalogue is capped and paginated, public copy is globally addressed, canonical counts equal 3,552 everywhere, and cross-route automated plus browser verification passes.

## Completion evidence

- Canonical registry: 3,552 total, 384 daylight and 3,168 night/moon scenes.
- Four new renderer families: 502 aurora/polar, 592 tropical/marine, 444 aerosol and 436 rare-celestial combinations.
- Twelve collection routes render six canonical preview scenes each.
- Catalogue constructs a maximum of 24 cards and updates family, mode, state and pagination in place.
- Automated SEO and application-integrity checks cover 16 indexable routes.
- Desktop browser verification covered Home, Library, Catalogue, Docs and all 12 collection pages.
