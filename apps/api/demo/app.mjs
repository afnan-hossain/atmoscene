import { AtmosceneClient } from '../v1/client.mjs';

const baseUrl = new URL('../../', import.meta.url).href;
const client = new AtmosceneClient({ baseUrl });
const family = document.querySelector('[data-family]');
const mode = document.querySelector('[data-mode]');
const phase = document.querySelector('[data-phase]');
const moon = document.querySelector('[data-moon]');
const moonWrap = document.querySelector('[data-moon-wrap]');
const sceneSelect = document.querySelector('[data-scene]');
const mountButton = document.querySelector('[data-mount]');
const target = document.querySelector('[data-scene-mount]');
const status = document.querySelector('[data-status]');
const label = document.querySelector('[data-scene-label]');
const idNode = document.querySelector('[data-scene-id]');
const code = document.querySelector('[data-code]');
let manifest;
let collection;

const setBusy = (busy, message) => {
  mountButton.disabled = busy;
  status.textContent = message;
};

const unique = (values) => [...new Set(values)];
const updateSceneChoices = () => {
  const choices = collection.scenes.filter((scene) => scene.mode === mode.value && scene.phase === phase.value && (mode.value === 'day' || scene.moonPhase === moon.value));
  sceneSelect.innerHTML = choices.map((scene) => `<option value="${scene.id}">${scene.weather.replaceAll('-', ' ')}</option>`).join('');
  status.textContent = `${choices.length.toLocaleString()} weather states available for this sky phase.`;
};

const loadCollection = async () => {
  setBusy(true, `Fetching the ${family.options[family.selectedIndex]?.text || ''} collection…`);
  collection = await client.collection(family.value);
  const choices = collection.scenes.filter((scene) => scene.mode === mode.value);
  phase.innerHTML = unique(choices.map((scene) => scene.phase)).map((value) => `<option value="${value}">${value.replaceAll('-', ' ')}</option>`).join('');
  const moons = unique(choices.map((scene) => scene.moonPhase).filter(Boolean));
  moon.innerHTML = moons.map((value) => `<option value="${value}">${value.replaceAll('-', ' ')}</option>`).join('');
  moonWrap.hidden = mode.value === 'day';
  updateSceneChoices();
  setBusy(false, `${choices.length.toLocaleString()} ${mode.value} scenes available through this collection endpoint.`);
};

const mount = async () => {
  setBusy(true, 'Fetching scene JSON and loading the shared renderer…');
  try {
    const scene = await client.scene(sceneSelect.value);
    await client.mount(target, scene);
    label.textContent = scene.label;
    idNode.textContent = scene.id;
    code.textContent = `import { AtmosceneClient } from '${manifest.runtime.module}';\n\nconst atmoscene = new AtmosceneClient();\nconst scene = await atmoscene.scene('${scene.id}');\nawait atmoscene.mount('#sky', scene);`;
    const url = new URL(location.href);
    url.searchParams.set('scene', scene.id);
    history.replaceState(null, '', url);
    setBusy(false, `Mounted ${scene.id} from API v${scene.apiVersion}.`);
  } catch (error) {
    setBusy(false, `${error.code || 'ERROR'}: ${error.message}`);
  }
};

try {
  manifest = await client.manifest();
  family.innerHTML = Object.entries(manifest.endpoints.collections).map(([id]) => `<option value="${id}">${id.replaceAll('-', ' ')}</option>`).join('');
  const requested = new URLSearchParams(location.search).get('scene');
  if (requested) {
    const requestedScene = await client.scene(requested);
    family.value = requestedScene.family;
    mode.value = requestedScene.mode;
    await loadCollection();
    phase.value = requestedScene.phase;
    moon.value = requestedScene.moonPhase || '';
    updateSceneChoices();
    sceneSelect.value = requestedScene.id;
  } else {
    family.value = 'core';
    mode.value = 'day';
    await loadCollection();
    sceneSelect.value = 'day.sunset.none.rain';
  }
  await mount();
} catch (error) {
  setBusy(false, `${error.code || 'ERROR'}: ${error.message}`);
}

family.addEventListener('change', loadCollection);
mode.addEventListener('change', loadCollection);
phase.addEventListener('change', updateSceneChoices);
moon.addEventListener('change', updateSceneChoices);
mountButton.addEventListener('click', mount);
