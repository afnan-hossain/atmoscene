import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { createHash } from 'node:crypto';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const appRoot = join(root, 'apps');
const apiRoot = join(appRoot, 'api', 'v1');
const sceneRoot = join(apiRoot, 'scenes', 'by-id');
const collectionRoot = join(apiRoot, 'collections');
const schemaRoot = join(apiRoot, 'schemas');
const PUBLIC_ORIGIN = 'https://afnan-hossain.github.io/atmoscene';
const API_VERSION = '1.0.0';
const RELEASED_AT = '2026-07-19T00:00:00.000Z';

const read = (path) => readFileSync(join(root, path), 'utf8');
const writeJson = (path, value) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
};

const documentStub = {
  currentScript: { src: `${PUBLIC_ORIGIN}/library/js/engine.js` },
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {}
};
const sandbox = {
  console,
  document: documentStub,
  location: { href: `${PUBLIC_ORIGIN}/library/catalog.html`, search: '' },
  URL,
  URLSearchParams,
  Intl,
  Math,
  Object,
  Array,
  Number,
  String,
  Boolean,
  JSON,
  setTimeout: () => 0,
  clearTimeout: () => {}
};
sandbox.window = sandbox;
vm.createContext(sandbox);
for (const file of ['apps/shared/registry.js', 'apps/library/js/engine.js', 'apps/library/js/catalog.js']) {
  vm.runInContext(read(file), sandbox, { filename: file });
}

const renderer = sandbox.AtmosceneSceneRenderer;
const registry = sandbox.AtmosceneRegistry;
if (!renderer || !registry) throw new Error('Atmoscene runtime could not be loaded.');

const families = Object.freeze({
  core: {
    label: 'Core weather',
    day: renderer.dayWeather,
    night: renderer.nightWeather
  },
  'snow-ice': {
    label: 'Snow & ice',
    day: renderer.snowIceDay,
    night: renderer.snowIceNight
  },
  'aurora-polar': {
    label: 'Aurora & polar sky',
    day: renderer.auroraPolarDay,
    night: renderer.auroraPolarNight
  },
  'tropical-marine': {
    label: 'Tropical & marine',
    day: renderer.tropicalMarineDay,
    night: renderer.tropicalMarineNight
  },
  aerosols: {
    label: 'Dust, smoke & ash',
    day: renderer.aerosolDay,
    night: renderer.aerosolNight
  },
  'rare-celestial': {
    label: 'Rare celestial events',
    day: renderer.rareCelestialDay,
    night: renderer.rareCelestialNight
  }
});

const clean = (value) => JSON.parse(JSON.stringify(value));
const slug = (value) => String(value).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '');
const idFor = ({ mode, phase, moonPhase, weather }) => [mode, phase, moonPhase || 'none', weather].map(slug).join('.');
const scenes = [];

for (const [familyKey, family] of Object.entries(families)) {
  for (const phase of renderer.dayPhases) {
    for (const weather of family.day) {
      scenes.push({ mode: 'day', familyKey, familyLabel: family.label, phase, moonPhase: null, weather });
    }
  }
  for (const time of renderer.nightTimes) {
    for (const moon of renderer.moonStates) {
      for (const weather of family.night) {
        scenes.push({ mode: 'night', familyKey, familyLabel: family.label, phase: time, moonPhase: moon, weather });
      }
    }
  }
}

const records = scenes.map((scene, index) => {
  const id = idFor({
    mode: scene.mode,
    phase: scene.phase.key,
    moonPhase: scene.moonPhase?.key,
    weather: scene.weather.key
  });
  const phaseLabel = scene.moonPhase ? `${scene.phase.en} · ${scene.moonPhase.en}` : scene.phase.en;
  return {
    id,
    apiVersion: API_VERSION,
    rendererVersion: renderer.version,
    label: `${phaseLabel} · ${scene.weather.en}`,
    mode: scene.mode,
    phase: scene.phase.key,
    moonPhase: scene.moonPhase?.key || null,
    weather: scene.weather.key,
    family: scene.familyKey,
    category: scene.weather.category,
    effect: scene.weather.effect || 'standard',
    windProfile: renderer.resolveWindProfile(scene.weather),
    attributes: clean(scene.weather),
    links: {
      self: `${PUBLIC_ORIGIN}/api/v1/scenes/by-id/${id}.json`,
      collection: `${PUBLIC_ORIGIN}/api/v1/collections/${scene.familyKey}.json`,
      preview: `${PUBLIC_ORIGIN}/api/demo/?scene=${encodeURIComponent(id)}`
    },
    runtime: {
      mode: scene.mode,
      phase: scene.phase.key,
      moonPhase: scene.moonPhase?.key || null,
      weather: scene.weather.key,
      seed: index + 1
    }
  };
});

if (records.length !== registry.counts.total) {
  throw new Error(`Registry count ${registry.counts.total} does not match generated API count ${records.length}.`);
}
if (new Set(records.map(({ id }) => id)).size !== records.length) {
  throw new Error('Generated scene IDs are not unique.');
}

rmSync(sceneRoot, { recursive: true, force: true });
mkdirSync(sceneRoot, { recursive: true });
for (const record of records) writeJson(join(sceneRoot, `${record.id}.json`), record);

const summaries = records.map(({ attributes, runtime, ...record }) => record);
writeJson(join(apiRoot, 'scenes', 'index.json'), {
  apiVersion: API_VERSION,
  count: summaries.length,
  generatedAt: RELEASED_AT,
  scenes: summaries
});

const collectionLinks = {};
for (const [familyKey, family] of Object.entries(families)) {
  const collectionScenes = summaries.filter((scene) => scene.family === familyKey);
  const endpoint = `${PUBLIC_ORIGIN}/api/v1/collections/${familyKey}.json`;
  collectionLinks[familyKey] = endpoint;
  writeJson(join(collectionRoot, `${familyKey}.json`), {
    apiVersion: API_VERSION,
    id: familyKey,
    label: family.label,
    count: collectionScenes.length,
    endpoint,
    scenes: collectionScenes
  });
}

const weatherFamily = Object.fromEntries([...new Set(records.map((scene) => scene.weather))].sort().map((weatherKey) => {
  const matches = records.filter((scene) => scene.weather === weatherKey);
  return [weatherKey, matches[0].family];
}));
writeJson(join(apiRoot, 'lookups', 'weather-family.json'), {
  apiVersion: API_VERSION,
  count: Object.keys(weatherFamily).length,
  weatherFamily
});

const manifest = {
  name: 'Atmoscene Public Asset API',
  apiVersion: API_VERSION,
  rendererVersion: renderer.version,
  generatedAt: RELEASED_AT,
  license: 'MIT',
  author: 'Afnan Hossain',
  homepage: PUBLIC_ORIGIN,
  documentation: `${PUBLIC_ORIGIN}/docs/api/`,
  support: 'https://buymeacoffee.com/afnan.hossain',
  counts: clean(registry.counts),
  endpoints: {
    health: `${PUBLIC_ORIGIN}/api/v1/health.json`,
    manifest: `${PUBLIC_ORIGIN}/api/v1/manifest.json`,
    sceneIndex: `${PUBLIC_ORIGIN}/api/v1/scenes/index.json`,
    sceneById: `${PUBLIC_ORIGIN}/api/v1/scenes/by-id/{sceneId}.json`,
    collections: collectionLinks,
    weatherFamily: `${PUBLIC_ORIGIN}/api/v1/lookups/weather-family.json`,
    checksums: `${PUBLIC_ORIGIN}/api/v1/checksums.json`,
    sceneSchema: `${PUBLIC_ORIGIN}/api/v1/schemas/scene.schema.json`,
    resolveInputSchema: `${PUBLIC_ORIGIN}/api/v1/schemas/resolve-input.schema.json`
  },
  runtime: {
    module: `${PUBLIC_ORIGIN}/api/v1/client.mjs`,
    classic: `${PUBLIC_ORIGIN}/api/v1/client.js`,
    stylesheet: `${PUBLIC_ORIGIN}/library/css/catalog.css`,
    registry: `${PUBLIC_ORIGIN}/shared/registry.js`,
    engine: `${PUBLIC_ORIGIN}/library/js/engine.js`,
    renderer: `${PUBLIC_ORIGIN}/library/js/catalog.js`
  },
  runtimePaths: {
    module: 'api/v1/client.mjs',
    classic: 'api/v1/client.js',
    stylesheet: 'library/css/catalog.css',
    registry: 'shared/registry.js',
    engine: 'library/js/engine.js',
    renderer: 'library/js/catalog.js'
  }
};
writeJson(join(apiRoot, 'manifest.json'), manifest);
writeJson(join(apiRoot, 'health.json'), {
  status: 'ok',
  apiVersion: API_VERSION,
  rendererVersion: renderer.version,
  sceneCount: records.length,
  generatedAt: manifest.generatedAt
});
writeJson(join(schemaRoot, 'scene.schema.json'), {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: `${PUBLIC_ORIGIN}/api/v1/schemas/scene.schema.json`,
  title: 'Atmoscene scene',
  type: 'object',
  required: ['id', 'apiVersion', 'label', 'mode', 'phase', 'weather', 'family', 'runtime', 'links'],
  properties: {
    id: { type: 'string', pattern: '^(day|night)\\.[a-z0-9-]+\\.[a-z0-9-]+\\.[a-z0-9-]+$' },
    apiVersion: { type: 'string' },
    rendererVersion: { type: 'string' },
    label: { type: 'string' },
    mode: { enum: ['day', 'night'] },
    phase: { type: 'string' },
    moonPhase: { type: ['string', 'null'] },
    weather: { type: 'string' },
    family: { type: 'string' },
    category: { type: 'string' },
    effect: { type: 'string' },
    windProfile: { type: 'string' },
    attributes: { type: 'object' },
    links: { type: 'object' },
    runtime: { type: 'object' }
  },
  additionalProperties: true
});
writeJson(join(schemaRoot, 'resolve-input.schema.json'), {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: `${PUBLIC_ORIGIN}/api/v1/schemas/resolve-input.schema.json`,
  title: 'Atmoscene scene resolution input',
  type: 'object',
  required: ['mode', 'phase', 'weather'],
  properties: {
    mode: { enum: ['day', 'night'] },
    phase: { type: 'string', minLength: 1 },
    moonPhase: { type: ['string', 'null'] },
    weather: { type: 'string', minLength: 1 }
  },
  allOf: [{ if: { properties: { mode: { const: 'night' } } }, then: { required: ['moonPhase'] } }],
  additionalProperties: false
});

const checksumFiles = [
  'manifest.json', 'health.json', 'scenes/index.json',
  'collections/core.json', 'collections/snow-ice.json', 'collections/aurora-polar.json',
  'collections/tropical-marine.json', 'collections/aerosols.json', 'collections/rare-celestial.json',
  'lookups/weather-family.json', 'schemas/scene.schema.json', 'schemas/resolve-input.schema.json',
  ...records.map(({ id }) => `scenes/by-id/${id}.json`)
];
writeJson(join(apiRoot, 'checksums.json'), {
  algorithm: 'sha256',
  apiVersion: API_VERSION,
  files: Object.fromEntries(checksumFiles.map((relativePath) => [relativePath, createHash('sha256').update(readFileSync(join(apiRoot, relativePath))).digest('hex')]))
});

console.log(`Built Atmoscene API v${API_VERSION}: ${records.length} scenes across ${Object.keys(families).length} collections.`);
