import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AtmosceneClient, AtmosceneError } from '../apps/api/v1/client.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const apiRoot = join(root, 'apps', 'api', 'v1');
const json = (path) => JSON.parse(readFileSync(join(apiRoot, path), 'utf8'));
const manifest = json('manifest.json');
const index = json('scenes/index.json');

assert.equal(manifest.apiVersion, '1.0.0');
assert.equal(manifest.counts.total, 3552);
assert.equal(index.count, 3552);
assert.equal(new Set(index.scenes.map(({ id }) => id)).size, 3552);
assert.equal(json('collections/core.json').count, 986);
assert.equal(json('collections/snow-ice.json').count, 592);
assert.equal(json('collections/aurora-polar.json').count, 502);
assert.equal(json('collections/tropical-marine.json').count, 592);
assert.equal(json('collections/aerosols.json').count, 444);
assert.equal(json('collections/rare-celestial.json').count, 436);
assert.ok(json('lookups/weather-family.json').count > 40);
assert.equal(json('lookups/weather-family.json').weatherFamily['tropical-cyclone'], 'tropical-marine');
assert.equal(json('checksums.json').algorithm, 'sha256');
assert.equal(Object.keys(json('checksums.json').files).length, 3564);

const sunsetRain = json('scenes/by-id/day.sunset.none.rain.json');
assert.equal(sunsetRain.label, 'Sunset · Rain');
assert.equal(sunsetRain.runtime.weather, 'rain');
assert.equal(sunsetRain.windProfile, 'precipitation');

const cyclone = json('scenes/by-id/night.midnight.full.tropical-cyclone-night.json');
assert.equal(cyclone.family, 'tropical-marine');
assert.equal(cyclone.effect, 'cyclone');
assert.equal(cyclone.windProfile, 'turbulent');

const fileFetch = async (url) => {
  const pathname = new URL(url).pathname.replace(/^\/local\//, '');
  try {
    return new Response(readFileSync(join(root, 'apps', pathname)), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch {
    return new Response('{"error":"not found"}', { status: 404, headers: { 'content-type': 'application/json' } });
  }
};
const client = new AtmosceneClient({ baseUrl: 'https://test.invalid/local', fetchImpl: fileFetch });
assert.equal((await client.health()).sceneCount, 3552);
assert.equal((await client.scene('day.sunset.none.rain')).id, 'day.sunset.none.rain');
assert.equal((await client.resolve({ mode: 'night', phase: 'midnight', moonPhase: 'full', weather: 'clear-night' })).moonPhase, 'full');
await assert.rejects(() => client.scene('missing.scene'), (error) => error instanceof AtmosceneError && error.code === 'HTTP_ERROR' && error.details.status === 404);
await assert.rejects(() => client.resolve({ mode: 'night', phase: 'midnight', weather: 'clear-night' }), (error) => error instanceof AtmosceneError && error.code === 'INVALID_INPUT');

const rendererSource = readFileSync(join(root, 'apps', 'library', 'js', 'catalog.js'), 'utf8');
const rendererCss = readFileSync(join(root, 'apps', 'library', 'css', 'catalog.css'), 'utf8');
assert.match(rendererSource, /cyclone-eyewall/);
assert.match(rendererSource, /cyclone-rainbands/);
assert.doesNotMatch(rendererSource, /class="cyclone-bands"/);
assert.match(rendererCss, /vector-effect:non-scaling-stroke/);
assert.match(rendererCss, /@keyframes cycloneRainbands/);

console.log('Atmoscene API checks passed: 3,552 endpoints, six collections, SDK fetch/resolve, proportional rain, structured cyclone.');
