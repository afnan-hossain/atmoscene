import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (path) => readFileSync(join(root, path), 'utf8');
const fail = (message) => { throw new Error(`App integrity check failed: ${message}`); };

const routes = [
  'apps/lab/index.html',
  'apps/library/index.html',
  'apps/library/catalog.html',
  'apps/library/daylight-sun/index.html',
  'apps/library/night-moon/index.html',
  'apps/library/clouds/index.html',
  'apps/library/rain/index.html',
  'apps/library/storms/index.html',
  'apps/library/wind/index.html',
  'apps/library/fog-haze/index.html',
  'apps/library/snow-ice/index.html',
  'apps/library/aurora-polar/index.html',
  'apps/library/tropical-marine/index.html',
  'apps/library/dust-smoke-ash/index.html',
  'apps/library/rare-celestial/index.html',
  'apps/docs/index.html'
  ,'apps/docs/api/index.html'
  ,'apps/api/demo/index.html'
];

for (const route of routes) {
  const html = read(route);
  if (!html.includes('data-atmoscene-header')) fail(`${route} is missing the shared header mount`);
  if (!html.includes('data-atmoscene-footer')) fail(`${route} is missing the shared footer mount`);
  if (!html.includes('shared/shell.css')) fail(`${route} is missing shared shell styles`);
  if (!html.includes('shared/shell.js')) fail(`${route} is missing shared shell behavior`);
  if (!html.includes('shared/registry.js')) fail(`${route} is missing the canonical registry`);
  if (/class=["'](?:lab-header|site-header|site-footer)["']/.test(html)) fail(`${route} contains legacy shell markup`);
}

const categories = routes.filter((route) => /apps\/library\/(?!index|catalog)[^/]+\/index\.html$/.test(route));
for (const route of categories) {
  if (!read(route).includes('data-category-scene-grid')) fail(`${route} does not expose immediate category scenes`);
}

const labApp = read('apps/lab/app.js');
if (/GPS\s*\+\s*reverse geocoding|position\.coords\.accuracy/.test(labApp)) fail('precise-location accuracy copy is exposed');
const labHtml = read('apps/lab/index.html');
const labCss = read('apps/lab/styles.css');
if (/sky-contour-seam/.test(labHtml) || /sky-contour-seam/.test(labCss)) fail('standalone hero contour seam still exists');
if (labApp.includes('forecastGrid.scrollLeft')) fail('forecast timeline still forces horizontal centering');
if (/\.forecast-grid\s*\{[^}]*overflow-x\s*:\s*auto/s.test(labCss)) fail('forecast timeline still requires horizontal scrolling');
if (!labApp.includes('dataset.weatherInk')) fail('hero does not resolve independent weather-side contrast');
for (const ink of ['light', 'dark']) {
  if (!labCss.includes(`data-weather-ink="${ink}"`)) fail(`hero is missing ${ink} weather-side contrast tokens`);
}
for (const theme of ['night', 'dawn', 'day', 'dusk']) {
  if (!labCss.includes(`data-sky-theme="${theme}"`)) fail(`homepage is missing the ${theme} theme`);
}
for (const token of ['--surface-card', '--surface-card-hover', '--search-shell', '--search-field-hover', '--action-bg-hover', '--focus-ring']) {
  if (!labCss.includes(token)) fail(`homepage theme system is missing ${token}`);
}
if (!labHtml.includes('class="weather-detail-toolbar"')) fail('detailed weather toolbar is missing');
if (!labHtml.includes('class="weather-unit-controls"')) fail('detailed weather unit controls are missing');
const heroActions = labHtml.match(/<div class="stage-actions">([\s\S]*?)<\/div>/)?.[1] || '';
if (/unit-toggle|wind-unit-toggle/.test(heroActions)) fail('unit toggles remain in the hero');
if ((labHtml.match(/data-temperature-toggle/g) || []).length !== 2) fail('temperature toggle must exist in both hero and detailed weather card');
if ((labHtml.match(/data-wind-toggle/g) || []).length !== 1) fail('wind unit toggle must remain in the detailed weather card');
if (!labHtml.includes('weather collections') || !labHtml.includes('maximum previews per page')) fail('hero proof points are not audience-facing');
if (!labApp.includes('Atmoscene resolves local solar phase')) fail('live scene status copy is not meaningful');
for (const profile of ['calm', 'breeze', 'gusting']) {
  if (!labApp.includes(`"${profile}"`)) fail(`homepage resolver is missing ${profile} wind logic`);
}
if (!labApp.includes('wind_gusts_10m') || !labApp.includes('wind_direction_10m')) fail('homepage wind resolver is not using gust and direction data');

const renderer = read('apps/library/js/catalog.js');
const rendererCss = read('apps/library/css/catalog.css');
if (!renderer.includes('class="wx-horizon"')) fail('canonical scene renderer is missing its in-scene horizon');
for (const phase of ['dawn', 'sunrise', 'sunset', 'dusk']) {
  if (!rendererCss.includes(`data-phase="${phase}"] .wx-horizon`)) fail(`renderer is missing the ${phase} horizon palette`);
}
if (!rendererCss.includes('--horizon-line-y') || !rendererCss.includes('top: 62.5%')) fail('solar horizon geometry is not aligned for rise/set scenes');
for (const profile of ['open-air', 'cloud-flow', 'precipitation', 'turbulent', 'laminar', 'drift', 'aerosol-flow']) {
  if (!renderer.includes(`'${profile}'`)) fail(`renderer is missing ${profile} wind semantics`);
  if (!rendererCss.includes(`data-wind-profile="${profile}"`)) fail(`scene CSS is missing ${profile} motion`);
}
for (const profile of ['calm', 'breeze', 'gusting']) {
  if (!rendererCss.includes(`data-wind-profile="${profile}"`)) fail(`scene CSS is missing ${profile} homepage motion`);
}
if (!renderer.includes('data-wind-bearing') || !renderer.includes('--wind-tilt') || !renderer.includes('--wind-flip')) fail('renderer is missing directional wind metadata');

const registry = read('apps/shared/registry.js');
for (const [label, value] of Object.entries({ total: 3552, day: 384, night: 3168, snowIce: 592, auroraPolar: 502, tropicalMarine: 592, aerosols: 444, rareCelestial: 436 })) {
  if (!new RegExp(`${label}:\\s*${value}`).test(registry)) fail(`registry ${label} count is not ${value}`);
}

const sharedShell = read('apps/shared/shell.js');
const sharedShellCss = read('apps/shared/shell.css');
const librarySiteShell = read('apps/library/js/site-shell.js');
if (!sharedShell.includes('https://buymeacoffee.com/afnan.hossain')) fail('shared support destination is missing');
if (!sharedShell.includes('Copyright ©') || !sharedShell.includes('Afnan Hossain')) fail('Afnan Hossain copyright is missing');
if (!sharedShell.includes('data-current-year')) fail('automatic copyright year is missing');
if (!sharedShell.includes('atmoscene-support-band')) fail('restrained body support CTA is missing');
if (!/\.atmoscene-site-header\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?background:\s*transparent;/.test(sharedShellCss)) fail('header is not a transparent hero overlay');
for (const theme of ['dawn', 'dusk']) {
  if (!sharedShellCss.includes(`data-sky-theme="${theme}"`)) fail(`shared route shell is missing the ${theme} theme`);
}

const libraryLanding = read('apps/library/index.html');
if ((libraryLanding.match(/class="library-collection-group"/g) || []).length !== 3) fail('Library landing must contain three focused collection groups');
if ((libraryLanding.match(/class="library-category-card"/g) || []).length !== 12) fail('Library landing must expose all 12 scene collections');
if ((libraryLanding.match(/<li><span>0[1-4]<\/span>/g) || []).length !== 4) fail('Library compositor workflow is incomplete');
if ((libraryLanding.match(/<article><span>0[1-4]<\/span>/g) || []).length !== 4) fail('Library integration formats are incomplete');
if (!libraryLanding.includes('"@type": "ItemList"') || !libraryLanding.includes('"numberOfItems": 12')) fail('Library structured collection list is missing');
if (/library-roadmap/.test(libraryLanding)) fail('Library still exposes the legacy roadmap section');
if (!librarySiteShell.includes('IntersectionObserver') || !librarySiteShell.includes('data-library-card-scene')) fail('Library scene previews are not lazily hydrated');

const daylightPage = read('apps/library/daylight-sun/index.html');
if (!daylightPage.includes('class="category-hero-copy"') || !daylightPage.includes('data-category-hero-preview')) fail('Daylight page does not use the final category hero composition');
if ((daylightPage.match(/<li><span>0[1-8]<\/span>/g) || []).length !== 8) fail('Daylight phase rail must expose all eight solar phases');
if ((daylightPage.match(/class="category-resolver-flow"[\s\S]*?<article>/g) || []).length !== 1 || (daylightPage.match(/<article><span>(?:Input|Compose|Output)<\/span>/g) || []).length !== 3) fail('Daylight resolver workflow is incomplete');
if (!daylightPage.includes('"numberOfItems":8') || !daylightPage.includes('Exactly one sun')) fail('Daylight structured phase list or celestial safeguard is missing');
const daylightSceneBlock = librarySiteShell.match(/daylight:\s*\[([\s\S]*?)\n\s*\],\n\s*night:/)?.[1] || '';
if ((daylightSceneBlock.match(/\['day'/g) || []).length !== 8) fail('Daylight page must render one canonical preview for each phase');
if (!librarySiteShell.includes('category-hero-scene-meta') || !librarySiteShell.includes("preview.dataset.loaded = 'true'")) fail('Category hero live-scene metadata is incomplete');

const nightPage = read('apps/library/night-moon/index.html');
if (!nightPage.includes('class="category-hero-copy"') || !nightPage.includes('data-category-hero-preview')) fail('Night and moon page does not use the final category hero composition');
if ((nightPage.match(/<li><span>(?:0[1-9]|1[01])<\/span>/g) || []).length !== 11) fail('Night page must expose all 11 lunar states');
if (!nightPage.includes('"numberOfItems":11') || !nightPage.includes('New-moon scenes suppress visible surface texture')) fail('Night structured lunar list or new-moon behavior is missing');
if ((nightPage.match(/<article><span>(?:Input|Compose|Output)<\/span>/g) || []).length !== 3) fail('Night resolver workflow is incomplete');
const nightSceneBlock = librarySiteShell.match(/night:\s*\[([\s\S]*?)\n\s*\],\n\s*clouds:/)?.[1] || '';
if ((nightSceneBlock.match(/\['night'/g) || []).length !== 9) fail('Night page must render nine representative lunar previews');
for (const state of ["'new'", "'pink-moon'", "'blood-moon'", "'lunar-eclipse'"]) if (!nightSceneBlock.includes(state)) fail(`Night preview set is missing ${state}`);

const cloudsPage = read('apps/library/clouds/index.html');
if (!cloudsPage.includes('class="category-hero-copy"') || !cloudsPage.includes('data-category-hero-preview')) fail('Clouds page does not use the final category hero composition');
if ((cloudsPage.match(/<li><span>(?:0–10%|10–30%|30–60%|60–90%|90–100%)<\/span>/g) || []).length !== 5) fail('Clouds page must expose five coverage bands');
if (!cloudsPage.includes('"numberOfItems":5') || !cloudsPage.includes('Wind remains independent')) fail('Cloud coverage schema or independent-motion contract is missing');
if ((cloudsPage.match(/<article><span>(?:Input|Compose|Output)<\/span>/g) || []).length !== 3) fail('Cloud resolver workflow is incomplete');
const cloudSceneBlock = librarySiteShell.match(/clouds:\s*\[([\s\S]*?)\n\s*\],\n\s*rain:/)?.[1] || '';
if ((cloudSceneBlock.match(/\['(?:day|night)'/g) || []).length !== 8) fail('Clouds page must render eight representative coverage previews');
for (const state of ["'clear-warm'", "'partly-cloudy'", "'overcast'", "'partly-cloudy-night'", "'overcast-night'"]) if (!cloudSceneBlock.includes(state)) fail(`Cloud preview set is missing ${state}`);

const rainPage = read('apps/library/rain/index.html');
if (!rainPage.includes('class="category-hero-copy"') || !rainPage.includes('data-category-hero-preview')) fail('Rain page does not use the final category hero composition');
if ((rainPage.match(/<li><span>0[1-4]<\/span>/g) || []).length !== 4) fail('Rain page must expose four intensity profiles');
if (!rainPage.includes('"numberOfItems":4') || !rainPage.includes('Drops + cloud + shear')) fail('Rain intensity schema or wind-shear contract is missing');
if ((rainPage.match(/<article><span>(?:Input|Compose|Output)<\/span>/g) || []).length !== 3) fail('Rain resolver workflow is incomplete');
const rainSceneBlock = librarySiteShell.match(/rain:\s*\[([\s\S]*?)\n\s*\],\n\s*storms:/)?.[1] || '';
if ((rainSceneBlock.match(/\['(?:day|night)'/g) || []).length !== 8) fail('Rain page must render eight representative intensity previews');
for (const state of ["'drizzle'", "'rain'", "'tropical-shower'", "'heavy-rain'", "'tropical-shower-night'"]) if (!rainSceneBlock.includes(state)) fail(`Rain preview set is missing ${state}`);

const stormsPage = read('apps/library/storms/index.html');
if (!stormsPage.includes('class="category-hero-copy"') || !stormsPage.includes('data-category-hero-preview')) fail('Storms page does not use the final category hero composition');
if ((stormsPage.match(/<li><span>0[1-4]<\/span>/g) || []).length !== 4) fail('Storms page must expose four severe-weather profiles');
if (!stormsPage.includes('"numberOfItems":4') || !stormsPage.includes('Cloud + strike + flash')) fail('Storm profile schema or scene-flash contract is missing');
if ((stormsPage.match(/<article><span>(?:Input|Compose|Output)<\/span>/g) || []).length !== 3) fail('Storm resolver workflow is incomplete');
const stormSceneBlock = librarySiteShell.match(/storms:\s*\[([\s\S]*?)\n\s*\],\n\s*wind:/)?.[1] || '';
if ((stormSceneBlock.match(/\['(?:day|night)'/g) || []).length !== 8) fail('Storms page must render eight representative severe-weather previews');
for (const state of ["'storm'", "'storm-night'", "'tropical-thunderstorm'", "'tropical-cyclone-night'", "'blizzard-night'"]) if (!stormSceneBlock.includes(state)) fail(`Storm preview set is missing ${state}`);

const windPage = read('apps/library/wind/index.html');
if (!windPage.includes('class="category-hero-copy"') || !windPage.includes('data-category-hero-preview')) fail('Wind page does not use the final category hero composition');
if ((windPage.match(/<li><span>0[1-9]<\/span>/g) || []).length !== 9) fail('Wind page must expose nine motion profiles');
if (!windPage.includes('"numberOfItems":9') || !windPage.includes('Speed + gusts + bearing')) fail('Wind profile schema or directional-input contract is missing');
if ((windPage.match(/<article><span>(?:Input|Compose|Output)<\/span>/g) || []).length !== 3) fail('Wind resolver workflow is incomplete');
const windSceneBlock = librarySiteShell.match(/wind:\s*\[([\s\S]*?)\n\s*\],\n\s*visibility:/)?.[1] || '';
if ((windSceneBlock.match(/\['(?:day|night)'/g) || []).length !== 9) fail('Wind page must render all nine motion-profile previews');
for (const profile of ['calm', 'breeze', 'open-air', 'cloud-flow', 'precipitation', 'laminar', 'drift', 'gusting', 'turbulent']) if (!windSceneBlock.includes(`windProfile: '${profile}'`)) fail(`Wind preview set is missing ${profile}`);
if (!librarySiteShell.includes('weatherOverrides ? { ...renderer.weather')) fail('Category compositor cannot apply page-specific wind profiles');

const visibilityPage = read('apps/library/fog-haze/index.html');
if (!visibilityPage.includes('class="category-hero-copy"') || !visibilityPage.includes('data-category-hero-preview')) fail('Fog and haze page does not use the final category hero composition');
if ((visibilityPage.match(/<li><span>0[1-5]<\/span>/g) || []).length !== 5) fail('Visibility page must expose five atmosphere profiles');
if (!visibilityPage.includes('"numberOfItems":5') || !visibilityPage.includes('Depth + tint + attenuation')) fail('Visibility schema or attenuation contract is missing');
if ((visibilityPage.match(/<article><span>(?:Input|Compose|Output)<\/span>/g) || []).length !== 3) fail('Visibility resolver workflow is incomplete');
const visibilitySceneBlock = librarySiteShell.match(/visibility:\s*\[([\s\S]*?)\n\s*\],\n\s*snow:/)?.[1] || '';
if ((visibilitySceneBlock.match(/\['(?:day|night)'/g) || []).length !== 9) fail('Visibility page must render nine representative atmosphere previews');
for (const state of ["'fog'", "'marine-fog'", "'haze'", "'urban-smog'", "'freezing-fog'", "'marine-fog-night'"]) if (!visibilitySceneBlock.includes(state)) fail(`Visibility preview set is missing ${state}`);
if ((visibilitySceneBlock.match(/windProfile: 'laminar'/g) || []).length < 3) fail('Fog, marine mist and freezing fog are not using laminar motion');

const snowPage = read('apps/library/snow-ice/index.html');
if (!snowPage.includes('class="category-hero-copy"') || !snowPage.includes('data-category-hero-preview')) fail('Snow and ice page does not use the final category hero composition');
if ((snowPage.match(/<li><span>0[1-8]<\/span>/g) || []).length !== 8) fail('Snow and ice page must expose all eight winter conditions');
if (!snowPage.includes('"numberOfItems":8') || !snowPage.includes('Fall + drift + accumulation')) fail('Snow condition schema or accumulation contract is missing');
if ((snowPage.match(/<article><span>(?:Input|Compose|Output)<\/span>/g) || []).length !== 3) fail('Snow resolver workflow is incomplete');
const snowSceneBlock = librarySiteShell.match(/snow:\s*\[([\s\S]*?)\n\s*\],\n\s*aurora:/)?.[1] || '';
if ((snowSceneBlock.match(/\['(?:day|night)'/g) || []).length !== 8) fail('Snow page must render all eight winter-condition previews');
for (const state of ["'flurries'", "'light-snow'", "'moderate-snow'", "'heavy-snow'", "'blowing-snow-night'", "'blizzard'", "'freezing-fog-night'", "'diamond-dust-night'"]) if (!snowSceneBlock.includes(state)) fail(`Snow preview set is missing ${state}`);

const catalogue = read('apps/library/catalog.html');
if (!catalogue.includes('data-day-grid') || !catalogue.includes('data-night-grid')) fail('catalogue scene mounts are missing');
if (!catalogue.includes('catalog-output-badge') || !catalogue.includes('Animated SVG') || !catalogue.includes('Static fallback ready')) fail('catalogue output contract is missing');
if (/style-picker|disabled[^>]*>\s*(?:Fill|Line|Mono)/i.test(catalogue)) fail('catalogue still exposes non-functional style controls');
if (!catalogue.includes('"@type": "WebApplication"')) fail('catalogue WebApplication structured data is missing');
if (!renderer.includes("const PAGE_SIZE = 24")) fail('catalogue does not enforce the 24-scene page budget');
if (!renderer.includes("history[replace ? 'replaceState' : 'pushState']")) fail('catalogue no longer synchronizes filters in place');
if (!renderer.includes("const updateRobots") || !renderer.includes("noindex, follow")) fail('catalogue filtered-state crawl controls are missing');
if (!renderer.includes('catalog-empty') || !renderer.includes('data-clear-catalogue')) fail('catalogue branded empty state is missing');
if (!renderer.includes("addEventListener('popstate'") || /addEventListener\('popstate'[\s\S]{0,320}location\.reload\(/.test(renderer)) fail('catalogue browser history still reloads the page');
for (const family of ['aurora-polar', 'tropical-marine', 'aerosols', 'rare-celestial']) {
  if (!renderer.includes(`'${family}'`)) fail(`renderer is missing the ${family} family`);
}
for (const layer of ['wx-aurora-polar', 'wx-marine', 'wx-aerosols', 'wx-celestial-events']) {
  if (!renderer.includes(layer) || !rendererCss.includes(layer)) fail(`global compositor layer ${layer} is incomplete`);
}

const bannedPublicCopy = [/production roadmap/i, /production batch/i, /production preview/i, /after approval/i, /future resolver/i, /not yet a live endpoint/i, /expanding carefully/i];
for (const route of routes) {
  const html = read(route);
  for (const phrase of bannedPublicCopy) if (phrase.test(html)) fail(`${route} contains internal workflow language: ${phrase}`);
}

console.log(`App integrity checks passed for ${routes.length} routes and ${categories.length} category collections.`);
