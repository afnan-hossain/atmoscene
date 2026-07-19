# Atmoscene Homepage Theme and Interaction Goal

Objective: make the Atmoscene homepage a visually coherent, fluid demonstration of the asset library across night, dawn, day and dusk. Every theme must provide readable normal, hover, focus, active, loading and disabled states without using pure black or pure white. Weather remains a scene modifier; it must never break the astronomical theme or product hierarchy.

## Product rules

- The homepage presents Atmoscene as an asset library first and a live local sky as its demonstration.
- Header, hero, search, detailed weather bento, timeline, library preview cards, informational panels and footer must feel like one site.
- Theme changes are driven by the searched location, not the visitor computer.
- Night, dawn, day and dusk have independent palettes. Storm, precipitation, fog, haze, snow and wind modify the active palette without becoming unrelated site themes.
- Text must not use pure `#000` or pure `#fff`; all essential text and controls target WCAG AA contrast.
- Hover states must preserve or improve contrast. No dark-theme control may flash to a light surface unless that change is intentional and readable.
- Motion uses transform and opacity, remains fluid, and respects `prefers-reduced-motion`.

## Theme matrix

### Night

- Deep blue-black page ground with cool slate panels and cyan/periwinkle accents.
- Search, suggestions, weather bento and timeline remain dark translucent surfaces.
- Silver stars and lunar artwork remain legible; controls never obscure celestial objects.
- Hover surfaces brighten slightly in chroma and elevation without becoming white.

### Dawn

- Indigo-to-muted-apricot atmosphere with aubergine/slate content surfaces.
- Warm coral accent is balanced with cool cyan for actions and focus rings.
- Copy remains warm off-white with muted mauve secondary text.
- Hover surfaces deepen rather than switching to a day card.

### Day

- Pale atmospheric blue/teal page ground with softly tinted off-white panels.
- Ink uses deep desaturated blue—not black—and secondary copy uses slate teal.
- Hover surfaces gain cool color, defined borders and controlled elevation.
- Logo, metric artwork and search controls remain visible against bright skies.

### Dusk

- Deep violet/navy ground with rose-gold atmospheric accents.
- Panels use blue-violet glass distinct from dawn’s warmer aubergine.
- Copy uses lavender-gray and warm pearl; focus and active states remain crisp.
- Night transition feels natural without duplicating the night palette.

### Severe-weather modifier

- Storm, heavy rain, snow, fog and haze may darken or desaturate hero glass and increase contrast.
- Modifier never changes the content section to an unrelated theme.
- Lightning and precipitation remain behind text and controls.

## Chunk 01 — Shared structure and hierarchy

Status: complete

- Move temperature and wind-unit toggles out of the hero and into the detailed weather section.
- Keep only a compact Live indicator and refresh icon in the hero.
- Make the location search smaller, denser and theme-aware.
- Increase desktop header navigation size and hit areas.
- Replace hero proof points with user-relevant library facts.
- Rewrite the live scene status so it explains what Atmoscene is composing and when it refreshes.

Acceptance:

- Hero contains no unexplained wind-unit control.
- Both unit controls are present beside detailed weather freshness controls.
- Search remains compact on desktop and touch-safe on mobile.

## Chunk 02 — Authoritative theme tokens

Status: complete

- Define final tokens for page ground, section ground, panel, panel hover, border, strong border, primary text, secondary text, accent, focus ring, shadow and hero search surfaces.
- Add independent `dawn` and `dusk` document themes; retain a compatibility alias for old `twilight` state.
- Route every homepage surface and interaction through these tokens.

Acceptance:

- One final token layer controls all homepage components.
- No old day-mode rule can force a light hover in night, dawn or dusk.

## Chunk 03 — Night theme

Status: complete

- Verify header, hero copy, search normal/hover/focus/results, live controls, engine note, detailed bento, freshness controls, timeline, library cards, information panels and footer.
- Preserve cloud-aware fixed silver stars and phase-correct moon visibility.

Acceptance:

- Every interactive surface remains dark and readable in normal and hover states.
- Celestial artwork never collides with the header or location copy.

## Chunk 04 — Day theme

Status: complete

- Balance bright sky imagery with deep desaturated ink and cool tinted panels.
- Verify artwork shadows, logo visibility, buttons, hover states and section transitions.

Acceptance:

- No low-contrast pale-on-pale content or pure-black typography.
- Panel hover states are visible without glare.

## Chunk 05 — Dawn theme

Status: complete

- Apply a distinct pre-sunrise/sunrise palette and warm-cool action treatment.
- Verify hero and content transition across low solar elevation.

Acceptance:

- Dawn cannot be mistaken for day, dusk or night.
- Text remains readable over the brightest horizon gradient.

## Chunk 06 — Dusk theme

Status: complete

- Apply a distinct sunset/post-sunset palette with violet-blue panels and rose-gold accents.
- Verify search, cards, timeline and library previews at normal and hover states.

Acceptance:

- Dusk cannot be mistaken for dawn or night.
- Warm accents never reduce text contrast.

## Chunk 07 — Condition-aware wind language

Status: complete

- Resolve calm, breeze, open-air flow, cloud flow, precipitation shear, laminar visibility flow, snow drift, gusting and turbulent storm motion.
- Use live speed, gust ratio, direction and weather category.
- Reflect direction with restrained orientation changes while preserving layout containment.

Acceptance:

- Calm, breeze, gust, rain, fog, snow and storm do not share one visual motion.
- Wind never resembles dancing, bouncing or a windsock in the hero.

## Chunk 08 — Detailed weather and supporting panels

Status: complete

- Refine the compact masonry bento and make every icon, value and detail readable in all themes.
- Apply tokens to freshness controls, timeline range buttons, forecast cards, local library previews, informational panels, calls to action and footer.
- Keep hover motion subtle and consistent.

Acceptance:

- No component looks borrowed from a different page or theme.
- Metric and forecast artwork retains contrast in all four themes.

## Chunk 09 — Verification

Status: complete

- Add deterministic theme-state and wind-profile checks.
- Browser-test normal, hover, focus, loading and search-results states for night, dawn, day and dusk.
- Verify desktop, tablet and mobile layouts and reduced motion.
- Run syntax, SEO, integrity, build and whitespace checks.

## Definition of done

The goal is complete only when all four astronomical versions and their weather modifiers share a coherent product hierarchy; all normal, hover, focus and active states remain readable; hero wind motion is condition-aware; unit controls live in the detailed weather section; public copy is useful; and automated plus browser verification passes.

## Completion evidence — 2026-07-18

- The final theme-scoped token layer defines independent night, dawn, day and dusk palettes plus a severe-weather modifier. Legacy day rules can no longer force light hover surfaces into dark themes.
- The hero contains only the small Live indicator and refresh action. Temperature and wind-unit controls are grouped with detailed-weather freshness data and were interactively verified to convert both displayed values and active states.
- Live browser checks resolved four distinct scenes from the shared renderer: Gainesville afternoon (`breeze`), Yangon pre-dawn (`cloud-flow`), San Juan sunset (`open-air`) and New Delhi pre-dawn haze (`laminar`). This confirms location time, celestial body, weather and wind do not share one hard-coded hero treatment.
- Night search normal, focus and suggestion states remain dark. Suggestions scroll inside a viewport-aware panel with a high stacking layer and no horizontal page overflow.
- Header navigation is larger, theme-aware and readable; day logo colors use darker ink. Hero proof points now describe the public library, and the status line explains exactly what live inputs compose the scene and the ten-minute refresh cadence.
- Detailed-weather bento, freshness controls, timeline, library previews and information panels all inherit the active theme for normal and hover surfaces. Responsive breakpoints keep search and unit controls touch-safe on narrow layouts.
- `npm run check`, `npm run build` and `git diff --check` pass. SEO checks cover 16 indexable pages; application integrity checks cover 16 routes and 12 category collections.
