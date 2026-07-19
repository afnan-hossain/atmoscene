# Atmoscene Final Brand-Ready Deliverables

Objective: finish every public sitemap route one at a time as a coherent, globally useful, production-ready Atmoscene experience. The homepage is the visual and interaction benchmark; each subsequent route must feel authored for its own purpose while sharing the same brand, renderer, theme behavior, accessibility standard and performance discipline.

## Release standard applied to every page

Each route is complete only after all of the following are true:

- Atmoscene is presented first as an animated weather asset library; live weather is a product demonstration.
- Shared transparent header, animated logo, navigation, support CTA and footer match the homepage in scale, spacing and contrast.
- Page-specific hero explains the route in one screen and immediately shows real canonical Atmoscene artwork.
- Day, dawn, dusk and night palettes use comfortable non-black/non-white text, readable normal/hover/focus states and fluid transitions.
- Cards, filters, dialogs, code examples, support panels and CTAs belong to one token system.
- Only the canonical scene compositor is used; celestial objects, weather and wind remain proportionate and contained.
- Scene previews are lazy and capped. A page never builds the full 3,552-scene catalogue DOM.
- Keyboard, touch, reduced-motion and visible focus behavior are preserved.
- Public copy is concise international English for developers, designers, product teams, weather services, broadcasters and educators.
- Title, description, canonical, structured data, internal links and crawlable page content match the route’s search intent.
- Desktop, tablet and mobile layouts pass visual and overflow review before the page status becomes complete.

## Sitemap execution order

### Page 00 — Home `/`

Status: complete

- Four astronomical themes, severe-weather modifier, compact live demo, meaningful proof points and detailed weather controls are complete.
- Homepage remains the visual reference and is regression-tested after each shared-shell change.

### Page 01 — Asset Library `/library/`

Status: complete

- Refine the opening composition so identity, catalogue value and canonical live scene read as one branded hero.
- Present all 12 collections as immediately understandable visual products, not a directory grid.
- Keep category previews lightweight and lazy while making every card useful without another click.
- Replace generic closing content with formats, resolver value, integration paths and a restrained support CTA.
- Verify all four themes, card hover states, responsive grouping and scene containment.

### Page 02 — Scene Catalogue `/library/catalog.html`

Status: complete

- Treat filters, search, pagination and results as one polished application workspace.
- Preserve in-place filtering, URL/history sync, 24-card maximum, lazy hydration and accessible dialog previews.
- Make loading, empty, error and active-filter states theme-specific and brand-consistent.
- Keep query states `noindex,follow` and the base explorer canonical.

### Page 03 — Daylight & Sun `/library/daylight-sun/`

Status: complete

- Lead with the daylight phase system and one-sun rule.
- Show sunrise, morning, noon, afternoon, sunset, dusk and eclipse examples with phase-specific gradients.
- Explain resolver inputs and integration value without production-internal language.

### Page 04 — Night & Moon `/library/night-moon/`

Status: complete

- Lead with textured lunar phases, glow/halo logic and cloud-aware silver stars.
- Demonstrate evening, moonrise, midnight, late night, moonset and pre-dawn.
- Keep new moon, eclipse and special-moon behavior technically accurate and visually distinct.

### Page 05 — Clouds `/library/clouds/`

Status: complete

- Organize clear, partly cloudy, mostly cloudy and overcast layers by coverage and depth.
- Demonstrate cloud motion separately from wind direction and precipitation.
- Make coverage and safe-area behavior legible at card size.

### Page 06 — Rain `/library/rain/`

Status: complete

- Distinguish drizzle, steady rain, showers and heavy rain through density, speed and scene lighting.
- Demonstrate day/night and wind-driven variants without duplicating celestial bodies.
- Explain lightweight composition and weather-code mapping.

### Page 07 — Storms `/library/storms/`

Status: complete

- Demonstrate varied lightning paths, scene-wide illumination, heavy rain and turbulent wind.
- Keep text and controls protected from high-energy animation.
- Include reduced-motion and severe-weather accessibility guidance.

### Page 08 — Wind `/library/wind/`

Status: complete

- Present calm, breeze, open-air, cloud-flow, precipitation shear, laminar flow, drift, gusting and turbulent profiles.
- Explain speed, gust ratio and direction inputs.
- Prove that wind flows instead of bouncing, dancing or reusing one loop.

### Page 09 — Fog & Haze `/library/fog-haze/`

Status: complete

- Separate fog, mist, haze, smog and low-visibility depth treatments.
- Demonstrate laminar motion and celestial attenuation without moustache-like cloud shapes.
- Explain visibility and air-quality inputs.

### Page 10 — Snow & Ice `/library/snow-ice/`

Status: in progress

- Distinguish flurries, snow, heavy snow, blowing snow, blizzard, freezing fog and diamond dust.
- Show accumulation, drift and visibility behavior.
- Keep white artwork readable across bright and dark sky palettes.

### Page 11 — Aurora & Polar `/library/aurora-polar/`

Status: pending

- Show polar day/night, faint-to-corona aurora, nacreous and noctilucent clouds.
- Preserve moon phase, stars, cloud cover and auroral curtains as independent layers.
- Explain reduced-motion and high-latitude use cases.

### Page 12 — Tropical & Marine `/library/tropical-marine/`

Status: pending

- Present sea breeze, tropical shower, monsoon, thunderstorm, cyclone, waterspout, marine fog and high surf.
- Separate swell, foam, spray and rotating storm-band motion.
- Keep horizons and celestial artwork proportionate.

### Page 13 — Dust, Smoke & Ash `/library/dust-smoke-ash/`

Status: pending

- Distinguish airborne dust, sandstorm, smoke, wildfire smoke, volcanic ash and urban smog.
- Demonstrate type-specific sky tint, attenuation, particles and wind response.
- Avoid treating aerosols as rain or generic fog.

### Page 14 — Rare Celestial Events `/library/rare-celestial/`

Status: pending

- Present solar halo, sun dogs, circumzenithal arc, rainbow, double rainbow, meteor shower, comet, zodiacal light, lunar halo, light pillars and supermoon.
- Enforce the one-celestial-body rule and stable blinking stars.
- Explain event data requirements and graceful fallback behavior.

### Page 15 — Documentation `/docs/`

Status: pending

- Build a readable integration experience for SVG, static SVG, on-demand rendering, resolver inputs, framework usage and reduced motion.
- Include copyable, keyboard-accessible examples backed by the production renderer.
- Cover licensing, Meteocons attribution, package/API direction and performance guidance.

## Shared release deliverables

Status: pending

- One final shared design-token and shell audit across all 16 routes.
- Automated count, route, canonical, metadata, internal-copy, scene-cap and renderer-source checks.
- Cross-route keyboard, reduced-motion, theme and responsive browser verification.
- Updated sitemap dates, robots, `llms.txt`, README links and structured data.
- Final GitHub Pages-compatible build with no publication until explicit approval.

## Current execution rule

Only one sitemap page is actively redesigned at a time. Shared changes may be introduced during that page, but the next route does not begin until the active route passes its page-specific and shared acceptance checks.

## Completed-page evidence

### Page 01 — Asset Library

- Hero height reduced from 971px to 779px at the desktop review viewport while retaining a full canonical scene, library value, actions and verified counts.
- All 12 collection cards are organized into three audience-readable groups and hydrate lazily through the canonical renderer.
- Added compositor workflow, supported output/integration formats and a structured-data `ItemList` for all 12 collection routes.
- Added independent dawn and dusk shared-shell palettes, stronger shared navigation sizing and complete normal/focus/hover treatments.
- Browser verification confirmed zero horizontal overflow, visible keyboard focus, one canonical hero renderer and capped lazy preview loading.
- SEO and application-integrity checks pass for all 16 indexable routes.

### Page 02 — Scene Catalogue

- Rebuilt the explorer controls as one themed workspace with functional family, mode, condition, search and pagination controls; removed placeholder style buttons and documented the actual animated SVG/static-fallback output contract.
- Kept catalogue rendering capped at 24 cards with lazy hydration, in-place URL/history synchronization and no full-page refresh during search, filter, clear or browser-history changes.
- Added theme-aware loading, empty, hover, focus, pager and preview-dialog states plus a clear-search recovery action.
- Added WebApplication structured data and crawl-safe query handling: the canonical base is indexable while filtered/search states become `noindex, follow`.
- Browser verification confirmed 24 cards, 12 lazy-loaded visible scenes, zero horizontal overflow, a working canonical-scene dialog and correct filtered-state robots metadata.
- Automated SEO and integrity checks pass across all 16 public routes.

### Page 03 — Daylight & Sun

- Rebuilt the route hero into a balanced product composition with concise international copy and a canonical shared-compositor scene; removed the broken flat grid that placed breadcrumb, heading and preview in conflicting columns.
- Added a crawlable eight-phase rail and eight live previews covering dawn, sunrise, morning, noon, afternoon, sunset, dusk and solar eclipse.
- Added route-specific resolver documentation for inputs, scene composition and animated/static output plus an explicit one-sun celestial safeguard.
- Added an eight-item structured-data list and complete social metadata for daylight weather-animation search intent.
- Browser verification confirmed the shared library renderer, eight preview cards, three resolver steps, a contained hero below the transparent header and zero horizontal overflow.
- Automated SEO, syntax, route and integrity checks pass.

### Page 04 — Night & Moon

- Rebuilt the hero around a proportional waxing-crescent scene from the canonical renderer, with contained moon placement, stable silver stars and readable night-theme content.
- Added a crawlable rail for all 11 lunar and special-event states plus nine live previews covering new moon, waxing phases, full moon, waning phases, pink moon, blood moon and lunar eclipse.
- Added a lunar resolver workflow that separates night period, lunar state and weather attenuation, including explicit new-moon and grooved-crater behavior.
- Added an 11-item structured-data list and complete social metadata for moon phase and night-weather animation search intent.
- Browser verification confirmed nine preview scenes, 11 lunar states, three resolver steps, canonical shared-compositor provenance and zero horizontal overflow.
- Automated SEO, syntax, route and integrity checks pass.

### Page 05 — Clouds

- Rebuilt the route around a canonical partly-cloudy scene and concise global product copy; removed internal roadmap language from the public experience.
- Added five crawlable cloud-cover bands and eight live scenes spanning mostly clear, partly cloudy and overcast daylight/night compositions.
- Added a cloud resolver workflow that separates coverage, phase-aware depth and wind-driven motion while preserving one correctly resolved celestial body.
- Added route-specific ItemList structured data and social metadata for animated cloud-cover SVG search intent.
- Browser verification confirmed the canonical renderer, eight scene cards, five coverage bands, three resolver steps, readable dusk-theme CTAs and zero horizontal overflow.
- Automated SEO, syntax, route and integrity checks pass.

### Page 06 — Rain

- Rebuilt the hero around a live morning-rain composition and clear international product messaging for weather applications, dashboards and websites.
- Added four crawlable rain-intensity profiles and eight live day/night previews covering drizzle, steady rain, tropical showers and heavy rain.
- Added a precipitation resolver workflow linking rate, probability, phase, cloud weight and wind shear while keeping those layers independently composable.
- Added route-specific ItemList structured data and social metadata for animated rain icon and weather-scene search intent.
- Browser verification confirmed eight canonical scenes, four intensity profiles, three resolver steps, clear dusk-theme CTAs and zero horizontal overflow.
- Automated SEO, syntax, route and integrity checks pass.

### Page 07 — Storms

- Rebuilt the route around a canonical daytime thunderstorm scene with high-contrast day-theme copy and controls.
- Added four severe-weather profiles and eight live scenes spanning daylight/night storms, tropical thunderstorms, tropical cyclones and blizzards.
- Added a severe-weather resolver workflow connecting severity, precipitation, gust ratio, varied lightning branches and full-scene flash response.
- Added explicit content-safe and reduced-motion behavior plus route-specific ItemList and social metadata.
- Browser verification confirmed eight live scenes, four profiles, three resolver steps, shared-compositor provenance and zero horizontal overflow.
- Automated SEO, syntax, route and integrity checks pass.

### Page 08 — Wind

- Rebuilt the route around a canonical open-air wind scene and a clear nine-profile product model rather than four visually interchangeable intensity labels.
- Added nine live compositor previews for calm, breeze, open-air, cloud-flow, precipitation shear, laminar fog, snow drift, gusting and turbulent motion.
- Extended category scene configuration with safe per-preview weather overrides so each profile is verified through the production compositor without changing catalogue counts.
- Added direction, speed and gust-ratio resolver documentation, windsock separation guidance, ItemList structured data and social metadata.
- Browser verification inspected the rendered `data-wind-profile` values for all nine scenes, confirmed shared-compositor provenance and found zero horizontal overflow.
- Automated SEO, syntax, route and integrity checks pass.

### Page 09 — Fog & Haze

- Rebuilt the route around a canonical dawn-fog composition and separated fog, mist, haze, smog and freezing fog as distinct atmospheric products.
- Added five crawlable visibility profiles and nine live scenes across daylight and night, including marine mist, urban smog and freezing fog.
- Added a visibility resolver workflow for measured range, particulate type, depth, tint, celestial attenuation and readable low-visibility output.
- Corrected page-level motion semantics so fog, marine mist and freezing fog use laminar flow while smog uses the aerosol profile.
- Browser verification inspected each scene’s visibility and wind-profile data, confirmed canonical provenance and found zero horizontal overflow.
- Automated SEO, syntax, route and integrity checks pass.
