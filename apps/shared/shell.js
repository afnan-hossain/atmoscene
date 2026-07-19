(() => {
  'use strict';

  const script = document.currentScript;
  const appRoot = new URL('../', script.src);
  const href = (path) => new URL(path, appRoot).href;
  const currentPath = location.pathname.replace(/\\/g, '/');
  const route = currentPath.includes('/api/')
    ? 'api'
    : currentPath.includes('/docs/')
    ? 'docs'
    : currentPath.includes('/library/catalog')
      ? 'catalogue'
      : currentPath.includes('/library/')
        ? 'library'
        : 'home';
  const registry = window.AtmosceneRegistry;

  if (registry?.counts) {
    const countBindings = {
      totalScenes: registry.counts.total,
      dayScenes: registry.counts.day,
      nightScenes: registry.counts.night,
      windScenes: registry.counts.wind,
      snowIceScenes: registry.counts.snowIce,
      auroraPolarScenes: registry.counts.auroraPolar,
      tropicalMarineScenes: registry.counts.tropicalMarine,
      aerosolScenes: registry.counts.aerosols,
      rareCelestialScenes: registry.counts.rareCelestial
    };
    Object.entries(countBindings).forEach(([key, value]) => {
      const attribute = `data-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
      document.querySelectorAll(`[${attribute}]`).forEach((node) => { node.textContent = value.toLocaleString('en-US'); });
    });
  }

  const logo = (footer = false) => `
    <svg class="atmoscene-brand-mark" viewBox="0 0 48 48" aria-hidden="true">
      <defs><linearGradient id="as-brand-gradient-${footer ? 'footer' : 'header'}" x1="4" y1="4" x2="44" y2="44"><stop stop-color="#63d7e2"/><stop offset=".52" stop-color="#7f7ce6"/><stop offset="1" stop-color="#e475ad"/></linearGradient></defs>
      <path class="brand-cloud" d="M24 3.5c8.4 0 15.2 6.8 15.2 15.2 0 1-.1 1.9-.3 2.9a10.8 10.8 0 0 1-3.7 20.9H14A11.2 11.2 0 0 1 11 20.7v-2C11 10.3 16.8 3.5 24 3.5Z" fill="none" stroke="url(#as-brand-gradient-${footer ? 'footer' : 'header'})" stroke-width="3"/>
      <path class="brand-wave" d="M10.6 31.1c4.1-3.4 8.5-3.2 13.2.5 4.3 3.4 8.8 3.5 13.6.4" fill="none" stroke="url(#as-brand-gradient-${footer ? 'footer' : 'header'})" stroke-linecap="round" stroke-width="3"/>
    </svg>`;

  const coffeeIcon = `<svg class="atmoscene-coffee-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7.5h11.5v6.1a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V7.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M16.5 9.5h1.3a2.7 2.7 0 1 1 0 5.4h-1.9M8.2 3.5c-1 1-.9 1.8.1 2.8M12 3.2c-1 1-.9 1.9.1 2.9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;

  const brand = (footer = false) => `
    <a class="atmoscene-brand" href="${href('lab/')}" aria-label="Atmoscene home">
      ${logo(footer)}
      <span class="atmoscene-brand-copy"><strong>Atmoscene</strong><small>${footer ? 'animated weather icons & living sky scenes' : 'living weather visuals'}</small></span>
    </a>`;

  const headerMarkup = `
    ${brand(false)}
    <button class="atmoscene-menu-button" type="button" aria-expanded="false" aria-controls="atmoscene-primary-nav" aria-label="Open navigation"><span></span></button>
    <nav class="atmoscene-primary-nav" id="atmoscene-primary-nav" aria-label="Primary navigation">
      <a href="${href('library/')}"${route === 'library' ? ' aria-current="page"' : ''}>Asset collections</a>
      <a href="${href('library/catalog.html')}"${route === 'catalogue' ? ' aria-current="page"' : ''}>Scene explorer</a>
      <a href="${href('docs/')}"${route === 'docs' ? ' aria-current="page"' : ''}>Docs</a>
      <a href="${href('docs/api/')}"${route === 'api' ? ' aria-current="page"' : ''}>API</a>
      <a href="${href('lab/')}"${route === 'home' ? ' aria-current="page"' : ''}>Weather demo</a>
      <a class="atmoscene-support-link" href="https://buymeacoffee.com/afnan.hossain" target="_blank" rel="noreferrer">${coffeeIcon}<span>Support the project</span></a>
    </nav>`;

  const footerMarkup = `
    <div>${brand(true)}<p>Copyright © <span data-current-year></span> Afnan Hossain. Free and open source under the MIT License.</p><a class="atmoscene-footer-support" href="https://buymeacoffee.com/afnan.hossain" target="_blank" rel="noreferrer">${coffeeIcon}<span>Buy me a coffee</span></a></div>
    <div class="atmoscene-footer-meta"><strong>Data, artwork & attribution</strong><p>Weather and air-quality data by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a>. Approximate location by <a href="https://ipwhois.io/" target="_blank" rel="noreferrer">IPWhois</a>; precise locality names by <a href="https://www.bigdatacloud.com/" target="_blank" rel="noreferrer">BigDataCloud</a> after permission. Condition artwork includes <a href="https://meteocons.com/" target="_blank" rel="noreferrer">Meteocons by Bas Milius</a> (MIT), composed with original Atmoscene scene layers.</p></div>`;

  const supportBandMarkup = `
    <div><span>Open-source weather visuals</span><strong>Help keep Atmoscene free for designers and developers everywhere.</strong></div>
    <a href="https://buymeacoffee.com/afnan.hossain" target="_blank" rel="noreferrer">${coffeeIcon}<span>Support on Buy Me a Coffee</span></a>`;

  const existingHeader = document.querySelector('[data-atmoscene-header], .site-header, .lab-header');
  const header = existingHeader || document.createElement('header');
  header.className = 'atmoscene-site-header';
  header.dataset.atmosceneHeader = '';
  header.innerHTML = headerMarkup;
  if (!existingHeader) document.body.prepend(header);

  const existingFooter = document.querySelector('[data-atmoscene-footer], .site-footer, body > footer');
  const footer = existingFooter || document.createElement('footer');
  footer.className = 'atmoscene-site-footer';
  footer.dataset.atmosceneFooter = '';
  footer.innerHTML = footerMarkup;
  if (!existingFooter) document.body.append(footer);

  let supportBand = document.querySelector('[data-atmoscene-support-band]');
  if (!supportBand) {
    supportBand = document.createElement('aside');
    supportBand.dataset.atmosceneSupportBand = '';
    footer.before(supportBand);
  }
  supportBand.className = 'atmoscene-support-band';
  supportBand.setAttribute('aria-label', 'Support Atmoscene');
  supportBand.innerHTML = supportBandMarkup;
  document.querySelectorAll('[data-current-year]').forEach((node) => { node.textContent = String(new Date().getFullYear()); });

  const menu = header.querySelector('.atmoscene-menu-button');
  const nav = header.querySelector('.atmoscene-primary-nav');
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav.dataset.open = String(open);
  });
  nav?.addEventListener('click', (event) => {
    if (!event.target.closest('a')) return;
    menu?.setAttribute('aria-expanded', 'false');
    nav.dataset.open = 'false';
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || menu?.getAttribute('aria-expanded') !== 'true') return;
    menu.setAttribute('aria-expanded', 'false');
    nav.dataset.open = 'false';
    menu.focus();
  });

  window.AtmosceneShell = Object.freeze({ route, appRoot: appRoot.href });
})();
