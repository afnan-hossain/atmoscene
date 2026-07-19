(() => {
  'use strict';

  const counts = Object.freeze({
    total: 3552,
    day: 384,
    night: 3168,
    baseline: 986,
    core: 1578,
    snowIce: 592,
    wind: 296,
    auroraPolar: 502,
    tropicalMarine: 592,
    aerosols: 444,
    rareCelestial: 436
  });

  const categories = Object.freeze({
    daylight: Object.freeze({ route: 'library/daylight-sun/', label: 'Daylight & sun', count: counts.day }),
    night: Object.freeze({ route: 'library/night-moon/', label: 'Night & moon', count: counts.night }),
    clouds: Object.freeze({ route: 'library/clouds/', label: 'Cloud systems' }),
    rain: Object.freeze({ route: 'library/rain/', label: 'Rain' }),
    storms: Object.freeze({ route: 'library/storms/', label: 'Storm & lightning' }),
    wind: Object.freeze({ route: 'library/wind/', label: 'Wind', count: counts.wind }),
    visibility: Object.freeze({ route: 'library/fog-haze/', label: 'Fog & haze' }),
    snowIce: Object.freeze({ route: 'library/snow-ice/', label: 'Snow & ice', count: counts.snowIce, family: 'snow-ice' }),
    auroraPolar: Object.freeze({ route: 'library/aurora-polar/', label: 'Aurora & polar sky', count: counts.auroraPolar, family: 'aurora-polar' }),
    tropicalMarine: Object.freeze({ route: 'library/tropical-marine/', label: 'Tropical & marine', count: counts.tropicalMarine, family: 'tropical-marine' }),
    aerosols: Object.freeze({ route: 'library/dust-smoke-ash/', label: 'Dust, smoke & ash', count: counts.aerosols, family: 'aerosols' }),
    rareCelestial: Object.freeze({ route: 'library/rare-celestial/', label: 'Rare celestial events', count: counts.rareCelestial, family: 'rare-celestial' })
  });

  window.AtmosceneRegistry = Object.freeze({
    version: '2026.07-global-library',
    counts,
    categories
  });
})();
