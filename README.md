# Atmoscene

**Animated weather icons and living sky scenes that blend into any interface.**

[![Support Atmoscene on Buy Me a Coffee](https://img.shields.io/badge/Support_Atmoscene-Buy_Me_a_Coffee-FFDD00?style=for-the-badge&logo=buymeacoffee&logoColor=111111)](https://buymeacoffee.com/afnan.hossain)

Atmoscene is an open-source weather-visualization system for the web, apps, dashboards, broadcasts, and data products. It combines expressive animated icons with time-aware atmospheric gradients, celestial events, transparent edge feathering, and a data-driven resolver that selects the right visual from real weather data.

> **Atmoscene is the final project name.** The project is currently in its engine-and-asset prototyping phase; GitHub Pages will be published only after the local experience and core catalogue are approved.

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

## Local live-weather prototype

The first local prototype lets a visitor search for any global location and resolves current weather, local daylight, wind, moon phase, air quality, and a seven-day forecast into an animated scene. The page uses Open-Meteo weather/geocoding data and Open-Meteo air-quality data powered by CAMS, with visible attribution.

```bash
npm run dev
```

Then open `http://127.0.0.1:8790`. GitHub Pages is intentionally disabled until the local engine and original Atmoscene asset catalogue are approved.

The prototype condition layer temporarily uses attributed Meteocons SVGs. Atmoscene’s original canonical assets will replace those files as the line, flat, fill, monochrome, static SVG, animated SVG, and Lottie families are completed.

## Meteocons tribute and attribution

Atmoscene began while studying the breadth, naming, and open-source usefulness of [Meteocons](https://meteocons.com/) by Bas Milius. Meteocons demonstrated how valuable a carefully designed animated weather library can be. Atmoscene will include a permanent tribute page and preserve all required MIT notices for any Meteocons material used during research, prototyping, or compatibility work.

Atmoscene is an independent project and is not affiliated with or endorsed by Meteocons or Bas Milius.

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## License

The original Atmoscene code and assets are intended to be released under the MIT License. Third-party materials retain their original notices and licenses.

## Support Atmoscene

Atmoscene will remain free and open source. If the icons, animation engine, or documentation help your project, you can support ongoing design and development through [Buy Me a Coffee](https://buymeacoffee.com/afnan.hossain).

[Support the project](https://buymeacoffee.com/afnan.hossain)
