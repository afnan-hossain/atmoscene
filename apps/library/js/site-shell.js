(() => {
  'use strict';

  const COUNTS = window.AtmosceneRegistry?.counts || Object.freeze({ total: 3552, day: 384, night: 3168, baseline: 986, core: 1578, snowIce: 592, wind: 296, auroraPolar: 502, tropicalMarine: 592, aerosols: 444, rareCelestial: 436 });
  const renderer = window.AtmosceneSceneRenderer;

  const savedTheme = (() => {
    try { return localStorage.getItem('atmoscene-sky-theme-v2'); } catch { return null; }
  })();
  const hour = new Date().getHours();
  const inferredTheme = hour >= 8 && hour < 17 ? 'day' : hour >= 5 && hour < 8 ? 'dawn' : hour >= 17 && hour < 20 ? 'dusk' : 'night';
  const restoredTheme = savedTheme === 'twilight' ? (hour < 12 ? 'dawn' : 'dusk') : savedTheme;
  document.documentElement.dataset.skyTheme = ['day', 'dawn', 'dusk', 'night'].includes(restoredTheme) ? restoredTheme : inferredTheme;

  document.querySelectorAll('[data-total-scenes]').forEach((node) => { node.textContent = COUNTS.total.toLocaleString('en-US'); });
  document.querySelectorAll('[data-day-scenes]').forEach((node) => { node.textContent = COUNTS.day.toLocaleString('en-US'); });
  document.querySelectorAll('[data-night-scenes]').forEach((node) => { node.textContent = COUNTS.night.toLocaleString('en-US'); });

  const brand = document.querySelector('.lab-brand');
  if (brand && !brand.querySelector('.brand-mark')) {
    brand.insertAdjacentHTML('afterbegin', `
      <svg class="brand-mark" viewBox="0 0 48 48" aria-hidden="true">
        <defs><linearGradient id="shell-brand-gradient" x1="4" y1="4" x2="44" y2="44"><stop stop-color="#49c8d5"/><stop offset=".5" stop-color="#6d75d5"/><stop offset="1" stop-color="#c45b91"/></linearGradient></defs>
        <path class="brand-cloud" d="M24 3.5c8.4 0 15.2 6.8 15.2 15.2 0 1-.1 1.9-.3 2.9a10.8 10.8 0 0 1-3.7 20.9H14A11.2 11.2 0 0 1 11 20.7v-2C11 10.3 16.8 3.5 24 3.5Z" fill="none" stroke="url(#shell-brand-gradient)" stroke-width="3"/>
        <path class="brand-wave" d="M10.6 31.1c4.1-3.4 8.5-3.2 13.2.5 4.3 3.4 8.8 3.5 13.6.4" fill="none" stroke="url(#shell-brand-gradient)" stroke-linecap="round" stroke-width="3"/>
      </svg>`);
  }

  if (!renderer) return;

  const scenePreloaderMarkup = () => `<span class="scene-preloader" role="status" aria-label="Preparing scene preview">
    <span class="atmoscene-preloader atmoscene-preloader--compact" aria-hidden="true">
      <svg viewBox="0 0 96 64" focusable="false">
        <path class="atmoscene-preloader__track" d="M7 39C19 11 37 12 48 32s28 20 41-8" />
        <path class="atmoscene-preloader__track" d="M7 24c15 25 31 26 42 7s28-19 40 8" />
        <path class="atmoscene-preloader__trace atmoscene-preloader__trace--a" pathLength="1" d="M7 39C19 11 37 12 48 32s28 20 41-8" />
        <path class="atmoscene-preloader__trace atmoscene-preloader__trace--b" pathLength="1" d="M7 24c15 25 31 26 42 7s28-19 40 8" />
        <circle class="atmoscene-preloader__node atmoscene-preloader__node--a" cx="7" cy="39" r="2.4" />
        <circle class="atmoscene-preloader__node atmoscene-preloader__node--b" cx="89" cy="39" r="2.4" />
        <rect class="atmoscene-preloader__core" x="44" y="28" width="8" height="8" rx="2" />
      </svg>
    </span>
  </span>`;

  const categoryScenes = {
    daylight: [
      ['day', 'dawn', 'clear-mild', '', 'Clear dawn'],
      ['day', 'sunrise', 'partly-cloudy', '', 'Cloudy sunrise'],
      ['day', 'morning', 'breeze', '', 'Morning breeze'],
      ['day', 'noon', 'hot', '', 'Hot noon'],
      ['day', 'afternoon', 'clear-mild', '', 'Clear afternoon'],
      ['day', 'sunset', 'rain', '', 'Sunset rain'],
      ['day', 'dusk', 'partly-cloudy', '', 'Clouds at dusk'],
      ['day', 'solar-eclipse', 'clear-mild', '', 'Solar eclipse']
    ],
    night: [
      ['night', 'evening', 'clear-night', 'waxing-crescent', 'Waxing crescent evening'],
      ['night', 'moonrise', 'partly-cloudy-night', 'first-quarter', 'Cloudy moonrise'],
      ['night', 'midnight', 'clear-night', 'new', 'New-moon sky'],
      ['night', 'midnight', 'clear-night', 'full', 'Clear full moon'],
      ['night', 'late-night', 'windy-night', 'waning-gibbous', 'Windy late night'],
      ['night', 'moonset', 'haze-night', 'waning-crescent', 'Hazy moonset'],
      ['night', 'evening', 'clear-night', 'pink-moon', 'Pink moon evening'],
      ['night', 'midnight', 'clear-night', 'blood-moon', 'Blood moon'],
      ['night', 'pre-dawn-night', 'partly-cloudy-night', 'lunar-eclipse', 'Pre-dawn lunar eclipse']
    ],
    clouds: [
      ['day', 'morning', 'partly-cloudy', '', 'Partly cloudy morning'],
      ['day', 'morning', 'clear-warm', '', 'Mostly clear morning'],
      ['day', 'afternoon', 'overcast', '', 'Overcast afternoon'],
      ['day', 'sunset', 'partly-cloudy', '', 'Cloudy sunset'],
      ['night', 'evening', 'clear-night', 'waxing-crescent', 'Clear moonlit evening'],
      ['night', 'evening', 'partly-cloudy-night', 'waxing-crescent', 'Cloudy evening'],
      ['night', 'midnight', 'overcast-night', 'full', 'Overcast midnight'],
      ['night', 'pre-dawn-night', 'partly-cloudy-night', 'waning-crescent', 'Pre-dawn clouds']
    ],
    rain: [
      ['day', 'morning', 'rain', '', 'Morning rain'],
      ['day', 'dawn', 'drizzle', '', 'Dawn drizzle'],
      ['day', 'afternoon', 'tropical-shower', '', 'Afternoon shower'],
      ['day', 'afternoon', 'heavy-rain', '', 'Heavy afternoon rain'],
      ['night', 'evening', 'drizzle-night', 'waxing-crescent', 'Evening drizzle'],
      ['night', 'midnight', 'rain-night', 'full', 'Midnight rain'],
      ['night', 'evening', 'tropical-shower-night', 'first-quarter', 'Evening shower'],
      ['night', 'pre-dawn-night', 'heavy-rain-night', 'waning-crescent', 'Heavy pre-dawn rain']
    ],
    storms: [
      ['day', 'noon', 'storm', '', 'Day thunderstorm'],
      ['day', 'dawn', 'storm', '', 'Dawn thunderstorm'],
      ['day', 'sunset', 'storm', '', 'Sunset thunderstorm'],
      ['day', 'afternoon', 'tropical-thunderstorm', '', 'Tropical thunderstorm'],
      ['night', 'evening', 'storm-night', 'waxing-crescent', 'Evening storm'],
      ['night', 'midnight', 'storm-night', 'full', 'Midnight storm'],
      ['night', 'late-night', 'tropical-cyclone-night', 'waning-gibbous', 'Night tropical cyclone'],
      ['night', 'pre-dawn-night', 'blizzard-night', 'waning-crescent', 'Pre-dawn blizzard']
    ],
    wind: [
      ['day', 'afternoon', 'windy', '', 'Steady open-air flow', { windProfile: 'open-air', wind: 2 }],
      ['day', 'morning', 'clear-mild', '', 'Calm air', { windProfile: 'calm', wind: 0 }],
      ['day', 'morning', 'breeze', '', 'Morning breeze', { windProfile: 'breeze', wind: 1 }],
      ['day', 'afternoon', 'partly-cloudy', '', 'Cloud-driven flow', { windProfile: 'cloud-flow', wind: 2 }],
      ['day', 'sunset', 'rain', '', 'Rain shear', { windProfile: 'precipitation', wind: 2 }],
      ['night', 'evening', 'fog-night', 'waxing-crescent', 'Laminar fog flow', { windProfile: 'laminar', wind: 1 }],
      ['night', 'late-night', 'blowing-snow-night', 'waning-gibbous', 'Night snow drift', { windProfile: 'drift', wind: 3 }],
      ['day', 'sunset', 'gusty', '', 'Sunset gusts', { windProfile: 'gusting', wind: 3 }],
      ['night', 'midnight', 'storm-night', 'full', 'Turbulent storm wind', { windProfile: 'turbulent', wind: 4 }]
    ],
    visibility: [
      ['day', 'dawn', 'fog', '', 'Dawn fog'],
      ['day', 'morning', 'marine-fog', '', 'Coastal mist', { windProfile: 'laminar' }],
      ['day', 'morning', 'haze', '', 'Morning haze'],
      ['day', 'afternoon', 'urban-smog', '', 'Urban smog'],
      ['day', 'sunset', 'freezing-fog', '', 'Freezing fog at sunset', { windProfile: 'laminar' }],
      ['night', 'evening', 'haze-night', 'waxing-crescent', 'Evening haze'],
      ['night', 'midnight', 'fog-night', 'full', 'Midnight fog'],
      ['night', 'moonset', 'marine-fog-night', 'waning-crescent', 'Marine mist at moonset', { windProfile: 'laminar' }],
      ['night', 'pre-dawn-night', 'urban-smog-night', 'waning-crescent', 'Pre-dawn smog']
    ],
    snow: [
      ['day', 'afternoon', 'moderate-snow', '', 'Steady afternoon snow'],
      ['day', 'dawn', 'flurries', '', 'Dawn flurries'],
      ['day', 'morning', 'light-snow', '', 'Light morning snow'],
      ['day', 'noon', 'heavy-snow', '', 'Heavy day snow'],
      ['night', 'late-night', 'blowing-snow-night', 'waning-gibbous', 'Night blowing snow'],
      ['day', 'sunset', 'blizzard', '', 'Sunset blizzard'],
      ['night', 'pre-dawn-night', 'freezing-fog-night', 'waning-crescent', 'Pre-dawn freezing fog'],
      ['night', 'midnight', 'diamond-dust-night', 'full', 'Midnight diamond dust']
    ],
    aurora: [
      ['day', 'noon', 'polar-day-clear', '', 'Polar day'],
      ['day', 'dusk', 'nacreous-clouds', '', 'Nacreous clouds'],
      ['night', 'evening', 'aurora-faint', 'waxing-crescent', 'Faint aurora'],
      ['night', 'midnight', 'aurora-strong', 'full', 'Strong aurora'],
      ['night', 'late-night', 'aurora-corona', 'waning-gibbous', 'Aurora corona'],
      ['night', 'pre-dawn-night', 'noctilucent-clouds', 'waning-crescent', 'Noctilucent clouds']
    ],
    marine: [
      ['day', 'morning', 'sea-breeze', '', 'Sea breeze'],
      ['day', 'afternoon', 'tropical-shower', '', 'Tropical shower'],
      ['day', 'sunset', 'monsoon-rain', '', 'Monsoon rain'],
      ['night', 'evening', 'tropical-thunderstorm-night', 'waxing-crescent', 'Tropical thunderstorm'],
      ['night', 'midnight', 'tropical-cyclone-night', 'full', 'Tropical cyclone'],
      ['night', 'pre-dawn-night', 'waterspout-night', 'waning-crescent', 'Waterspout']
    ],
    aerosols: [
      ['day', 'morning', 'airborne-dust', '', 'Airborne dust'],
      ['day', 'afternoon', 'sandstorm', '', 'Sandstorm'],
      ['day', 'sunset', 'wildfire-smoke', '', 'Wildfire smoke'],
      ['night', 'evening', 'smoke-night', 'waxing-crescent', 'Night smoke'],
      ['night', 'midnight', 'volcanic-ash-night', 'full', 'Volcanic ash'],
      ['night', 'pre-dawn-night', 'urban-smog-night', 'waning-crescent', 'Urban smog']
    ],
    celestial: [
      ['day', 'morning', 'solar-halo', '', 'Solar halo'],
      ['day', 'afternoon', 'sun-dogs', '', 'Sun dogs'],
      ['day', 'sunset', 'double-rainbow', '', 'Double rainbow'],
      ['night', 'evening', 'meteor-shower', 'waxing-crescent', 'Meteor shower'],
      ['night', 'midnight', 'comet', 'full', 'Comet'],
      ['night', 'late-night', 'light-pillars', 'waning-gibbous', 'Light pillars']
    ]
  };

  const sceneConfig = ([mode, phaseKey, weatherKey, moonKey = 'full', title, weatherOverrides = null]) => ({
    mode,
    title,
    phase: mode === 'night' ? renderer.nightPhase(phaseKey, moonKey || 'full') : renderer.dayPhase(phaseKey),
    weather: weatherOverrides ? { ...renderer.weather(mode, weatherKey), ...weatherOverrides } : renderer.weather(mode, weatherKey)
  });

  const renderSceneHost = (host, spec, index) => {
    const config = sceneConfig(spec);
    host.innerHTML = renderer.sceneMarkup(config, 41000 + index);
    host.dataset.renderer = renderer.version;
    host.dataset.sceneSource = 'shared-library-compositor';
    return config;
  };

  const libraryHeroByTheme = {
    day: ['day', 'afternoon', 'partly-cloudy', '', 'Afternoon cloud flow'],
    dawn: ['day', 'dawn', 'fog', '', 'Fog lifting at dawn'],
    dusk: ['day', 'sunset', 'rain', '', 'Rain at sunset'],
    twilight: ['day', 'sunset', 'rain', '', 'Rain at sunset'],
    night: ['night', 'midnight', 'partly-cloudy-night', 'waxing-gibbous', 'Cloud flow under a waxing moon']
  };

  document.querySelectorAll('[data-library-live-hero]').forEach((host, index) => {
    const config = renderSceneHost(host, libraryHeroByTheme[document.documentElement.dataset.skyTheme] || libraryHeroByTheme.day, 70 + index);
    const feature = host.closest('.library-live-feature');
    const title = feature?.querySelector('[data-library-live-title]');
    const recipe = feature?.querySelector('[data-library-live-recipe]');
    const windLabel = ['calm air', 'light flow', 'steady flow', 'gusting flow', 'turbulent flow'][Math.max(0, Math.min(4, Number(config.weather.wind) || 0))];
    if (title) title.textContent = config.title;
    if (recipe) recipe.textContent = `${config.phase.en} + ${config.weather.en} + ${windLabel}`;
  });

  const libraryCardHosts = [...document.querySelectorAll('[data-library-card-scene]')];
  libraryCardHosts.forEach((host) => {
    if (!host.hasChildNodes()) host.innerHTML = scenePreloaderMarkup();
  });
  const hydrateLibraryCard = (host, index) => {
    if (host.dataset.loaded === 'true') return;
    renderSceneHost(host, host.dataset.libraryCardScene.split('|'), index);
    host.dataset.loaded = 'true';
  };
  if ('IntersectionObserver' in window) {
    const cardObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const index = libraryCardHosts.indexOf(entry.target);
      hydrateLibraryCard(entry.target, index);
      cardObserver.unobserve(entry.target);
    }), { rootMargin: '220px 0px' });
    libraryCardHosts.forEach((host) => cardObserver.observe(host));
  } else libraryCardHosts.forEach(hydrateLibraryCard);

  document.querySelectorAll('[data-category-scene-grid]').forEach((grid) => {
    const key = grid.dataset.categorySceneGrid;
    const specs = categoryScenes[key] || categoryScenes.clouds;
    const hero = document.querySelector('.category-hero');
    if (hero) {
      hero.classList.add('has-live-scene');
      let preview = hero.querySelector('.category-hero-preview');
      if (!preview) {
        preview = document.createElement('div');
        preview.className = 'category-hero-preview';
        hero.append(preview);
      }
      if (preview.dataset.loaded !== 'true') {
        const heroConfig = renderSceneHost(preview, specs[0], 90);
        preview.dataset.loaded = 'true';
        preview.setAttribute('aria-label', `${heroConfig.title} animated Atmoscene preview`);
        preview.insertAdjacentHTML('beforeend', `<div class="category-hero-scene-meta"><span>LIVE COMPOSITOR OUTPUT</span><strong>${heroConfig.title}</strong><small>${heroConfig.phase.en} · ${heroConfig.weather.en}</small></div>`);
      }
    }
    grid.innerHTML = specs.map((spec, index) => {
      const config = sceneConfig(spec);
      return `<article class="category-scene-card">
        <div class="category-scene-host" data-category-host="${index}"></div>
        <div class="category-scene-copy"><span>${config.mode} · ${config.phase.en}</span><strong>${config.title}</strong><small>${config.weather.en}</small></div>
      </article>`;
    }).join('');
    grid.querySelectorAll('[data-category-host]').forEach((host, index) => renderSceneHost(host, specs[index], index));
  });

  window.AtmosceneSiteShell = Object.freeze({ counts: COUNTS, theme: document.documentElement.dataset.skyTheme });
})();
