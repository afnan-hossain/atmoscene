# Atmoscene Unified Rebuild Goal

## Objective

Rebuild Atmoscene as one coherent asset-library web application. Home, Library, Catalogue, category collections, documentation, and the live weather demo must use the homepage's visual language, navigation, responsive behavior, theme engine, scene compositor, terminology, and interaction patterns. Legacy pages are reference material only; they must not remain as visibly separate stitched sites.

## Non-negotiable product rules

- Atmoscene is primarily an animated weather asset library. The live weather experience demonstrates the library.
- One shared header, footer, logo treatment, type scale, spacing system, theme system, button system, loader system, and responsive container system across every route.
- One shared scene renderer and one scene-state vocabulary across Home, Library, Catalogue, category pages, forecasts, and documentation examples.
- Day, twilight, and night themes must remain readable without pure black or pure white interface text.
- Catalogue filtering updates only the results region and preserves browser history; it never reloads the whole document.
- Scene objects remain proportionate and inside route-specific safe areas.
- Wind animation is resolved from both measured intensity and weather profile. Rain, storms, snow, fog, clouds, and clear air must not reuse an indistinguishable motion treatment.
- Scene totals are generated from the canonical registry and updated everywhere from one source.
- No GPS accuracy sentence is exposed in the hero search UI.
- Detailed weather icons remain clearly visible in every theme without increasing card height.

## Chunk 00 — Architecture and route audit

Status: in progress — semantic resolver is wired; artwork review remains

- Inventory every public route, stylesheet, renderer, theme hook, navigation structure, count source, and loader.
- Identify legacy visual shells and duplicated tokens.
- Record current route responsibilities and migration order.
- Freeze homepage Goal 04 as the visual reference, not as a file-copy target.

Acceptance:

- All public routes are accounted for.
- Legacy catalogue navigation and wind-state limitations have identified replacement paths.

## Chunk 01 — Canonical foundation and motion semantics

Status: in progress — shared shell exists; cross-route polish remains

- Create the shared application-shell contract used by every route.
- Establish shared theme, type, container, header, footer, button, card, loader, focus, and reduced-motion tokens.
- Add semantic wind profiles: open-air, cloud-flow, precipitation, turbulent storm, low laminar visibility, and snow/ice drift.
- Resolve profile and intensity independently in the canonical scene renderer.
- Remove GPS accuracy/reverse-geocoding copy.
- Increase detailed weather artwork while preserving the compact bento height.

Acceptance:

- The same renderer produces visibly different wind behavior for clear, cloud, rain, storm, fog/haze, and snow/ice scenes at the same nominal wind level.
- Hero, cards, and catalogue continue to use the canonical renderer.
- Weather cards remain 600px total height on desktop.

## Chunk 02 — Unified application shell

Status: in progress — structure is unified; representative artwork is under review

- Build one shared header/footer component and one responsive navigation model.
- Use the same animated Atmoscene logo, support CTA, active-route state, theme contrast, mobile menu, keyboard behavior, and page container on every route.
- Remove old `lab-header`, catalogue-only header, and route-specific footer markup after migration.
- Keep GitHub Pages-compatible relative routing.

Acceptance:

- Moving between Home, Library, Catalogue, category, and Docs never looks like a different site.
- Header dimensions and navigation order remain stable between routes.

## Chunk 03 — Library landing rebuild

Status: in progress — control workflow rebuilt; responsive and interaction QA remains

- Rebuild the Library landing page from the homepage system rather than restyling the old grid.
- Lead with product identity, current total, formats, and a small location-aware scene selection.
- Render live scene previews directly inside category modules.
- Keep the page lightweight by selecting a limited representative set.

Acceptance:

- Category scenes appear without another preview click.
- Homepage and Library share the same hierarchy, cards, transitions, and theme response.

## Chunk 04 — Catalogue explorer rebuild

Status: in progress — shared template is live; category art and content QA remains

- Rebuild the explorer as an application view using the shared shell.
- Keep results-region-only filtering, themed preloaders, URL/history sync, lazy scene hydration, accessible dialog preview, and searchable metadata.
- Replace the legacy sticky filter column with a responsive shared toolbar/drawer pattern.
- Preserve category-wise loading so 1,578 scenes are never rendered at once.

Acceptance:

- Filter state changes without document navigation or scroll reset.
- Desktop, tablet, and mobile controls belong to the same visual system as Home.

## Chunk 05 — Category template rebuild

Status: pending final shared-shell and example QA

- Replace individually stitched category pages with one shared category template and data registry.
- Migrate Daylight, Night/Moon, Clouds, Rain, Storms, Wind, Fog/Haze, and Snow/Ice.
- Give each category relevant live scenes, explanatory content, formats, and related categories without changing the site identity.

Acceptance:

- All eight categories use identical structural components and route-aware content.
- No category loads text-only before scenes.

## Chunk 06 — Documentation and integration experience

Status: completed

- Rebuild Docs inside the shared shell.
- Document SVG, static SVG, Lottie roadmap, framework components, on-demand loading, scene resolver inputs, API roadmap, licensing, and Meteocons attribution.
- Add copyable examples and route-linked examples using real canonical scenes.

Acceptance:

- Docs visually and behaviorally belong to the same application.
- Examples use the production renderer rather than duplicate artwork.

## Chunk 07 — Registry, counts, performance, and accessibility

Status: in progress

- Move scene totals and category metadata into one canonical registry.
- Generate visible counts and structured metadata from it.
- Validate lazy loading, reduced motion, keyboard navigation, focus treatment, contrast, responsive layout, and no-JS crawlable content.
- Keep homepage preview selection small and location-aware.
- Keep the shared header fully transparent over every route's opening scene with day, twilight, and night contrast tokens.
- Credit Afnan Hossain with an automatically updated copyright year and place restrained Buy Me a Coffee CTAs in the header, one shared body support band, and the footer.

Acceptance:

- Counts cannot drift between routes.
- Core pages meet the agreed performance and accessibility budgets.

## Chunk 08 — SEO, AI discovery, and launch readiness

Status: pending

- Align titles, descriptions, canonicals, schema, sitemap, robots, `llms.txt`, internal links, and answer-oriented copy with the unified route model.
- Validate animated-weather-SVG, weather-scene-library, weather-icons, moon-phase-weather, wind-animation, and related global search intent without keyword stuffing.
- Preserve GitHub Pages deployment and future API/package paths.

Acceptance:

- Every indexable route passes automated SEO checks.
- Catalogue state URLs remain `noindex,follow` while category pages remain canonical discovery pages.

## Chunk 09 — Cross-route browser verification and approval

Status: pending

- Verify Home, Library, Catalogue, all category pages, and Docs at desktop, tablet, and mobile sizes.
- Verify day, twilight, and night contrast.
- Verify hero safe areas, preloaders, filters, dialogs, unit defaults, location search, precise location naming, and weather-card visuals.
- Verify distinct wind profiles with controlled scene examples.

Acceptance:

- No route resembles a separate legacy site.
- No scene object collides with navigation or content.
- User can review the complete local HTML application before publication.

## Work order

Chunks are completed sequentially. A later chunk may add tests or registry data needed by an earlier one, but a route is not declared migrated until it uses the shared shell and renderer and passes browser verification.

## Current repair sprint — homepage first, then the route tree

### A. Homepage functional truth

- [x] Keep temperature control in both the hero and detailed weather panel.
- [x] Default to IP-derived location on a normal open or refresh; do not persist a manually searched city.
- [x] Preserve explicit shared-location URLs only when `share=1` is present.
- [x] Resolve day/night from local sunrise and sunset, not the raw API day flag alone.
- [x] Expose the canonical scene renderer and resolved wind profile on the hero for QA.
- [ ] Complete controlled-browser checks for clear, cloud, rain, storm, visibility and snow profiles.

### B. Homepage visual quality

- [x] Four readable theme states: dawn, day, dusk and night.
- [x] Restore lower-page text contrast and theme-aware hover states.
- [x] Add a real phase horizon and lower sunrise/sunset artwork to it.
- [x] Reduce glossy sun depth so it belongs with the rest of the visual language.
- [x] Use a neutral Atmoscene loader unrelated to any weather condition.
- [x] Reduce the desktop weather bento from five metric rows to four.
- [ ] Finish art-direction review for the eclipse, aerosols, marine and polar examples.

### C. Product information architecture

- [x] Rename the two distinct destinations: **Asset collections** for curated families and **Scene explorer** for individual combinations.
- [x] Rebuild the Scene Explorer as four ordered choices: collection, sky time, weather type and optional search.
- [x] Keep filter changes inside the results region and synchronize the URL without a document reload.
- [ ] Verify the rebuilt control layout on tablet and mobile.

### D. Route-by-route finish order

1. Home / live library demo
2. Asset collections landing
3. Scene Explorer
4. Core category pages
5. Snow and ice
6. Aurora and polar
7. Tropical and marine
8. Dust, smoke and ash
9. Rare celestial events
10. Documentation, SEO and final browser QA
