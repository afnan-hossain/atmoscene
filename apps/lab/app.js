const API = {
  geocoding: "https://geocoding-api.open-meteo.com/v1/search",
  forecast: "https://api.open-meteo.com/v1/forecast",
  airQuality: "https://air-quality-api.open-meteo.com/v1/air-quality",
  ipLocation: [
    "https://ipwho.is/",
    "https://reallyfreegeoip.org/json/",
    "https://free.freeipapi.com/api/json",
  ],
  reverseGeocoding: "https://api.bigdatacloud.net/data/reverse-geocode-client",
};

const ASSET_ROOT = "./assets/meteocons-flat";
const REFRESH_INTERVAL = 10 * 60 * 1000;
const DEFAULT_LOCATION = {
  name: "New York",
  country: "United States",
  countryCode: "US",
  admin1: "New York",
  latitude: 40.7128,
  longitude: -74.006,
  timezone: "America/New_York",
};

const state = {
  location: null,
  forecast: null,
  air: null,
  unit: "c",
  windUnit: "kmh",
  distanceUnit: "km",
  precipitationUnit: "mm",
  pressureUnit: "hpa",
  unitOverrides: readUnitOverrides(),
  isLoading: false,
  updatedAt: null,
  nextRefreshAt: null,
  timelineRange: 7,
  searchResults: [],
  activeSearchIndex: -1,
  searchAbort: null,
  weatherAbort: null,
  refreshTimer: null,
  clockTimer: null,
};

const elements = {
  hero: document.querySelector("#weather-engine"),
  form: document.querySelector("#location-form"),
  input: document.querySelector("#location-input"),
  results: document.querySelector("#search-results"),
  resultTemplate: document.querySelector("#search-result-template"),
  stage: document.querySelector("#weather-stage"),
  loading: document.querySelector("#loading-overlay"),
  refresh: document.querySelector("#refresh-button"),
  unitButtons: [...document.querySelectorAll("[data-temperature-toggle]")],
  windUnitButtons: [...document.querySelectorAll("[data-wind-toggle]")],
  preciseLocation: document.querySelector("#precise-location"),
  locationSource: document.querySelector("#location-source"),
  locationName: document.querySelector("#location-name"),
  locationContext: document.querySelector("#location-context"),
  localTime: document.querySelector("#local-time"),
  temperature: document.querySelector("#current-temperature"),
  condition: document.querySelector("#condition-label"),
  feels: document.querySelector("#feels-like"),
  conditionArt: document.querySelector("#condition-art"),
  weatherArt: document.querySelector("#weather-art"),
  moonArt: document.querySelector("#moon-art"),
  moonHalo: document.querySelector("#moon-halo"),
  lastUpdated: document.querySelector("#last-updated"),
  nextRefresh: document.querySelector("#next-refresh"),
  engineNote: document.querySelector("#engine-note"),
  stars: document.querySelector("#stars"),
  windLayer: document.querySelector("#wind-layer"),
  precipitationLayer: document.querySelector("#precipitation-layer"),
  generatedScene: document.querySelector("#generated-scene-host"),
  wind: document.querySelector("#metric-wind"),
  windDetail: document.querySelector("#metric-wind-detail"),
  windCompass: document.querySelector("#wind-compass"),
  humidity: document.querySelector("#metric-humidity"),
  humidityDetail: document.querySelector("#metric-humidity-detail"),
  aqi: document.querySelector("#metric-aqi"),
  aqiDetail: document.querySelector("#metric-aqi-detail"),
  uv: document.querySelector("#metric-uv"),
  uvDetail: document.querySelector("#metric-uv-detail"),
  pressure: document.querySelector("#metric-pressure"),
  visibility: document.querySelector("#metric-visibility"),
  visibilityDetail: document.querySelector("#metric-visibility-detail"),
  precipitation: document.querySelector("#metric-precipitation"),
  precipitationDetail: document.querySelector("#metric-precipitation-detail"),
  pm25: document.querySelector("#metric-pm25"),
  particlesDetail: document.querySelector("#metric-particles-detail"),
  dewpoint: document.querySelector("#metric-dewpoint"),
  dewpointDetail: document.querySelector("#metric-dewpoint-detail"),
  clouds: document.querySelector("#metric-clouds"),
  cloudsDetail: document.querySelector("#metric-clouds-detail"),
  solar: document.querySelector("#metric-solar"),
  solarDetail: document.querySelector("#metric-solar-detail"),
  cape: document.querySelector("#metric-cape"),
  capeDetail: document.querySelector("#metric-cape-detail"),
  pollen: document.querySelector("#metric-pollen"),
  pollenDetail: document.querySelector("#metric-pollen-detail"),
  ozone: document.querySelector("#metric-ozone"),
  ozoneDetail: document.querySelector("#metric-ozone-detail"),
  forecastGrid: document.querySelector("#forecast-grid"),
  forecastTemplate: document.querySelector("#forecast-template"),
  sunCycle: document.querySelector("#sun-cycle"),
  timelineControls: document.querySelector("#timeline-controls"),
};

const weatherCodes = [
  { codes: [0], label: "Clear sky", kind: "clear" },
  { codes: [1], label: "Mainly clear", kind: "clear" },
  { codes: [2], label: "Partly cloudy", kind: "cloud" },
  { codes: [3], label: "Overcast", kind: "cloud" },
  { codes: [45, 48], label: "Fog", kind: "fog" },
  { codes: [51], label: "Light drizzle", kind: "drizzle" },
  { codes: [53], label: "Drizzle", kind: "drizzle" },
  { codes: [55], label: "Dense drizzle", kind: "drizzle" },
  { codes: [56, 57], label: "Freezing drizzle", kind: "sleet" },
  { codes: [61], label: "Light rain", kind: "rain" },
  { codes: [63], label: "Rain", kind: "rain" },
  { codes: [65], label: "Heavy rain", kind: "rain-heavy" },
  { codes: [66, 67], label: "Freezing rain", kind: "sleet" },
  { codes: [71], label: "Light snow", kind: "snow" },
  { codes: [73], label: "Snow", kind: "snow" },
  { codes: [75], label: "Heavy snow", kind: "snow-heavy" },
  { codes: [77], label: "Snow grains", kind: "snow" },
  { codes: [80], label: "Light rain showers", kind: "rain" },
  { codes: [81], label: "Rain showers", kind: "rain" },
  { codes: [82], label: "Violent rain showers", kind: "rain-heavy" },
  { codes: [85], label: "Light snow showers", kind: "snow" },
  { codes: [86], label: "Heavy snow showers", kind: "snow-heavy" },
  { codes: [95], label: "Thunderstorm", kind: "storm" },
  { codes: [96, 99], label: "Thunderstorm with hail", kind: "storm" },
];

function weatherMeta(code) {
  return weatherCodes.find((entry) => entry.codes.includes(Number(code))) ?? {
    label: "Variable conditions",
    kind: "cloud",
  };
}

function asset(name) {
  return `${ASSET_ROOT}/${name}.svg`;
}

function temperature(value) {
  if (!Number.isFinite(Number(value))) return "--°";
  const converted = state.unit === "f" ? (Number(value) * 9) / 5 + 32 : Number(value);
  return `${Math.round(converted)}°`;
}

function windSpeed(value) {
  if (!Number.isFinite(Number(value))) return `-- ${state.windUnit === "mph" ? "mph" : "km/h"}`;
  const converted = state.windUnit === "mph" ? Number(value) * 0.621371 : Number(value);
  return `${Math.round(converted)} ${state.windUnit === "mph" ? "mph" : "km/h"}`;
}

function distance(valueInMetres) {
  if (!Number.isFinite(Number(valueInMetres))) return `-- ${state.distanceUnit === "mi" ? "mi" : "km"}`;
  const kilometres = Number(valueInMetres) / 1000;
  const converted = state.distanceUnit === "mi" ? kilometres * 0.621371 : kilometres;
  return `${converted.toFixed(1)} ${state.distanceUnit === "mi" ? "mi" : "km"}`;
}

function precipitation(valueInMillimetres) {
  if (!Number.isFinite(Number(valueInMillimetres))) return `-- ${state.precipitationUnit === "in" ? "in" : "mm"}`;
  const converted = state.precipitationUnit === "in" ? Number(valueInMillimetres) / 25.4 : Number(valueInMillimetres);
  return `${converted.toFixed(state.precipitationUnit === "in" ? 2 : 1)} ${state.precipitationUnit}`;
}

function snowfall(valueInCentimetres) {
  if (!Number.isFinite(Number(valueInCentimetres))) return `-- ${state.precipitationUnit === "in" ? "in" : "cm"}`;
  const converted = state.precipitationUnit === "in" ? Number(valueInCentimetres) / 2.54 : Number(valueInCentimetres);
  return `${converted.toFixed(1)} ${state.precipitationUnit === "in" ? "in" : "cm"}`;
}

function pressure(valueInHpa) {
  if (!Number.isFinite(Number(valueInHpa))) return `-- ${state.pressureUnit === "inhg" ? "inHg" : "hPa"}`;
  const converted = state.pressureUnit === "inhg" ? Number(valueInHpa) * 0.02953 : Number(valueInHpa);
  return `${converted.toFixed(state.pressureUnit === "inhg" ? 2 : 0)} ${state.pressureUnit === "inhg" ? "inHg" : "hPa"}`;
}

function readUnitOverrides() {
  try {
    const value = JSON.parse(localStorage.getItem("atmoscene-unit-preferences-v4"));
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

function saveUnitOverrides() {
  localStorage.setItem("atmoscene-unit-preferences-v4", JSON.stringify(state.unitOverrides));
}

function unitPreferenceKey(location = state.location) {
  return String(location?.countryCode || "default").toUpperCase();
}

function locationUnitDefaults(countryCode = "") {
  const code = String(countryCode).toUpperCase();
  const usCustomaryCountries = new Set(["US", "AS", "GU", "MP", "PR", "UM", "VI"]);
  const fahrenheitCountries = usCustomaryCountries;
  const milesCountries = new Set([...usCustomaryCountries, "GB"]);
  const usesFahrenheit = fahrenheitCountries.has(code);
  const usesMiles = milesCountries.has(code);
  return {
    temperature: usesFahrenheit ? "f" : "c",
    wind: usesMiles ? "mph" : "kmh",
    distance: usesMiles ? "mi" : "km",
    precipitation: usCustomaryCountries.has(code) ? "in" : "mm",
    pressure: usCustomaryCountries.has(code) ? "inhg" : "hpa",
  };
}

function applyLocationUnits(location) {
  const defaults = locationUnitDefaults(location.countryCode);
  const overrides = state.unitOverrides[unitPreferenceKey(location)] || {};
  state.unit = overrides.temperature || defaults.temperature;
  state.windUnit = overrides.wind || defaults.wind;
  state.distanceUnit = defaults.distance;
  state.precipitationUnit = defaults.precipitation;
  state.pressureUnit = defaults.pressure;
  renderUnitControls();
}

function localeForCountry(countryCode = state.location?.countryCode) {
  const code = String(countryCode || "US").toUpperCase();
  const preferred = {
    US: "en-US", GB: "en-GB", AU: "en-AU", CA: "en-CA", BD: "en-GB-u-hc-h12",
    IN: "en-IN", NZ: "en-NZ", IE: "en-IE", ZA: "en-ZA", SG: "en-SG",
  }[code] || `en-${code}`;
  return Intl.DateTimeFormat.supportedLocalesOf([preferred])[0] || "en-GB";
}

function renderUnitControls() {
  elements.unitButtons.forEach((button) => {
    const labels = button.querySelectorAll("span");
    labels[0]?.classList.toggle("active", state.unit === "c");
    labels[1]?.classList.toggle("active", state.unit === "f");
    button.setAttribute("aria-label", `Temperature unit: ${state.unit === "c" ? "Celsius" : "Fahrenheit"}. Activate to switch.`);
  });
  elements.windUnitButtons.forEach((button) => {
    const labels = button.querySelectorAll("span");
    labels[0]?.classList.toggle("active", state.windUnit === "kmh");
    labels[1]?.classList.toggle("active", state.windUnit === "mph");
    button.setAttribute("aria-label", `Wind speed unit: ${state.windUnit === "kmh" ? "kilometres per hour" : "miles per hour"}. Activate to switch.`);
  });
}

function numberOrDash(value, digits = 0) {
  return Number.isFinite(Number(value)) ? Number(value).toFixed(digits) : "--";
}

function debounce(callback, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), delay);
  };
}

function getTimeParts(timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    hour: Number(values.hour) % 24,
    minute: Number(values.minute),
  };
}

function formatLocalTime(timeZone) {
  return new Intl.DateTimeFormat(localeForCountry(), {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());
}

function formatTimeZoneName(timeZone) {
  const options = { timeZone, timeZoneName: "longGeneric" };
  try {
    const part = new Intl.DateTimeFormat(localeForCountry(), options).formatToParts(new Date()).find((item) => item.type === "timeZoneName");
    return part?.value || timeZone;
  } catch {
    const part = new Intl.DateTimeFormat(localeForCountry(), { timeZone, timeZoneName: "long" }).formatToParts(new Date()).find((item) => item.type === "timeZoneName");
    return part?.value || timeZone;
  }
}

function minutesFromIso(value) {
  if (!value || !value.includes("T")) return null;
  const [hour, minute] = value.split("T")[1].split(":").map(Number);
  return hour * 60 + minute;
}

function formatIsoClock(value) {
  if (!value || !value.includes("T")) return "--";
  const [hour, minute] = value.split("T")[1].split(":").map(Number);
  return new Intl.DateTimeFormat(localeForCountry(), {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2000, 0, 1, hour, minute)));
}

function determineDayPhase(timeZone, sunrise, sunset) {
  const { hour, minute } = getTimeParts(timeZone);
  const now = hour * 60 + minute;
  const rise = minutesFromIso(sunrise) ?? 360;
  const set = minutesFromIso(sunset) ?? 1080;

  if (now < rise - 50 || now > set + 50) return "night";
  if (now < rise) return "dawn";
  if (now < rise + 70) return "sunrise";
  if (now < 660) return "morning";
  if (now < 840) return "noon";
  if (now < set - 75) return "afternoon";
  if (now < set) return "sunset";
  return "dusk";
}

function moonPhase(date = new Date()) {
  const synodicMonth = 29.53058867;
  const referenceNewMoon = Date.parse("2000-01-06T18:14:00Z");
  const days = (date.getTime() - referenceNewMoon) / 86400000;
  const fraction = ((days % synodicMonth) + synodicMonth) % synodicMonth / synodicMonth;
  const illumination = (1 - Math.cos(Math.PI * 2 * fraction)) / 2;

  if (fraction < .0625 || fraction >= .9375) return { name: "New moon", slug: "moon-new", illumination };
  if (fraction < .1875) return { name: "Waxing crescent", slug: "moon-waxing-crescent", illumination };
  if (fraction < .3125) return { name: "First quarter", slug: "moon-first-quarter", illumination };
  if (fraction < .4375) return { name: "Waxing gibbous", slug: "moon-waxing-gibbous", illumination };
  if (fraction < .5625) return { name: "Full moon", slug: "moon-full", illumination };
  if (fraction < .6875) return { name: "Waning gibbous", slug: "moon-waning-gibbous", illumination };
  if (fraction < .8125) return { name: "Last quarter", slug: "moon-last-quarter", illumination };
  return { name: "Waning crescent", slug: "moon-waning-crescent", illumination };
}

function resolveArtwork(code, isDay, phase, forForecast = false) {
  const numeric = Number(code);
  const night = !isDay && !forForecast;
  const moon = moonPhase();
  let condition = null;
  let showMoon = night;

  if (numeric === 0) {
    if (night) condition = null;
    else if (phase === "sunrise") condition = "sunrise";
    else if (phase === "sunset") condition = "sunset";
    else condition = "clear-day";
  } else if (numeric === 1) {
    condition = night ? "cloudy" : "mostly-clear-day";
  } else if (numeric === 2) {
    condition = night ? "cloudy" : "partly-cloudy-day";
  } else if (numeric === 3) {
    condition = night ? "overcast" : "overcast-day";
    showMoon = night && !forForecast;
  } else if ([45, 48].includes(numeric)) {
    condition = night ? "fog" : "fog-day";
  } else if ([51, 53, 55].includes(numeric)) {
    condition = "drizzle";
  } else if ([56, 57, 66, 67].includes(numeric)) {
    condition = "sleet";
  } else if ([61, 63, 80, 81].includes(numeric)) {
    condition = "rain";
  } else if ([65, 82].includes(numeric)) {
    condition = "extreme-rain";
    showMoon = false;
  } else if ([71, 73, 77, 85].includes(numeric)) {
    condition = "snow";
  } else if ([75, 86].includes(numeric)) {
    condition = "extreme-snow";
  } else if ([95, 96, 99].includes(numeric)) {
    condition = numeric === 95 ? "thunderstorms" : "extreme-thunderstorms";
    showMoon = false;
  } else {
    condition = night ? "cloudy" : "partly-cloudy-day";
  }

  if (forForecast && !condition) condition = "clear-day";
  return { condition, showMoon, moon };
}

function sceneKind(kind) {
  if (kind === "rain-heavy") return "rain";
  if (kind === "snow-heavy") return "snow";
  if (kind === "sleet") return "snow";
  if (kind === "cloud") return "cloud";
  return kind;
}

function generatedWindLevel(speedKmh) {
  const value = Number(speedKmh) || 0;
  if (value < 5) return 0;
  if (value < 18) return 1;
  if (value < 34) return 2;
  if (value < 52) return 3;
  return 4;
}

function generatedCloudLevel(cloudCover) {
  const value = Number(cloudCover) || 0;
  if (value < 18) return 0;
  if (value < 55) return 1;
  if (value < 84) return 2;
  return 3;
}

function generatedWindPresentation(current, weather = {}) {
  const speed = Math.max(0, Number(current.wind_speed_10m) || 0);
  const gust = Math.max(speed, Number(current.wind_gusts_10m) || speed);
  const speedLevel = generatedWindLevel(speed);
  const gustLevel = Math.max(0, generatedWindLevel(gust) - 1);
  const level = Math.max(speedLevel, gustLevel);
  const numericCode = Number(current.weather_code);
  const gustRatio = speed > 1 ? gust / speed : gust > 10 ? 2 : 1;
  const cloudLevel = generatedCloudLevel(current.cloud_cover);

  let profile = "open-air";
  if (weather.storm || weather.category === "storm" || [95, 96, 99].includes(numericCode)) profile = "turbulent";
  else if (weather.category === "snow" || weather.category === "ice" || [71, 73, 75, 77, 85, 86].includes(numericCode)) profile = "drift";
  else if (weather.category === "rain" || weather.category === "sleet" || weather.rain || [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(numericCode)) profile = "precipitation";
  else if (weather.category === "visibility" || [45, 48].includes(numericCode)) profile = "laminar";
  else if (weather.category === "cloud" || cloudLevel >= 2) profile = "cloud-flow";
  else if (level === 0) profile = "calm";
  else if (level === 1 && gustRatio < 1.65) profile = "breeze";
  else if (level >= 3 || gustRatio >= 1.65) profile = "gusting";

  const fromBearing = ((Number(current.wind_direction_10m) || 0) % 360 + 360) % 360;
  const flowBearing = (fromBearing + 180) % 360;
  const cssAngle = (flowBearing - 90) * Math.PI / 180;

  return {
    wind: level,
    windProfile: profile,
    windBearing: Math.round(fromBearing),
    windTilt: Math.round(Math.sin(cssAngle) * 7),
    windFlip: Math.cos(cssAngle) < 0 ? -1 : 1,
  };
}

function generatedWeatherKey(code, isDay, temperatureC, air = {}, windSpeedKmh = 0) {
  const numeric = Number(code);
  const suffix = isDay ? "" : "-night";
  if ([45, 48].includes(numeric)) return `fog${suffix}`;
  if (Number(air.us_aqi) > 100 || Number(air.pm2_5) > 35) return `haze${suffix}`;
  if (numeric === 0) {
    if (!isDay) return "clear-night";
    if (Number(temperatureC) >= 40) return "extreme-heat";
    if (Number(temperatureC) >= 34) return "hot";
    return "clear-mild";
  }
  if (numeric === 1) return isDay ? "clear-warm" : "clear-night";
  if (numeric === 2) return `partly-cloudy${suffix}`;
  if (numeric === 3) return `overcast${suffix}`;
  if ([51, 53, 55, 56, 57].includes(numeric)) return `drizzle${suffix}`;
  if ([61, 63, 66, 67, 80, 81].includes(numeric)) return `rain${suffix}`;
  if ([65, 82].includes(numeric)) return `heavy-rain${suffix}`;
  if ([71, 73, 75, 77, 85, 86].includes(numeric)) {
    const windLevel = generatedWindLevel(windSpeedKmh);
    if (windLevel >= 4) return `blizzard${suffix}`;
    if (windLevel >= 3) return `blowing-snow${suffix}`;
    if ([75, 86].includes(numeric)) return `heavy-snow${suffix}`;
    if (numeric === 73) return `moderate-snow${suffix}`;
    return `light-snow${suffix}`;
  }
  if ([95, 96, 99].includes(numeric)) return `storm${suffix}`;
  return null;
}

function generatedNightPeriod(timeZone) {
  const { hour } = getTimeParts(timeZone);
  if (hour >= 18 && hour < 22) return "evening";
  if (hour >= 22 || hour < 2) return "midnight";
  if (hour < 4) return "late-night";
  return "pre-dawn-night";
}

function generatedWeatherConfig(renderer, current, isDay, air) {
  const key = generatedWeatherKey(current.weather_code, isDay, current.temperature_2m, air, current.wind_speed_10m);
  const mode = isDay ? "day" : "night";
  if (key) {
    const resolved = renderer.weather(mode, key);
    // Fog and haze are rendered by Atmoscene's own depth layers. A separate
    // Meteocons cloud mark made otherwise clear skies look overcast and could
    // cover the sun or moon in the hero.
    const base = resolved.category === "visibility" ? { ...resolved, condition: "" } : resolved;
    const wind = generatedWindPresentation(current, base);
    return {
      ...base,
      cloud: Math.max(base.cloud || 0, generatedCloudLevel(current.cloud_cover)),
      ...wind,
      wind: Math.max(base.wind || 0, wind.wind),
    };
  }

  const Engine = window.WeatherIconEngine;
  const numeric = Number(current.weather_code);
  const isSnow = [71, 73, 75, 77, 85, 86].includes(numeric);
  const isSleet = [56, 57, 66, 67].includes(numeric);
  const isHail = [96, 99].includes(numeric);
  const fallback = {
    key: isSnow ? `snow-${mode}` : isSleet ? `sleet-${mode}` : isHail ? `hail-${mode}` : `variable-${mode}`,
    bn: "",
    en: weatherMeta(numeric).label,
    category: isSnow ? "snow" : isSleet ? "sleet" : isHail ? "storm" : "cloud",
    condition: isSnow ? "snow" : isSleet ? "sleet" : isHail ? "hail" : (Engine?.wmoSlug({ code: numeric, isDay }) || "cloudy"),
    cloud: Math.max(isSnow || isSleet ? 2 : 1, generatedCloudLevel(current.cloud_cover)),
    rain: isSleet ? 1 : 0,
    storm: isHail,
  };
  return { ...fallback, ...generatedWindPresentation(current, fallback) };
}

function generatedSceneRoot() {
  if (!elements.generatedScene || !window.AtmosceneSceneRenderer) return null;
  if (!elements.generatedScene.shadowRoot) {
    const shadow = elements.generatedScene.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <link rel="stylesheet" href="../library/css/catalog.css?v=shared-scene-06">
      <style>
        :host { position: absolute; inset: 0; display: block; }
        .shared-scene { position: absolute; inset: 0; overflow: hidden; }
        .shared-scene > .wx-scene { position: absolute; inset: 0; width: 100%; height: 100%; min-height: 100%; aspect-ratio: auto; border-radius: 0; }
        .shared-scene .wx-condition { width: clamp(180px, 22%, 310px); left: 82%; top: 43%; }
        .shared-scene .wx-scene[data-weather*="overcast"] .wx-condition,
        .shared-scene .wx-scene[data-weather*="heavy-rain"] .wx-condition,
          .shared-scene .wx-scene[data-weather*="storm"] .wx-condition { width: clamp(220px, 27%, 370px); left: 82%; top: 44%; }
        .shared-scene .wx-scene[data-cloud="1"] .wx-condition { width: clamp(180px, 21%, 290px); left: 82%; top: 45%; }
        .shared-scene .wx-sun { --sun-size: clamp(70px, 7.4%, 102px); }
        /* Celestial objects stay below the header and inside the live-preview safe area. */
        .shared-scene .wx-scene[data-phase="dawn"] .wx-sun { left: 68%; top: 71%; }
        .shared-scene .wx-scene[data-phase="sunrise"] .wx-sun { left: 72%; top: 62.5%; }
        .shared-scene .wx-scene[data-phase="morning"] .wx-sun { left: 77%; top: 32%; }
        .shared-scene .wx-scene[data-phase="noon"] .wx-sun { left: 81%; top: 24%; }
        .shared-scene .wx-scene[data-phase="afternoon"] .wx-sun { left: 85%; top: 33%; }
        .shared-scene .wx-scene[data-phase="sunset"] .wx-sun { left: 84%; top: 62.5%; }
        .shared-scene .wx-scene[data-phase="dusk"] .wx-sun { left: 88%; top: 71%; }
        .shared-scene .wx-moon { width: clamp(72px, 7%, 106px); right: 6%; top: 25%; }
        .shared-scene .mode-night[data-cloud="2"] .wx-moon { opacity: .58; }
        .shared-scene .mode-night[data-cloud="3"] .wx-moon { opacity: .34; }
        .shared-scene .wx-solar-eclipse { width: clamp(84px, 9%, 122px); left: 82%; top: 25%; }
        @media (max-width: 1180px) {
          .shared-scene .wx-condition,
          .shared-scene .wx-scene[data-weather*="overcast"] .wx-condition,
          .shared-scene .wx-scene[data-weather*="heavy-rain"] .wx-condition,
          .shared-scene .wx-scene[data-weather*="storm"] .wx-condition,
          .shared-scene .wx-scene[data-cloud="1"] .wx-condition { left: 72%; top: 69%; }
          .shared-scene .wx-scene[data-phase="morning"] .wx-sun,
          .shared-scene .wx-scene[data-phase="noon"] .wx-sun,
          .shared-scene .wx-scene[data-phase="afternoon"] .wx-sun { left: 74% !important; top: 42% !important; }
          .shared-scene .wx-scene[data-phase="dawn"] .wx-sun { left: 70% !important; top: 71% !important; }
          .shared-scene .wx-scene[data-phase="sunrise"] .wx-sun { left: 74% !important; top: 62.5% !important; }
          .shared-scene .wx-scene[data-phase="sunset"] .wx-sun { left: 80% !important; top: 62.5% !important; }
          .shared-scene .wx-scene[data-phase="dusk"] .wx-sun { left: 84% !important; top: 71% !important; }
          .shared-scene .wx-moon { right: 10% !important; left: auto !important; top: 57% !important; }
          .shared-scene .wx-solar-eclipse { left: 72% !important; top: 56% !important; }
        }
        @media (max-width: 780px) {
          .shared-scene .wx-condition,
          .shared-scene .wx-scene[data-weather*="overcast"] .wx-condition,
          .shared-scene .wx-scene[data-weather*="heavy-rain"] .wx-condition,
          .shared-scene .wx-scene[data-weather*="storm"] .wx-condition,
          .shared-scene .wx-scene[data-cloud="1"] .wx-condition { width: min(54%, 330px); left: 67%; top: 67%; }
          .shared-scene .wx-sun { --sun-size: min(18vw, 88px); }
          .shared-scene .wx-scene[data-phase="morning"] .wx-sun,
          .shared-scene .wx-scene[data-phase="noon"] .wx-sun,
          .shared-scene .wx-scene[data-phase="afternoon"] .wx-sun { left: 72% !important; top: 45% !important; }
          .shared-scene .wx-scene[data-phase="dawn"] .wx-sun { left: 65% !important; top: 71% !important; }
          .shared-scene .wx-scene[data-phase="sunrise"] .wx-sun { left: 70% !important; top: 62.5% !important; }
          .shared-scene .wx-scene[data-phase="sunset"] .wx-sun { left: 76% !important; top: 62.5% !important; }
          .shared-scene .wx-scene[data-phase="dusk"] .wx-sun { left: 82% !important; top: 71% !important; }
          .shared-scene .wx-moon { right: 8% !important; left: auto !important; top: 56% !important; }
          .shared-scene .wx-solar-eclipse { left: 67% !important; top: 55% !important; }
        }
      </style>
      <div class="shared-scene" id="shared-scene"></div>`;
  }
  return elements.generatedScene.shadowRoot.querySelector("#shared-scene");
}

function renderGeneratedScene(current, phase, isDay, artwork) {
  const renderer = window.AtmosceneSceneRenderer;
  const root = generatedSceneRoot();
  if (!renderer || !root) return false;
  const moonKey = artwork.moon.slug.replace(/^moon-/, "");
  const phaseConfig = isDay
    ? renderer.dayPhase(phase)
    : renderer.nightPhase(generatedNightPeriod(state.location.timezone), moonKey);
  const weather = generatedWeatherConfig(renderer, current, isDay, state.air?.current || {});
  root.innerHTML = renderer.sceneMarkup({ mode: isDay ? "day" : "night", phase: phaseConfig, weather }, Date.now() % 100000);
  elements.stage.dataset.sceneEngine = "atmoscene-shared";
  elements.hero.dataset.sceneEngine = "atmoscene-shared";
  elements.hero.dataset.sceneVersion = renderer.version;
  elements.hero.dataset.windProfile = weather.windProfile || "open-air";
  elements.hero.dataset.windForce = String(weather.wind || 0);
  elements.hero.dataset.weatherState = weather.key || "variable";
  elements.hero.dataset.assetLayers = "atmoscene-sky atmosphere stars sun-moon wind rain fog-haze lightning heat; meteocons-condition-ingredient";
  elements.generatedScene.dataset.renderer = "atmoscene-scene-v2";
  elements.generatedScene.dataset.sceneVersion = renderer.version;
  elements.generatedScene.dataset.sceneSource = "shared-library-compositor";
  return true;
}

function renderLibraryPreviews() {
  const renderer = window.AtmosceneSceneRenderer;
  if (!renderer) return;
  const slots = [...document.querySelectorAll("[data-dynamic-library-slot]")];
  if (!slots.length) return;

  const current = state.forecast?.current;
  const daily = state.forecast?.daily;
  const livePhase = current && daily
    ? determineDayPhase(state.location.timezone, daily.sunrise[0], daily.sunset[0])
    : "noon";
  const isDay = livePhase !== "night";
  const artwork = current ? resolveArtwork(current.weather_code, isDay, livePhase) : { moon: { slug: "moon-full" } };
  const moonKey = artwork.moon.slug.replace(/^moon-/, "");
  const liveWeather = current
    ? generatedWeatherConfig(renderer, current, isDay, state.air?.current || {})
    : renderer.weather("day", "clear-mild");
  const liveMode = isDay ? "day" : "night";
  const livePhaseConfig = isDay
    ? renderer.dayPhase(livePhase)
    : renderer.nightPhase(generatedNightPeriod(state.location.timezone), moonKey);
  const locationSeed = [...(state.location?.name || "Atmoscene")].reduce((total, character) => total + character.codePointAt(0), 0);
  const windLevel = current ? generatedWindLevel(current.wind_speed_10m) : 0;
  const temperatureValue = Number(current?.temperature_2m ?? 18);
  const localFeature = temperatureValue <= 2
    ? { mode: "day", phase: renderer.dayPhase("morning"), weather: renderer.weather("day", windLevel >= 3 ? "blowing-snow" : "light-snow"), route: "../library/snow-ice/", kicker: "Temperature-aware sample", title: "Snow & ice", description: "A cold-weather production scene selected for this location." }
    : windLevel >= 3
      ? { mode: "day", phase: renderer.dayPhase("afternoon"), weather: renderer.weather("day", windLevel >= 4 ? "squall" : "gusty"), route: "../library/wind/", kicker: "Wind-aware sample", title: "Wind system", description: "Flow intensity selected from the live wind reading." }
      : Number(current?.precipitation || 0) > 0
        ? { mode: "day", phase: renderer.dayPhase("morning"), weather: renderer.weather("day", Number(current.precipitation) > 2.5 ? "heavy-rain" : "rain"), route: "../library/rain/", kicker: "Precipitation-aware sample", title: "Rain system", description: "Rain intensity selected from the live observation." }
        : { mode: "day", phase: renderer.dayPhase(["morning", "noon", "afternoon"][locationSeed % 3]), weather: renderer.weather("day", ["clear-mild", "partly-cloudy", "breeze"][locationSeed % 3]), route: "../library/daylight-sun/", kicker: "Location-selected sample", title: "Daylight system", description: "A lightweight variation selected by the local scene resolver." };

  const selections = [
    {
      mode: liveMode,
      phase: livePhaseConfig,
      weather: liveWeather,
      route: `../library/catalog.html?mode=${liveMode}&state=${liveWeather.category}`,
      kicker: `Live resolver · ${state.location?.name || "local weather"}`,
      title: liveWeather.en || weatherMeta(current?.weather_code ?? 0).label,
      description: "The same shared Atmoscene scene currently composed in the hero."
    },
    localFeature,
    {
      mode: "night",
      phase: renderer.nightPhase(["evening", "midnight", "pre-dawn-night"][locationSeed % 3], moonKey || "full"),
      weather: renderer.weather("night", Number(current?.cloud_cover || 0) > 60 ? "overcast-night" : "clear-night"),
      route: "../library/night-moon/",
      kicker: "Lunar counterpart",
      title: "Night & moon",
      description: "Textured lunar phase with cloud-aware silver stars."
    },
    {
      mode: "day",
      phase: renderer.dayPhase(["dawn", "sunrise", "sunset"][locationSeed % 3]),
      weather: renderer.weather("day", "diamond-dust"),
      route: "../library/snow-ice/",
      kicker: "Global weather collection",
      title: "Snow & ice",
      description: "Original Atmoscene ice shimmer and atmospheric depth."
    }
  ];

  slots.forEach((slot, index) => {
    const selection = selections[index];
    const host = slot.querySelector(".library-scene-preview");
    slot.href = selection.route;
    slot.querySelector("span").textContent = selection.kicker;
    slot.querySelector("strong").textContent = selection.title;
    slot.querySelector("small").textContent = selection.description;
    const shadow = host.shadowRoot || host.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <link rel="stylesheet" href="../library/css/catalog.css?v=${renderer.version}">
      <style>:host{position:absolute;inset:0;display:block}.preview-root,.preview-root>.wx-scene{position:absolute;inset:0;width:100%;height:100%;min-height:100%;aspect-ratio:auto;border-radius:0}.wx-condition{max-width:190px}</style>
      <div class="preview-root">${renderer.sceneMarkup(selection, 20000 + index)}</div>`;
    host.dataset.renderer = renderer.version;
    host.dataset.sceneSource = "shared-library-compositor";
  });
}

function windName(speed) {
  const value = Number(speed) || 0;
  if (value < 5) return "calm";
  if (value < 15) return "light breeze";
  if (value < 30) return "steady wind";
  if (value < 45) return "strong wind";
  if (value < 65) return "gale";
  return "severe gusts";
}

function directionName(degrees) {
  const labels = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return labels[Math.round((Number(degrees) || 0) / 45) % 8];
}

function aqiCategory(value) {
  const aqi = Number(value);
  if (!Number.isFinite(aqi)) return "Unavailable";
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for sensitive groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very unhealthy";
  return "Hazardous";
}

function uvCategory(value) {
  const uv = Number(value);
  if (!Number.isFinite(uv)) return "Unavailable";
  if (uv < 3) return "Low exposure";
  if (uv < 6) return "Moderate exposure";
  if (uv < 8) return "High exposure";
  if (uv < 11) return "Very high exposure";
  return "Extreme exposure";
}

function visibilityCategory(valueInMetres) {
  const km = Number(valueInMetres) / 1000;
  if (!Number.isFinite(km)) return "Unavailable";
  if (km < 1) return "Very poor visibility";
  if (km < 4) return "Reduced visibility";
  if (km < 10) return "Moderate visibility";
  return "Clear distance";
}

function capeCategory(value) {
  const cape = Number(value);
  if (!Number.isFinite(cape)) return "Instability unavailable";
  if (cape < 300) return "Generally stable air";
  if (cape < 1000) return "Marginal instability";
  if (cape < 2500) return "Moderate instability";
  if (cape < 4000) return "High instability";
  return "Extreme instability";
}

function dominantPollen(air) {
  const values = [
    ["alder", air.alder_pollen],
    ["birch", air.birch_pollen],
    ["grass", air.grass_pollen],
    ["mugwort", air.mugwort_pollen],
    ["olive", air.olive_pollen],
    ["ragweed", air.ragweed_pollen],
  ].filter(([, value]) => Number.isFinite(Number(value)));
  if (!values.length) return null;
  const dominant = values.sort((a, b) => Number(b[1]) - Number(a[1]))[0];
  return Number(dominant[1]) > 0 ? dominant : null;
}

function renderMetricAssets(current, air) {
  const Engine = window.WeatherIconEngine;
  if (!Engine) return;
  const slugs = {
    wind: Engine.windSlug({
      speedKmh: current.wind_speed_10m,
      context: Number(current.wind_speed_10m) < 2 ? "calm" : Number(current.wind_speed_10m) < 12 ? "weak" : Number(current.wind_speed_10m) < 30 ? "moderate" : "strong",
    }),
    humidity: Engine.metrics.humidity,
    aqi: Engine.aqiSlug(air.us_aqi),
    uv: Engine.uvSlug(air.uv_index),
    pressure: Engine.pressureSlug(current.pressure_msl),
    visibility: Engine.visibilitySlug({
      visibilityM: current.visibility,
      isDay: Number(current.is_day) === 1,
      usAqi: air.us_aqi,
      pm25: air.pm2_5,
      dust: Number(air.dust) > 25,
    }) || "horizon",
    precipitation: Engine.precipitationSlug({ millimetres: current.precipitation, probability: current.precipitation_probability, windKmh: current.wind_speed_10m }),
    particles: Engine.metrics.smokeParticles,
    dewpoint: "thermometer-raindrop",
    clouds: Number(current.cloud_cover_high) > Number(current.cloud_cover_low) ? Engine.metrics.cloudIncreasing : Engine.metrics.cloudDecreasing,
    solar: Number(current.shortwave_radiation) > 650 ? "sun-hot" : Number(current.is_day) === 1 ? "clear-day" : "clear-night",
    storm: Number(current.cape) >= 1000 ? "thunderstorms" : Number(current.cape) >= 300 ? "weather-alarm-day" : "barometer-moderate",
    pollen: Engine.pollenSlug({
      alder: air.alder_pollen,
      birch: air.birch_pollen,
      grass: air.grass_pollen,
      mugwort: air.mugwort_pollen,
      ragweed: air.ragweed_pollen,
    }),
    ozone: Number(air.dust) > 25 ? Engine.metrics.dust : Number(air.ozone) > 180 ? "code-orange" : "smoke-particles",
  };
  document.querySelectorAll("[data-metric-asset]").forEach((image) => {
    const slug = slugs[image.dataset.metricAsset];
    if (slug) image.src = Engine.url(slug);
  });
}

function formatLocationContext(location) {
  return [location.admin1, location.country, formatTimeZoneName(location.timezone)]
    .filter(Boolean)
    .filter((item, index, items) => items.indexOf(item) === index)
    .join(" · ");
}

function populateStars() {
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < 38; index += 1) {
    const star = document.createElement("i");
    star.className = "star";
    star.style.left = `${32 + Math.random() * 64}%`;
    star.style.top = `${7 + Math.random() * 66}%`;
    star.style.setProperty("--star-size", `${1 + Math.random() * 1.7}px`);
    star.style.setProperty("--star-duration", `${3.2 + Math.random() * 4.8}s`);
    star.style.setProperty("--star-delay", `${-Math.random() * 7}s`);
    fragment.append(star);
  }
  elements.stars.replaceChildren(fragment);
}

function populateWind(speed) {
  elements.windLayer.replaceChildren();
  const value = Number(speed) || 0;
  const count = value < 5 ? 0 : value < 15 ? 3 : value < 30 ? 5 : value < 45 ? 7 : 10;
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < count; index += 1) {
    const streak = document.createElement("i");
    streak.className = "wind-streak";
    streak.style.top = `${17 + Math.random() * 66}%`;
    streak.style.setProperty("--wind-width", `${14 + Math.random() * 18}%`);
    streak.style.setProperty("--wind-duration", `${Math.max(2.3, 7.5 - value / 11) + Math.random() * 2.2}s`);
    streak.style.setProperty("--wind-delay", `${-Math.random() * 8}s`);
    fragment.append(streak);
  }
  elements.windLayer.append(fragment);
}

function populatePrecipitation(kind, precipitation, snowfall) {
  elements.precipitationLayer.replaceChildren();
  const isSnow = kind.includes("snow") || kind === "sleet";
  const isRain = kind.includes("rain") || kind === "drizzle" || kind === "storm";
  if (!isSnow && !isRain) return;

  const intensity = Math.max(Number(precipitation) || 0, Number(snowfall) || 0);
  const heavy = kind.includes("heavy") || kind === "storm" || intensity > 3;
  const count = isSnow ? (heavy ? 62 : 34) : heavy ? 84 : kind === "drizzle" ? 28 : 48;
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement("i");
    if (isSnow) {
      particle.className = "snow-flake";
      particle.style.left = `${Math.random() * 108}%`;
      particle.style.setProperty("--flake-size", `${2.5 + Math.random() * (heavy ? 7 : 5)}px`);
      particle.style.setProperty("--flake-opacity", `${.35 + Math.random() * .55}`);
      particle.style.setProperty("--flake-duration", `${5.5 + Math.random() * 7}s`);
      particle.style.setProperty("--flake-delay", `${-Math.random() * 12}s`);
    } else {
      particle.className = "rain-drop";
      particle.style.left = `${Math.random() * 115}%`;
      particle.style.setProperty("--drop-length", `${heavy ? 32 + Math.random() * 30 : 16 + Math.random() * 24}px`);
      particle.style.setProperty("--drop-opacity", `${.25 + Math.random() * .48}`);
      particle.style.setProperty("--drop-duration", `${heavy ? .62 + Math.random() * .46 : 1 + Math.random() * .75}s`);
      particle.style.setProperty("--drop-delay", `${-Math.random() * 3}s`);
    }
    fragment.append(particle);
  }
  elements.precipitationLayer.append(fragment);
}

function updateStageClasses(phase, kind) {
  [elements.stage, elements.hero].forEach((target) => {
    [...target.classList].forEach((className) => {
      if (className.startsWith("phase-") || (className.startsWith("weather-") && className !== "weather-stage")) {
        target.classList.remove(className);
      }
    });
    target.classList.add(`phase-${phase}`, `weather-${sceneKind(kind)}`);
  });
}

function updateHeroContrast(phase, kind, isDay) {
  const brightDay = isDay && ["morning", "noon", "afternoon"].includes(phase);
  const cloudCover = Number(state.forecast?.current?.cloud_cover || 0);
  const darkWeather = ["storm", "rain-heavy"].includes(kind) || (kind === "cloud" && cloudCover >= 78);
  const veiledWeather = ["cloud", "fog", "drizzle", "rain", "rain-heavy", "sleet", "snow", "snow-heavy", "storm"].includes(kind);
  const productInk = brightDay && !darkWeather ? "dark" : "light";
  const weatherInk = brightDay && !darkWeather && !veiledWeather && cloudCover < 45 ? "dark" : "light";
  const skyTheme = ["dawn", "sunrise"].includes(phase) ? "dawn" : ["sunset", "dusk"].includes(phase) ? "dusk" : isDay ? "day" : "night";
  const skyMode = skyTheme === "night" ? "night" : "day";
  document.documentElement.dataset.skyMode = skyMode;
  document.documentElement.dataset.skyTheme = skyTheme;
  document.documentElement.dataset.skyWeather = darkWeather ? "severe" : kind === "fog" || kind === "haze" ? "low-visibility" : "standard";
  try { localStorage.setItem("atmoscene-sky-theme-v2", skyTheme); } catch {}
  const themeColors = { day: "#dceef1", dawn: "#32243d", dusk: "#1b2039", night: "#071421" };
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeColors[skyTheme]);
  elements.hero.dataset.heroInk = productInk;
  elements.hero.dataset.weatherInk = weatherInk;
  elements.hero.dataset.resolvedPhase = phase;
  elements.hero.dataset.resolvedWeather = kind;
  const air = state.air?.current || {};
  const aerosolLoad = Math.max(Number(air.us_aqi) || 0, (Number(air.pm2_5) || 0) * 3);
  elements.hero.dataset.starVisibility = aerosolLoad > 130 || cloudCover >= 85
    ? "hidden"
    : aerosolLoad > 80 || cloudCover >= 55
      ? "muted"
      : cloudCover < 20 ? "clear" : "partial";
}

function renderScene() {
  const current = state.forecast.current;
  const daily = state.forecast.daily;
  const phase = determineDayPhase(state.location.timezone, daily.sunrise[0], daily.sunset[0]);
  const meta = weatherMeta(current.weather_code);
  // Sunrise/sunset data is the visual authority. This prevents an API is_day
  // edge from rendering a night scene during the local afternoon or twilight.
  const isDay = phase !== "night";
  const artwork = resolveArtwork(current.weather_code, isDay, phase);

  updateStageClasses(phase, meta.kind);
  updateHeroContrast(phase, meta.kind, isDay);
  const usesGeneratedScene = renderGeneratedScene(current, phase, isDay, artwork);
  if (!usesGeneratedScene) {
    elements.stage.dataset.sceneEngine = "unavailable";
    elements.hero.dataset.sceneEngine = "unavailable";
    return;
  }
}

function renderCurrent() {
  const current = state.forecast.current;
  const meta = weatherMeta(current.weather_code);
  elements.locationName.textContent = state.location.name;
  elements.locationContext.textContent = formatLocationContext(state.location) || `${state.location.latitude.toFixed(3)}, ${state.location.longitude.toFixed(3)}`;
  elements.locationSource.textContent = state.location.source || "Selected location";
  elements.temperature.textContent = temperature(current.temperature_2m);
  elements.condition.textContent = meta.label;
  elements.feels.textContent = `Feels like ${temperature(current.apparent_temperature)} · ${Math.round(current.cloud_cover ?? 0)}% cloud cover`;
  renderClock();
}

function renderMetrics() {
  const current = state.forecast.current;
  const air = state.air?.current ?? {};
  const windDirection = directionName(current.wind_direction_10m);
  elements.wind.textContent = windSpeed(current.wind_speed_10m);
  elements.windDetail.textContent = `${windDirection} · gusts ${windSpeed(current.wind_gusts_10m)} · ${windName(current.wind_speed_10m)}`;
  elements.windCompass.style.setProperty("--wind-deg", `${Number(current.wind_direction_10m) || 0}deg`);
  elements.humidity.textContent = `${numberOrDash(current.relative_humidity_2m)}%`;
  elements.humidityDetail.textContent = Number(current.relative_humidity_2m) >= 80 ? "Very humid air" : Number(current.relative_humidity_2m) >= 60 ? "Humid air" : "Relative humidity";
  elements.aqi.textContent = numberOrDash(air.us_aqi);
  elements.aqiDetail.textContent = `${aqiCategory(air.us_aqi)} · US AQI`;
  elements.uv.textContent = numberOrDash(air.uv_index, 1);
  elements.uvDetail.textContent = uvCategory(air.uv_index);
  elements.pressure.textContent = pressure(current.pressure_msl);
  elements.visibility.textContent = distance(current.visibility);
  elements.visibilityDetail.textContent = visibilityCategory(current.visibility);
  elements.precipitation.textContent = precipitation(current.precipitation);
  elements.precipitationDetail.textContent = Number(current.snowfall) > 0 ? `${snowfall(current.snowfall)} snowfall` : Number(current.precipitation) > 2.5 ? "Heavy current intensity" : Number(current.precipitation) > 0 ? "Active precipitation" : "No current precipitation";
  elements.pm25.textContent = `${numberOrDash(air.pm2_5, 1)} µg/m³`;
  elements.particlesDetail.textContent = `PM2.5 · PM10 ${numberOrDash(air.pm10, 1)} µg/m³`;
  elements.dewpoint.textContent = temperature(current.dew_point_2m);
  const dewpointSpreadC = Number(current.temperature_2m) - Number(current.dew_point_2m);
  const dewpointSpread = state.unit === "f" ? dewpointSpreadC * 9 / 5 : dewpointSpreadC;
  elements.dewpointDetail.textContent = Number.isFinite(dewpointSpread) ? `${Math.round(dewpointSpread)}° below air temperature` : "Condensation threshold unavailable";
  elements.clouds.textContent = `${numberOrDash(current.cloud_cover)}%`;
  elements.cloudsDetail.textContent = `Low ${numberOrDash(current.cloud_cover_low)}% · mid ${numberOrDash(current.cloud_cover_mid)}% · high ${numberOrDash(current.cloud_cover_high)}%`;
  elements.solar.textContent = `${numberOrDash(current.shortwave_radiation)} W/m²`;
  elements.solarDetail.textContent = `Direct ${numberOrDash(current.direct_radiation)} W/m²`;
  elements.cape.textContent = `${numberOrDash(current.cape)} J/kg`;
  elements.capeDetail.textContent = capeCategory(current.cape);
  const pollen = dominantPollen(air);
  elements.pollen.textContent = pollen ? `${numberOrDash(pollen[1], 1)} grains/m³` : "Not detected";
  elements.pollenDetail.textContent = pollen ? `Dominant: ${pollen[0]}` : "Regional/seasonal data may be unavailable";
  elements.ozone.textContent = `${numberOrDash(air.ozone, 1)} µg/m³`;
  elements.ozoneDetail.textContent = `Dust ${numberOrDash(air.dust, 1)} µg/m³`;
  renderMetricAssets(current, air);
}

function renderForecast() {
  const daily = state.forecast.daily;
  const fragment = document.createDocumentFragment();
  const locale = localeForCountry();
  const dayFormatter = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  const dateFormatter = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", timeZone: "UTC" });
  const todayKey = String(state.forecast.current?.time || "").slice(0, 10);
  const todayIndex = Math.max(0, daily.time.indexOf(todayKey));
  const before = state.timelineRange === 7 ? 3 : state.timelineRange === 15 ? 7 : 14;
  const start = Math.max(0, todayIndex - before);
  const end = Math.min(daily.time.length, start + state.timelineRange);

  daily.time.slice(start, end).forEach((dateValue, visibleIndex) => {
    const index = start + visibleIndex;
    const item = elements.forecastTemplate.content.firstElementChild.cloneNode(true);
    const date = new Date(`${dateValue}T12:00:00Z`);
    const meta = weatherMeta(daily.weather_code[index]);
    const Engine = window.WeatherIconEngine;
    const relation = index < todayIndex ? "past" : index > todayIndex ? "forecast" : "current";
    const iconSlug = Engine?.wmoSlug({ code: daily.weather_code[index], isDay: true }) || "cloudy";
    item.classList.add(`is-${relation}`);
    item.querySelector(".timeline-kind").textContent = relation === "past" ? "Observed" : relation === "current" ? "Now" : "Forecast";
    item.querySelector(".forecast-day").textContent = relation === "current" ? "Today" : dayFormatter.format(date);
    item.querySelector(".forecast-date").textContent = dateFormatter.format(date);
    item.querySelector(".forecast-icon").src = Engine?.url(iconSlug) || asset(iconSlug);
    item.querySelector(".forecast-icon").alt = meta.label;
    item.querySelector(".forecast-condition").textContent = meta.label;
    item.querySelector(".forecast-temp b").textContent = temperature(daily.temperature_2m_max[index]);
    item.querySelector(".forecast-temp span").textContent = temperature(daily.temperature_2m_min[index]);
    const probability = daily.precipitation_probability_max[index];
    const snow = daily.snowfall_sum[index];
    item.querySelector(".forecast-rain").textContent = Number(snow) > 0 ? `${snowfall(snow)} snow · ${numberOrDash(probability)}% chance` : `${numberOrDash(probability)}% precipitation chance`;
    fragment.append(item);
  });

  elements.forecastGrid.replaceChildren(fragment);
  elements.forecastGrid.setAttribute("aria-busy", "false");
  elements.sunCycle.textContent = `Today · sunrise ${formatIsoClock(daily.sunrise[todayIndex])} · sunset ${formatIsoClock(daily.sunset[todayIndex])}`;
  elements.timelineControls?.querySelectorAll("button").forEach((button) => button.classList.toggle("active", Number(button.dataset.range) === state.timelineRange));
}

function renderClock() {
  if (!state.location) return;
  elements.localTime.textContent = `${formatLocalTime(state.location.timezone)} · ${formatTimeZoneName(state.location.timezone)}`;
  if (state.updatedAt) {
    elements.lastUpdated.textContent = new Intl.DateTimeFormat(localeForCountry(), {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    }).format(state.updatedAt);
  }
  if (state.nextRefreshAt) {
    const remaining = Math.max(0, state.nextRefreshAt.getTime() - Date.now());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    elements.nextRefresh.textContent = `in ${minutes}m ${String(seconds).padStart(2, "0")}s · automatic`;
  }
}

function render() {
  renderCurrent();
  renderScene();
  renderMetrics();
  renderForecast();
  renderLibraryPreviews();
}

function setLoading(isLoading, silent = false) {
  state.isLoading = isLoading;
  elements.refresh.classList.toggle("is-loading", isLoading);
  elements.refresh.disabled = isLoading;
  if (!silent) elements.loading.classList.toggle("is-hidden", !isLoading);
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Weather service returned ${response.status}`);
  return response.json();
}

async function fetchJsonWithTimeout(url, timeout = 5500) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeout);
  try {
    return await fetchJson(url, { signal: controller.signal, cache: "no-store" });
  } finally {
    window.clearTimeout(timer);
  }
}

function forecastUrl(location) {
  const params = new URLSearchParams({
    latitude: location.latitude,
    longitude: location.longitude,
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "dew_point_2m",
      "apparent_temperature",
      "is_day",
      "precipitation_probability",
      "precipitation",
      "rain",
      "showers",
      "snowfall",
      "weather_code",
      "cloud_cover",
      "cloud_cover_low",
      "cloud_cover_mid",
      "cloud_cover_high",
      "pressure_msl",
      "surface_pressure",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
      "visibility",
      "shortwave_radiation",
      "direct_radiation",
      "sunshine_duration",
      "cape",
      "freezing_level_height",
      "snow_depth",
    ].join(","),
    hourly: [
      "temperature_2m",
      "apparent_temperature",
      "precipitation_probability",
      "weather_code",
      "is_day",
      "wind_speed_10m",
      "wind_gusts_10m",
      "visibility",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "apparent_temperature_max",
      "apparent_temperature_min",
      "precipitation_probability_max",
      "precipitation_sum",
      "precipitation_hours",
      "snowfall_sum",
      "sunrise",
      "sunset",
      "daylight_duration",
      "sunshine_duration",
      "wind_speed_10m_max",
      "wind_gusts_10m_max",
      "wind_direction_10m_dominant",
      "shortwave_radiation_sum",
    ].join(","),
    timezone: "auto",
    past_days: "14",
    forecast_days: "16",
  });
  return `${API.forecast}?${params}`;
}

function airQualityUrl(location) {
  const params = new URLSearchParams({
    latitude: location.latitude,
    longitude: location.longitude,
    current: [
      "us_aqi",
      "pm10",
      "pm2_5",
      "carbon_monoxide",
      "nitrogen_dioxide",
      "sulphur_dioxide",
      "ozone",
      "uv_index",
      "uv_index_clear_sky",
      "dust",
      "european_aqi",
      "alder_pollen",
      "birch_pollen",
      "grass_pollen",
      "mugwort_pollen",
      "olive_pollen",
      "ragweed_pollen",
    ].join(","),
    timezone: "auto",
  });
  return `${API.airQuality}?${params}`;
}

async function loadWeather(location, { silent = false } = {}) {
  state.weatherAbort?.abort();
  state.weatherAbort = new AbortController();
  setLoading(true, silent);

  try {
    const [forecast, air] = await Promise.all([
      fetchJson(forecastUrl(location), { signal: state.weatherAbort.signal }),
      fetchJson(airQualityUrl(location), { signal: state.weatherAbort.signal }).catch((error) => {
        if (error.name === "AbortError") throw error;
        return { current: {} };
      }),
    ]);

    state.location = {
      ...location,
      timezone: forecast.timezone || location.timezone || "UTC",
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
    };
    applyLocationUnits(state.location);
    state.forecast = forecast;
    state.air = air;
    state.updatedAt = new Date();
    state.nextRefreshAt = new Date(Date.now() + REFRESH_INTERVAL);
    persistLocation();
    render();
    scheduleRefresh();
    const liveCondition = weatherMeta(forecast.current.weather_code).label.toLowerCase();
    const airNow = air.current || {};
    const airModifier = Number(airNow.us_aqi) > 100 || Number(airNow.pm2_5) > 35 ? " with visible haze" : "";
    elements.engineNote.textContent = `Live ${liveCondition}${airModifier} in ${state.location.name}. Atmoscene resolves local solar phase, cloud, air quality, visibility and wind into this scene and updates it every 10 minutes.`;
  } catch (error) {
    if (error.name !== "AbortError") {
      showError("Atmoscene could not load this location right now. Check the connection or try another place.");
      console.error(error);
    }
  } finally {
    setLoading(false, silent);
  }
}

function scheduleRefresh() {
  clearTimeout(state.refreshTimer);
  state.refreshTimer = setTimeout(() => loadWeather(state.location, { silent: true }), REFRESH_INTERVAL);
}

function persistLocation() {
  const url = new URL(window.location.href);
  const isExplicitShare = url.searchParams.get("share") === "1";
  localStorage.removeItem("atmoscene-location-v1");
  if (isExplicitShare) {
    url.searchParams.set("lat", String(state.location.latitude));
    url.searchParams.set("lon", String(state.location.longitude));
    url.searchParams.set("name", state.location.name);
    if (state.location.country) url.searchParams.set("country", state.location.country);
    if (state.location.countryCode) url.searchParams.set("countryCode", state.location.countryCode);
    if (state.location.admin1) url.searchParams.set("admin", state.location.admin1);
  } else {
    url.search = "";
  }
  history.replaceState({}, "", url);
}

function locationFromStorageOrUrl() {
  const params = new URLSearchParams(window.location.search);
  const hasCoordinates = params.get("share") === "1" && params.has("lat") && params.has("lon");
  const latitude = Number(params.get("lat"));
  const longitude = Number(params.get("lon"));
  if (hasCoordinates && Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return {
      name: params.get("name") || "Selected location",
      country: params.get("country") || "",
      countryCode: params.get("countryCode") || "",
      admin1: params.get("admin") || "",
      latitude,
      longitude,
      timezone: "UTC",
      source: "Shared location",
    };
  }

  localStorage.removeItem("atmoscene-location-v1");
  return null;
}

async function approximateLocationFromIp() {
  const normalize = (data) => {
    const latitude = Number(data.latitude ?? data.lat);
    const longitude = Number(data.longitude ?? data.lon);
    if (data.success === false || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new Error("Approximate location is unavailable");
    }
    const timezone = data.timezone?.id || data.time_zone || data.timeZone || data.timezone || "auto";
    return {
      name: data.city || data.cityName || data.region || data.region_name || data.regionName || data.country || data.country_name || data.countryName || "Approximate location",
      country: data.country || data.country_name || data.countryName || "",
      countryCode: data.country_code || data.countryCode || "",
      admin1: data.region || data.region_name || data.regionName || "",
      latitude,
      longitude,
      timezone: typeof timezone === "string" ? timezone : "auto",
      source: "Approximate location by IP",
    };
  };

  return Promise.any(API.ipLocation.map(async (endpoint) => normalize(await fetchJsonWithTimeout(endpoint))));
}

function preciseBrowserPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Precise location is not supported by this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(new Error(error.code === 1 ? "Precise location permission was not granted." : "The browser could not determine a precise location.")),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 },
    );
  });
}

async function preciseBrowserLocation() {
  const position = await preciseBrowserPosition();
  const params = new URLSearchParams({
    latitude: String(position.coords.latitude),
    longitude: String(position.coords.longitude),
    localityLanguage: "en",
  });
  const place = await fetchJson(`${API.reverseGeocoding}?${params}`);
  const countryCode = place.countryCode || "";
  const subdivisionCode = String(place.principalSubdivisionCode || "").split("-").pop();
  const locality = place.city || place.locality || place.principalSubdivision || "Current location";
  const compactRegionCountries = new Set(["US", "CA", "AU"]);
  const name = compactRegionCountries.has(countryCode) && subdivisionCode && locality !== subdivisionCode
    ? `${locality}, ${subdivisionCode}`
    : locality;
  return {
    name,
    country: place.countryName || "",
    countryCode,
    admin1: place.principalSubdivision || "",
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    source: "Precise location",
  };
}

async function searchLocations(query) {
  const normalized = query.trim();
  if (normalized.length < 3) {
    closeResults();
    return [];
  }
  state.searchAbort?.abort();
  state.searchAbort = new AbortController();
  const params = new URLSearchParams({ name: normalized, count: "8", language: "en", format: "json" });

  try {
    const data = await fetchJson(`${API.geocoding}?${params}`, { signal: state.searchAbort.signal });
    state.searchResults = data.results ?? [];
    state.activeSearchIndex = -1;
    renderSearchResults();
    return state.searchResults;
  } catch (error) {
    if (error.name !== "AbortError") showError("Location search is temporarily unavailable.");
    return [];
  }
}

function renderSearchResults() {
  if (!state.searchResults.length) {
    elements.results.innerHTML = '<p class="search-hint">No matching places found.</p>';
    elements.results.hidden = false;
    elements.input.setAttribute("aria-expanded", "true");
    return;
  }
  const fragment = document.createDocumentFragment();
  state.searchResults.forEach((result, index) => {
    const item = elements.resultTemplate.content.firstElementChild.cloneNode(true);
    const context = [result.admin1, result.country].filter(Boolean).join(", ");
    item.dataset.index = String(index);
    item.setAttribute("aria-selected", String(index === state.activeSearchIndex));
    item.querySelector("strong").textContent = result.name;
    item.querySelector("small").textContent = context;
    item.querySelector("em").textContent = result.timezone || "";
    item.addEventListener("click", () => chooseLocation(result));
    fragment.append(item);
  });
  elements.results.replaceChildren(fragment);
  elements.results.hidden = false;
  elements.input.setAttribute("aria-expanded", "true");
}

function closeResults() {
  elements.results.hidden = true;
  elements.input.setAttribute("aria-expanded", "false");
  state.activeSearchIndex = -1;
}

function chooseLocation(result) {
  const location = {
    name: result.name,
    country: result.country,
    countryCode: result.country_code || "",
    admin1: result.admin1,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone,
    source: "Manual location search",
  };
  elements.input.value = [result.name, result.country].filter(Boolean).join(", ");
  closeResults();
  loadWeather(location);
}

function showError(message) {
  document.querySelector(".error-toast")?.remove();
  const toast = document.createElement("div");
  toast.className = "error-toast";
  toast.setAttribute("role", "alert");
  toast.textContent = message;
  document.body.append(toast);
  setTimeout(() => toast.remove(), 7000);
}

const debouncedSearch = debounce((query) => searchLocations(query), 320);

elements.input.addEventListener("input", (event) => debouncedSearch(event.target.value));
elements.input.addEventListener("keydown", (event) => {
  if (elements.results.hidden || !state.searchResults.length) return;
  if (event.key === "ArrowDown") {
    event.preventDefault();
    state.activeSearchIndex = Math.min(state.searchResults.length - 1, state.activeSearchIndex + 1);
    renderSearchResults();
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    state.activeSearchIndex = Math.max(0, state.activeSearchIndex - 1);
    renderSearchResults();
  } else if (event.key === "Enter" && state.activeSearchIndex >= 0) {
    event.preventDefault();
    chooseLocation(state.searchResults[state.activeSearchIndex]);
  } else if (event.key === "Escape") {
    closeResults();
  }
});

elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (state.activeSearchIndex >= 0 && state.searchResults[state.activeSearchIndex]) {
    chooseLocation(state.searchResults[state.activeSearchIndex]);
    return;
  }
  const results = await searchLocations(elements.input.value);
  if (results[0]) chooseLocation(results[0]);
});

document.addEventListener("click", (event) => {
  if (!elements.form.contains(event.target)) closeResults();
});

elements.refresh.addEventListener("click", () => {
  if (state.location && !state.isLoading) loadWeather(state.location, { silent: true });
});

elements.preciseLocation.addEventListener("click", async () => {
  elements.preciseLocation.disabled = true;
  elements.locationSource.textContent = "Waiting for browser permission…";
  try {
    const location = await preciseBrowserLocation();
    elements.input.value = [location.name, location.country].filter(Boolean).join(", ");
    await loadWeather(location);
  } catch (error) {
    elements.locationSource.textContent = state.location?.source || "Location unchanged";
    showError(error.message);
  } finally {
    elements.preciseLocation.disabled = false;
  }
});

const toggleTemperatureUnit = () => {
  state.unit = state.unit === "c" ? "f" : "c";
  const key = unitPreferenceKey();
  state.unitOverrides[key] = { ...(state.unitOverrides[key] || {}), temperature: state.unit };
  saveUnitOverrides();
  renderUnitControls();
  if (state.forecast) {
    renderCurrent();
    renderForecast();
  }
};
elements.unitButtons.forEach((button) => button.addEventListener("click", toggleTemperatureUnit));

const toggleWindUnit = () => {
  state.windUnit = state.windUnit === "kmh" ? "mph" : "kmh";
  const key = unitPreferenceKey();
  state.unitOverrides[key] = { ...(state.unitOverrides[key] || {}), wind: state.windUnit };
  saveUnitOverrides();
  renderUnitControls();
  if (state.forecast) renderMetrics();
};
elements.windUnitButtons.forEach((button) => button.addEventListener("click", toggleWindUnit));

elements.timelineControls?.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-range]");
  if (!button) return;
  state.timelineRange = Number(button.dataset.range) || 7;
  if (state.forecast) renderForecast();
});

async function initialize() {
  populateStars();
  state.clockTimer = setInterval(renderClock, 1000);
  const savedOrShared = locationFromStorageOrUrl();
  if (savedOrShared) {
    await loadWeather(savedOrShared);
    return;
  }
  elements.locationSource.textContent = "Finding approximate location by IP…";
  try {
    await loadWeather(await approximateLocationFromIp());
  } catch {
    await loadWeather({ ...DEFAULT_LOCATION, source: "Fallback location" });
  }
}

initialize();
