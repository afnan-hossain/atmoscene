const DEFAULT_BASE_URL = 'https://afnan-hossain.github.io/atmoscene';

export class AtmosceneError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'AtmosceneError';
    this.code = code;
    this.details = details;
  }
}

const trimSlash = (value) => String(value).replace(/\/$/, '');
const asElement = (target) => typeof target === 'string' ? document.querySelector(target) : target;
const xhrFetch = typeof XMLHttpRequest === 'function'
  ? (url, { signal } = {}) => new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.setRequestHeader('Accept', 'application/json');
      request.onload = () => resolve({
        ok: request.status >= 200 && request.status < 300,
        status: request.status,
        headers: { get: (name) => request.getResponseHeader(name) },
        json: async () => JSON.parse(request.responseText)
      });
      request.onerror = () => reject(new TypeError(`Network request failed: ${url}`));
      request.onabort = () => reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }));
      signal?.addEventListener('abort', () => request.abort(), { once: true });
      request.send();
    })
  : null;
const defaultFetch = typeof globalThis.fetch === 'function' ? globalThis.fetch.bind(globalThis) : xhrFetch;

export class AtmosceneClient {
  constructor({ baseUrl = DEFAULT_BASE_URL, fetchImpl = defaultFetch } = {}) {
    if (typeof fetchImpl !== 'function') throw new AtmosceneError('INVALID_FETCH', 'A fetch implementation is required.');
    this.baseUrl = trimSlash(baseUrl);
    this.fetch = fetchImpl;
    this.cache = new Map();
    this.runtimePromise = null;
  }

  async request(path, { signal, cache = true } = {}) {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    if (cache && this.cache.has(url)) return this.cache.get(url);
    const pending = (async () => {
      let response;
      try {
        response = await this.fetch(url, { signal, headers: { Accept: 'application/json' } });
      } catch (cause) {
        if (cause?.name === 'AbortError') throw new AtmosceneError('ABORTED', `Request aborted: ${url}`, { url, cause });
        throw new AtmosceneError('NETWORK_ERROR', `Could not reach Atmoscene: ${url}`, { url, cause });
      }
      if (!response.ok) throw new AtmosceneError('HTTP_ERROR', `Atmoscene returned HTTP ${response.status}.`, { url, status: response.status });
      return response.json();
    })();
    if (cache) this.cache.set(url, pending);
    try {
      const data = await pending;
      if (cache) this.cache.set(url, data);
      return data;
    } catch (error) {
      if (cache) this.cache.delete(url);
      throw error;
    }
  }

  health(options) { return this.request('/api/v1/health.json', options); }
  manifest(options) { return this.request('/api/v1/manifest.json', options); }
  collection(id, options) { return this.request(`/api/v1/collections/${encodeURIComponent(id)}.json`, options); }
  scene(id, options) { return this.request(`/api/v1/scenes/by-id/${encodeURIComponent(id)}.json`, options); }
  sceneIndex(options) { return this.request('/api/v1/scenes/index.json', options); }

  async resolve({ mode, phase, moonPhase = null, weather }, options) {
    if (!['day', 'night'].includes(mode) || !phase || !weather || (mode === 'night' && !moonPhase)) {
      throw new AtmosceneError('INVALID_INPUT', 'Resolve requires mode, phase and weather; night scenes also require moonPhase.', { mode, phase, moonPhase, weather });
    }
    const id = [mode, phase, moonPhase || 'none', weather].join('.');
    return this.scene(id, options);
  }

  async loadRuntime() {
    if (globalThis.AtmosceneSceneRenderer) return globalThis.AtmosceneSceneRenderer;
    if (this.runtimePromise) return this.runtimePromise;
    this.runtimePromise = (async () => {
      if (typeof document === 'undefined') throw new AtmosceneError('DOM_REQUIRED', 'Mounting a scene requires a browser DOM.');
      const manifest = await this.manifest();
      const runtimeUrl = (key) => manifest.runtimePaths?.[key]
        ? `${this.baseUrl}/${manifest.runtimePaths[key]}`
        : manifest.runtime[key];
      const loadStyle = (href) => new Promise((resolve, reject) => {
        const existing = [...document.styleSheets].some((sheet) => sheet.href === href);
        if (existing) return resolve();
        const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href });
        link.onload = resolve;
        link.onerror = () => reject(new AtmosceneError('STYLE_LOAD_ERROR', `Could not load ${href}.`));
        document.head.append(link);
      });
      const loadScript = (src) => new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing?.dataset.loaded === 'true') return resolve();
        const script = existing || Object.assign(document.createElement('script'), { src, async: false });
        script.addEventListener('load', () => { script.dataset.loaded = 'true'; resolve(); }, { once: true });
        script.addEventListener('error', () => reject(new AtmosceneError('SCRIPT_LOAD_ERROR', `Could not load ${src}.`)), { once: true });
        if (!existing) document.head.append(script);
      });
      await loadStyle(runtimeUrl('stylesheet'));
      await loadScript(runtimeUrl('registry'));
      await loadScript(runtimeUrl('engine'));
      await loadScript(runtimeUrl('renderer'));
      if (!globalThis.AtmosceneSceneRenderer) throw new AtmosceneError('RUNTIME_MISSING', 'The Atmoscene renderer did not initialize.');
      return globalThis.AtmosceneSceneRenderer;
    })();
    return this.runtimePromise;
  }

  async mount(target, sceneOrId, { label, replace = true } = {}) {
    const element = asElement(target);
    if (!element) throw new AtmosceneError('TARGET_NOT_FOUND', 'The mount target does not exist.');
    const scene = typeof sceneOrId === 'string' ? await this.scene(sceneOrId) : sceneOrId;
    if (!scene?.runtime) throw new AtmosceneError('INVALID_SCENE', 'A scene response or scene ID is required.');
    const renderer = await this.loadRuntime();
    const { mode, phase, moonPhase, weather, seed = 1 } = scene.runtime;
    const config = {
      mode,
      phase: mode === 'night' ? renderer.nightPhase(phase, moonPhase) : renderer.dayPhase(phase),
      weather: renderer.weather(mode, weather)
    };
    if (replace) element.replaceChildren();
    element.insertAdjacentHTML('beforeend', renderer.sceneMarkup(config, seed));
    element.dataset.atmosceneId = scene.id;
    element.setAttribute('role', 'img');
    element.setAttribute('aria-label', label || scene.label);
    return { element, scene, renderer };
  }

  unmount(target) {
    const element = asElement(target);
    if (!element) return false;
    element.replaceChildren();
    delete element.dataset.atmosceneId;
    element.removeAttribute('role');
    element.removeAttribute('aria-label');
    return true;
  }
}

export const createAtmoscene = (options) => new AtmosceneClient(options);
export default AtmosceneClient;
