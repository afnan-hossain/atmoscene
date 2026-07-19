(() => {
  'use strict';

  const BASE_PATH = new URL('../../lab/assets/meteocons-flat/', document.currentScript?.src || window.location.href).href;
  const VERSION = 'meteocons-flat-0.1.0';
  const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value)));
  const mode = (isDay) => isDay ? 'day' : 'night';
  const url = (slug) => `${BASE_PATH}${slug}.svg?v=${VERSION}`;

  const wmoSlug = ({ code = 0, isDay = true } = {}) => {
    const dayNight = mode(isDay);
    const value = Number(code);
    if (value === 0) return `clear-${dayNight}`;
    if (value === 1) return `mostly-clear-${dayNight}`;
    if (value === 2) return `partly-cloudy-${dayNight}`;
    if (value === 3) return `overcast-${dayNight}`;
    if ([45, 48].includes(value)) return `fog-${dayNight}`;
    if (value === 51) return `partly-cloudy-${dayNight}-drizzle`;
    if (value === 53) return `overcast-${dayNight}-drizzle`;
    if (value === 55) return `extreme-${dayNight}-drizzle`;
    if ([56, 57, 66, 67].includes(value)) return `overcast-${dayNight}-sleet`;
    if ([61, 80].includes(value)) return `partly-cloudy-${dayNight}-rain`;
    if ([63, 81].includes(value)) return `overcast-${dayNight}-rain`;
    if ([65, 82].includes(value)) return `extreme-${dayNight}-rain`;
    if ([71, 73, 77, 85].includes(value)) return `overcast-${dayNight}-snow`;
    if ([75, 86].includes(value)) return `extreme-${dayNight}-snow`;
    if (value === 95) return `thunderstorms-${dayNight}-rain`;
    if ([96, 99].includes(value)) return `thunderstorms-extreme-${dayNight}-rain`;
    return `cloudy`;
  };

  const compositeSlug = ({
    isDay = true,
    cover = 'partly-cloudy',
    phenomenon = 'rain',
    severity = 'moderate',
    thunder = false
  } = {}) => {
    const dayNight = mode(isDay);
    const safeCover = ['mostly-clear', 'partly-cloudy', 'overcast', 'extreme'].includes(cover) ? cover : 'partly-cloudy';
    const safePhenomenon = ['drizzle', 'fog', 'hail', 'haze', 'rain', 'sleet', 'smoke', 'snow'].includes(phenomenon) ? phenomenon : 'rain';
    if (thunder) {
      const thunderPrefix = severity === 'extreme' ? 'thunderstorms-extreme' : 'thunderstorms';
      return `${thunderPrefix}-${safeCover}-${dayNight}-${safePhenomenon}`;
    }
    return `${safeCover}-${dayNight}-${safePhenomenon}`;
  };

  const windBeaufort = (speedKmh = 0) => {
    const speed = Math.max(0, Number(speedKmh));
    const limits = [1, 6, 12, 20, 29, 39, 50, 62, 75, 89, 103, 118];
    const scale = limits.findIndex((limit) => speed < limit);
    return scale === -1 ? 12 : scale;
  };

  const windSlug = ({ speedKmh = 0, context = 'beaufort' } = {}) => {
    if (context === 'calm') return 'windsock-calm';
    if (context === 'weak') return 'windsock-weak';
    if (context === 'moderate') return 'windsock-moderate';
    if (context === 'strong') return 'windsock';
    if (context === 'alert') return 'wind-alert';
    if (context === 'onshore') return 'wind-onshore';
    if (context === 'offshore') return 'wind-offshore';
    if (context === 'dust') return 'wind-dust';
    return `wind-beaufort-${windBeaufort(speedKmh)}`;
  };

  const directionSlug = (degrees = 0) => {
    const directions = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
    const index = Math.round((((Number(degrees) % 360) + 360) % 360) / 45) % 8;
    return `wind-direction-${directions[index]}`;
  };

  const uvSlug = (uv = 0) => {
    const value = Math.round(clamp(uv, 0, 12));
    if (value <= 0) return 'uv-index';
    if (value > 11) return 'uv-index-11-plus';
    return `uv-index-${value}`;
  };

  const aqiSlug = (aqi = 0) => {
    const value = Math.max(0, Number(aqi));
    if (value <= 50) return 'code-green';
    if (value <= 100) return 'code-yellow';
    if (value <= 150) return 'code-orange';
    if (value <= 200) return 'code-red';
    if (value <= 300) return 'code-purple';
    return 'code-red';
  };

  const pressureSlug = (pressureHpa = 1013) => {
    const value = Number(pressureHpa);
    if (value < 990) return 'barometer-low';
    if (value < 1008) return 'pressure-low';
    if (value <= 1022) return 'barometer-moderate';
    if (value <= 1035) return 'pressure-high';
    return 'barometer-verry-high';
  };

  const temperatureSlug = (temperatureC = 28) => {
    const value = Number(temperatureC);
    if (value <= 12) return 'thermometer-colder';
    if (value <= 24) return 'thermometer-celsius';
    if (value <= 34) return 'thermometer-warmer';
    if (value <= 39) return 'thermometer-sun';
    return 'thermometer-alarm';
  };

  const visibilitySlug = ({ visibilityM = 10000, isDay = true, usAqi = 0, pm25 = 0, dust = false } = {}) => {
    const dayNight = mode(isDay);
    if (dust) return `dust-${dayNight}`;
    if (Number(usAqi) > 150 || Number(pm25) > 55) return `extreme-${dayNight}-smoke`;
    if (Number(usAqi) > 100 || Number(pm25) > 35) return `overcast-${dayNight}-smoke`;
    if (Number(visibilityM) < 1000) return `fog-${dayNight}`;
    if (Number(visibilityM) < 5000) return `haze-${dayNight}`;
    return null;
  };

  const pollenSlug = ({ alder = 0, birch = 0, grass = 0, mugwort = 0, ragweed = 0 } = {}) => {
    const values = {
      'pollen-tree': Math.max(Number(alder), Number(birch)),
      'pollen-grass': Number(grass),
      'pollen-flower': Math.max(Number(mugwort), Number(ragweed))
    };
    const dominant = Object.entries(values).sort((a, b) => b[1] - a[1])[0];
    return dominant?.[1] > 0 ? dominant[0] : 'pollen';
  };

  const precipitationSlug = ({ millimetres = 0, probability = 0, windKmh = 0 } = {}) => {
    if (Number(windKmh) >= 40) return 'umbrella-wind';
    if (Number(millimetres) >= 10 || Number(probability) >= 80) return 'umbrella';
    if (Number(millimetres) > 0 || Number(probability) >= 35) return 'raindrops';
    return 'umbrella-closed';
  };

  const timelineSlug = ({ period = 'forecast', isDay = true } = {}) => {
    if (period === 'past') return isDay ? 'time-late-afternoon' : 'time-late-night';
    if (period === 'current') return isDay ? 'time-afternoon' : 'time-night';
    return isDay ? 'weather-alarm-day' : 'weather-alarm-night';
  };

  const celestial = Object.freeze({
    sunrise: 'sunrise',
    sunset: 'sunset',
    moonrise: 'moonrise',
    moonset: 'moonset',
    solarEclipse: 'solar-eclipse',
    lunarEclipse: 'custom-lunar-eclipse',
    newMoon: 'moon-new',
    waxingCrescent: 'moon-waxing-crescent',
    firstQuarter: 'moon-first-quarter',
    waxingGibbous: 'moon-waxing-gibbous',
    fullMoon: 'moon-full',
    pinkMoon: 'moon-full',
    bloodMoon: 'moon-full',
    waningGibbous: 'moon-waning-gibbous',
    lastQuarter: 'moon-last-quarter',
    waningCrescent: 'moon-waning-crescent'
  });

  const timePhase = Object.freeze({
    dawn: 'sunrise',
    morning: 'time-morning',
    lateMorning: 'time-late-morning',
    afternoon: 'time-afternoon',
    lateAfternoon: 'time-late-afternoon',
    sunset: 'sunset',
    evening: 'time-evening',
    lateEvening: 'time-late-everning',
    night: 'time-night',
    lateNight: 'time-late-night',
    moonrise: 'moonrise',
    moonset: 'moonset'
  });

  const metrics = Object.freeze({
    humidity: 'humidity',
    precipitation: 'raindrop-measure',
    rain: 'raindrops',
    pressure: 'barometer',
    temperature: 'thermometer-celsius',
    uv: 'uv-index',
    aqiGood: 'code-green',
    aqiModerate: 'code-yellow',
    aqiSensitive: 'code-orange',
    aqiUnhealthy: 'code-red',
    aqiVeryUnhealthy: 'code-purple',
    alertDay: 'weather-alarm-day',
    alertNight: 'weather-alarm-night',
    pollen: 'pollen',
    pollenTree: 'pollen-tree',
    pollenGrass: 'pollen-grass',
    pollenFlower: 'pollen-flower',
    smoke: 'smoke',
    smokeParticles: 'smoke-particles',
    dust: 'dust',
    soilMoisture: 'soil-moisture',
    soilTemperature: 'soil-temperature',
    cloudIncreasing: 'cloud-up',
    cloudDecreasing: 'cloud-down',
    forecastDay: 'weather-alarm-day',
    forecastNight: 'weather-alarm-night',
    pastDay: 'time-late-afternoon',
    pastNight: 'time-late-night'
  });

  const loadInto = (image, slug, { lazy = true } = {}) => {
    if (!image || !slug) return null;
    image.loading = lazy ? 'lazy' : 'eager';
    image.decoding = 'async';
    image.src = url(slug);
    return image;
  };

  window.WeatherIconEngine = Object.freeze({
    version: VERSION,
    basePath: BASE_PATH,
    url,
    wmoSlug,
    compositeSlug,
    windBeaufort,
    windSlug,
    directionSlug,
    uvSlug,
    aqiSlug,
    pressureSlug,
    temperatureSlug,
    visibilitySlug,
    pollenSlug,
    precipitationSlug,
    timelineSlug,
    celestial,
    timePhase,
    metrics,
    loadInto
  });
})();
