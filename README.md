# Atmoscene

**Animated weather icons and living sky scenes that blend into any interface.**

Atmoscene is a planned open-source weather-visualization system for the web, apps, dashboards, broadcasts, and data products. It will combine expressive animated icons with time-aware atmospheric gradients, celestial events, transparent edge feathering, and a data-driven resolver that selects the right visual from real weather data.

> Project status: architecture and catalogue planning. The current name is provisional until the first public release.

## What will make Atmoscene different

- A complete icon and scene system, not a small set of repeated symbols.
- Distinct dawn, sunrise, morning, high-noon, afternoon, sunset, dusk, night, moonrise, and moonset palettes.
- Weather, daylight, moon phase, wind, visibility, air quality, and celestial-event combinations.
- Transparent, feathered scene edges that dissolve naturally into any page background.
- Animated SVG as the lightweight default; Lottie and static exports generated from the same canonical source.
- Line, flat, fill, and monochrome style families with consistent names and geometry.
- Tree-shakeable packages and on-demand loading: applications request only the asset currently needed.
- Global coverage including snow, blizzards, freezing rain, aurora, tropical cyclones, sandstorms, smoke, volcanic ash, marine weather, and polar conditions.
- Accessible reduced-motion fallbacks and high-contrast variants.
- Detailed English documentation, live previews, mapping guides, and copy-ready code examples.

## Planned outputs

| Output | Purpose |
| --- | --- |
| Animated SVG | Default lightweight web format |
| Static SVG | Email, print, server rendering, and reduced motion |
| Lottie JSON | Native apps and advanced motion workflows |
| PNG/WebP | Social, editorial, and no-SVG environments |
| Line / Flat / Fill / Mono | Four interoperable visual families |
| JavaScript/TypeScript resolver | Convert weather data into asset names and scene tokens |
| React, Vue, Svelte, and Web Component wrappers | Framework-friendly integration |
| Icon manifest and JSON schema | Search, tooling, and third-party adapters |

## Roadmap

The complete implementation plan, catalogue, release gates, and acceptance criteria are in [TASK.md](TASK.md).

## Meteocons tribute and attribution

Atmoscene began while studying the breadth, naming, and open-source usefulness of [Meteocons](https://meteocons.com/) by Bas Milius. Meteocons demonstrated how valuable a carefully designed animated weather library can be. Atmoscene will include a permanent tribute page and preserve all required MIT notices for any Meteocons material used during research, prototyping, or compatibility work.

Atmoscene is an independent project and is not affiliated with or endorsed by Meteocons or Bas Milius.

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## License

The original Atmoscene code and assets are intended to be released under the MIT License. Third-party materials retain their original notices and licenses.
