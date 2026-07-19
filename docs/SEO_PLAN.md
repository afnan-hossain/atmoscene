# Atmoscene SEO and AI-search plan

Research date: 2026-07-17

Atmoscene should be discoverable as an animated weather asset library first and a live-weather demo second. This plan uses search-intent clusters and useful category documentation rather than repeating keywords. Numeric search volume has not been claimed because no paid keyword-volume dataset was used; the current research identifies language, competing page types, user intent, and content gaps.

## Search goals

1. Rank library and category pages for people looking for weather design assets.
2. Rank documentation for developers choosing formats, frameworks, APIs, and data-provider mappings.
3. Make factual project information easy for conventional search, Google AI features, Bing/Copilot, and other answer engines to extract and cite.
4. Never index thin or duplicate pages; canonicalize filtered catalogue states to the main catalogue route.
5. Preserve speed by rendering one asset category at a time and lazy-loading interactive previews.

## Keyword and intent map

### Core asset discovery

Primary language:

- animated weather icons
- animated weather SVG
- weather SVG icons
- open-source weather icons
- animated weather scenes
- weather animation library
- Lottie weather icons
- free animated weather icons

Primary pages: homepage, asset-library index, format documentation.

### Developer integration

Primary language:

- weather icon API
- weather scene API
- Open-Meteo weather icons
- WMO weather code icons
- React weather icons
- Vue weather icons
- Svelte weather icons
- animated weather Web Component
- SVG vs Lottie weather animation
- weather icons CDN

Primary pages: documentation and future versioned API, provider-mapping and framework guides.

### Condition and scene families

Primary language:

- sunrise weather animation
- sunset weather SVG
- moon phase icons SVG
- animated night weather icons
- animated rain icons
- thunderstorm lightning animation
- animated wind weather
- fog and haze animation
- snow and blizzard weather icons
- freezing rain and sleet icons
- aurora animation SVG
- tropical cyclone weather animation
- sandstorm, smoke, ash and air-quality weather icons
- polar day and polar night animation
- solar eclipse and lunar eclipse animation

Primary pages: one static, crawlable collection page per available family. Atmoscene currently exposes 12 useful collection routes, including dedicated aurora/polar, tropical/marine, aerosol and rare-celestial pages.

### Product and use-case language

- weather icons for apps
- weather dashboard icons
- animated weather background
- weather UI animation
- weather visuals for websites
- climate dashboard assets
- smart-home weather display icons
- broadcast weather graphics

Primary pages: homepage, use-case guides, gallery and future community showcase.

## Page architecture

| Search intent | Canonical route | Indexing rule |
| --- | --- | --- |
| Brand, animated weather library | `/` | Index |
| Browse categories | `/library/` | Index |
| Daylight and sun | `/library/daylight-sun/` | Index now |
| Night and moon phases | `/library/night-moon/` | Index now |
| Cloud systems | `/library/clouds/` | Index now |
| Rain | `/library/rain/` | Index now |
| Storm and lightning | `/library/storms/` | Index now |
| Wind | `/library/wind/` | Index now |
| Fog and haze | `/library/fog-haze/` | Index now |
| Interactive catalogue | `/library/catalog.html` | Index the canonical unfiltered catalogue |
| Filtered catalogue states | `/library/catalog.html?family=...` | Canonicalize to `/library/catalog.html` |
| Snow and ice | `/library/snow-ice/` | Index now |
| Aurora and polar sky | `/library/aurora-polar/` | Index now |
| Tropical and marine | `/library/tropical-marine/` | Index now |
| Dust, smoke and ash | `/library/dust-smoke-ash/` | Index now |
| Rare celestial events | `/library/rare-celestial/` | Index now |
| Developer documentation | `/docs/` and future child guides | Index |
| Public resolver API | future `/docs/api/` | Index only after versioned contract exists |

## Google snippet strategy

Google chooses snippets from visible page content and may use the meta description when it describes the page well. Atmoscene cannot force or guarantee a particular snippet. Each indexable page therefore needs:

- one precise title and one unique meta description;
- a descriptive H1 aligned with the page’s actual asset family;
- a direct opening paragraph that answers what the category contains;
- concise question-and-answer passages written for users, not hidden solely in structured data;
- descriptive internal-link anchors;
- no availability claims for formats, downloads or APIs that have not been published;
- `max-snippet:-1` and `max-image-preview:large` where appropriate.

Reference: [Google’s control over search-result snippets](https://developers.google.com/search/docs/appearance/snippet).

## Structured data

- Homepage: `WebSite`, `SoftwareApplication`, and `SoftwareSourceCode`.
- Asset-library index and category pages: `CollectionPage` and `BreadcrumbList`.
- Documentation: `TechArticle` and `BreadcrumbList`.
- Future individual asset pages: use `CreativeWork` or `ImageObject` only when visible metadata and downloadable artwork support the markup.
- Future stable catalogue manifests may also qualify for dataset documentation, but `Dataset` markup must not be added before a real downloadable, described dataset exists.
- Never add review, rating, price, FAQ, or download claims that are absent from the visible page.

Rich results are eligibility signals, not guarantees. Validate JSON-LD before publishing. References: [Google Search appearance](https://developers.google.com/search/docs/appearance), [Software app structured data](https://developers.google.com/search/docs/appearance/structured-data/software-app), and [breadcrumb structured data](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb).

## AI-search discoverability

Google states that its AI search features do not require a separate AI-only optimization system; pages still need to be indexed, snippet-eligible, helpful, and technically accessible. Atmoscene’s AI-search work therefore focuses on clarity and evidence:

- static HTML contains the product definition, verified 3,552-scene count, available collections, current formats, attribution and release boundaries;
- headings use stable entity and category names;
- documentation answers common implementation questions directly;
- canonical URLs avoid query-parameter ambiguity;
- `llms.txt` provides a concise, factual map for systems that voluntarily read it, without treating it as an official ranking signal;
- source repository, author, license, attribution, versions, changelog, manifests and release notes remain consistent;
- future API and export metadata will expose stable semantic IDs and accessible descriptions;
- future formats are kept separate from the 12 currently browsable scene collections so answer engines can distinguish available browser assets from future packages.

Reference: [Google AI features and your website](https://developers.google.com/search/docs/appearance/ai-features).

## Technical checklist

- Static HTML and useful copy without requiring JavaScript.
- Unique canonical URL, title, description and H1 for every indexable route.
- `robots.txt`, XML sitemap and one canonical URL for the catalogue and its parameter-based views.
- Open Graph and X metadata; add a bespoke social image only after original Atmoscene artwork is approved.
- Structured-data validation and internal-link checks in CI.
- Accessible SVG labels and reduced-motion output.
- Lazy loading and category-level code splitting.
- Stable 200/404 behavior and no redirect chains.
- GitHub Pages base-path testing before launch.
- Search Console and Bing Webmaster Tools verification after launch.
- Submit sitemap after launch; use IndexNow for meaningful page and asset updates where supported.
- Monitor queries, impressions, clicks, crawl errors, Core Web Vitals, indexed pages and AI/chat impressions where reporting is available.

## Editorial expansion

1. Format guide: animated SVG vs static SVG vs Lottie.
2. Provider guide: Open-Meteo and WMO code mapping.
3. Framework guides: React, Vue, Svelte and Web Components.
4. Accessibility guide: reduced motion, contrast and meaningful alt text.
5. Performance guide based on measured file sizes and runtime cost.
6. Deeper implementation guides for each of the 12 global weather collections.
7. Release notes and changelog with stable version links.
8. Gallery of real integrations after community examples exist.

## Acceptance criteria

- No duplicate titles or descriptions across indexable routes.
- Every indexed page is useful without JavaScript.
- JSON-LD parses and matches visible content.
- Sitemap lists only canonical, indexable pages.
- Parameter-based explorer states resolve to the catalogue canonical URL.
- Available collections and future export packages are described separately and accurately.
- Representative pages target Lighthouse SEO and accessibility scores of 100 before public launch.
- Search performance is evaluated after sufficient crawl/index time; rankings and snippets are never promised.
