# Atmoscene

**Open-source animated weather icons and living sky scenes for apps, dashboards, websites and broadcasts.**

[![Support Atmoscene on Buy Me a Coffee](https://img.shields.io/badge/Support_Atmoscene-Buy_Me_a_Coffee-FFDD00?style=for-the-badge&logo=buymeacoffee&logoColor=111111)](https://buymeacoffee.com/afnan.hossain)

Atmoscene is an animated weather asset library with a scene-first renderer. It combines local daylight, weather, wind, visibility, atmospheric effects and celestial events into coherent SVG/CSS scenes. The homepage includes a location-aware weather demonstration, while the asset library, catalogue and developer documentation remain the product's core.

The current registry contains **3,552 scene combinations** across **12 directly browsable collections**:

- **384 daylight scenes** across dawn, sunrise, morning, noon, afternoon, sunset and dusk.
- **3,168 night and moon scenes** with phase-aware celestial artwork and fixed-position silver stars.
- **502 aurora and polar-sky scenes**.
- **592 tropical and marine scenes**.
- **444 dust, smoke, ash and smog scenes**.
- **436 rare celestial-event scenes**.
- **Public API v1** with one stable JSON endpoint per scene and a zero-dependency browser SDK.

## What makes Atmoscene different

- A composable scene system rather than a small set of repeated condition icons.
- Distinct daylight and twilight palettes with phase-aware sun and moon placement.
- Weather, wind, visibility, air quality, polar, marine and celestial-event layers.
- Transparent scene edges that blend into surrounding interfaces.
- Lightweight animated SVG and CSS with reduced-motion fallbacks.
- A semantic renderer that applications can drive with weather-provider data.
- Family-first browsing and on-demand rendering; the catalogue mounts no more than 24 previews at once.
- Global coverage including blizzards, aurora, tropical cyclones, waterspouts, sandstorms, smoke, volcanic ash, marine weather and polar conditions.
- English documentation, accessible labels, keyboard navigation and high-contrast day, twilight and night themes.

## Browse the local preview

```bash
npm install
npm run dev
```

Then open:

- Homepage and live library demo: `http://127.0.0.1:8790/`
- Asset library: `http://127.0.0.1:8790/library/`
- Paginated catalogue: `http://127.0.0.1:8790/library/catalog.html`
- Developer documentation: `http://127.0.0.1:8790/docs/`
- API documentation: `http://127.0.0.1:8790/docs/api/`
- Working API consumer: `http://127.0.0.1:8790/api/demo/`

## Public API and SDK

Every scene has a stable versioned URL. The SDK fetches the scene metadata and mounts the same canonical renderer used by Atmoscene itself.

```js
import { AtmosceneClient } from 'https://afnan-hossain.github.io/atmoscene/api/v1/client.mjs';

const atmoscene = new AtmosceneClient();
const scene = await atmoscene.scene('day.sunset.none.rain');
await atmoscene.mount('#weather-scene', scene);
```

- Manifest: `https://afnan-hossain.github.io/atmoscene/api/v1/manifest.json`
- One scene: `https://afnan-hossain.github.io/atmoscene/api/v1/scenes/by-id/day.sunset.none.rain.json`
- Collection: `https://afnan-hossain.github.io/atmoscene/api/v1/collections/core.json`
- Complete API reference: `https://afnan-hossain.github.io/atmoscene/docs/api/`
- Live consumer: `https://afnan-hossain.github.io/atmoscene/api/demo/`

The catalogue is family-first, paginated and updated in place. A filter or page change replaces only the visible result set instead of reloading the document or constructing thousands of animated nodes.

## Global scene collections

| Collection | Coverage |
| --- | --- |
| Daylight & sun | Daylight phases, heat, solar glow and solar events |
| Night & moon | Moon phases, night weather, stars, moonrise and moonset |
| Clouds | Clear, partly cloudy, overcast and layered cloud systems |
| Rain | Drizzle, showers, rain intensity and wind-driven precipitation |
| Storms | Thunderstorms, lightning, severe rain and storm illumination |
| Wind | Condition-aware airflow, gusts, squalls and turbulent motion |
| Fog & haze | Fog, mist, haze and visibility-aware scenes |
| Snow & ice | Flurries, snow, blizzards, freezing fog and diamond dust |
| Aurora & polar sky | Polar day/night, auroral curtains and polar cloud phenomena |
| Tropical & marine | Sea breeze, monsoon, cyclone, waterspout, marine fog and surf |
| Dust, smoke & ash | Dust, sandstorm, smoke, wildfire smoke, volcanic ash and smog |
| Rare celestial events | Halos, sun dogs, rainbows, meteors, comets and light pillars |

Each collection page renders six representative scenes with the same canonical compositor used by the homepage and catalogue. The Library landing page lazy-loads one preview per collection.

## Live weather demonstration

The homepage shows how Atmoscene can resolve a searched or device location into a living sky. It combines current Open-Meteo weather, local daylight, wind, moon phase and air-quality data while adapting contrast, units, date formatting and time-zone labels to the selected location.

On a first visit, the demo may attempt an approximate IP-based location without opening a permission prompt. **Use precise location** requests browser geolocation only after an explicit click and reverse-geocodes the coordinates into a locality name. Manual global place search remains available, and New York is the neutral network-failure fallback.

The hero is a product demonstration, not a replacement for a weather service. Weather and air-quality sources are visibly attributed, and data refreshes without requiring a page reload.

## Renderer example

```html
<div class="weather-scene" data-scene-mount></div>
<script src="/library/js/catalog.js"></script>
<script>
  const scene = AtmosceneSceneRenderer.weather({
    family: "aurora-polar",
    state: "aurora-strong",
    phase: "night",
    moonPhase: "waxing-crescent",
    wind: "light-breeze"
  });

  document.querySelector("[data-scene-mount]").innerHTML = scene;
</script>
```

See the local [developer documentation](apps/docs/index.html) for the current semantic renderer vocabulary and integration guidance.

## Formats and integrations

The browser library currently uses animated SVG/CSS scenes and static reduced-motion states. API v1 and its framework-neutral browser SDK are published from the canonical semantic model. Generated static SVG, Lottie, PNG/WebP, line, flat, fill and monochrome export packages remain future release targets until their versioned files and contracts are published.

## Discoverability architecture

The homepage, library, documentation, catalogue and 12 collection pages include static international-English content, unique metadata, canonical URLs, structured data, XML sitemap entries and automated SEO checks. Collection pages provide crawlable explanations for searches such as **animated weather SVG**, **aurora animation**, **tropical cyclone weather animation**, **marine weather icons**, **sandstorm animation**, **volcanic ash weather icon** and **celestial-event SVG**.

The detailed keyword map, Google snippet strategy, AI-search guidance and launch measurement plan are in [docs/SEO_PLAN.md](docs/SEO_PLAN.md). Search snippets, rich results, AI citations and rankings remain search-engine decisions and are never guaranteed.

## Verification

```bash
npm run check
npm run build
```

The checks validate route metadata, canonical scene counts, family coverage, catalogue limits, internal links and public-copy rules.

## Meteocons tribute and attribution

Atmoscene began while studying the breadth, naming and open-source usefulness of [Meteocons](https://meteocons.com/) by Bas Milius. Meteocons demonstrated how valuable a carefully designed animated weather library can be. Atmoscene preserves required notices for Meteocons-derived condition artwork and composes those ingredients with original Atmoscene sky, weather, atmospheric and celestial layers.

Atmoscene is independent and is not affiliated with or endorsed by Meteocons or Bas Milius. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## License and support

Original Atmoscene code and assets are intended for release under the MIT License. Third-party materials retain their original licenses and notices.

Atmoscene is created by **Afnan Hossain**. If the library, renderer or documentation helps your project, support continued open-source development through [Buy Me a Coffee](https://buymeacoffee.com/afnan.hossain).

Copyright © Afnan Hossain.
