const API = {
  geocoding: "https://geocoding-api.open-meteo.com/v1/search",
  forecast: "https://api.open-meteo.com/v1/forecast",
  airQuality: "https://air-quality-api.open-meteo.com/v1/air-quality",
};

const ASSET_ROOT = "./assets/meteocons-flat";
const REFRESH_INTERVAL = 10 * 60 * 1000;
const DEFAULT_LOCATION = {
  name: "Dhaka",
  country: "Bangladesh",
  admin1: "Dhaka Division",
  latitude: 23.8103,
  longitude: 90.4125,
  timezone: "Asia/Dhaka",
};

const state = {
  location: null,
  forecast: null,
  air: null,
  unit: "c",
  isLoading: false,
  updatedAt: null,
  nextRefreshAt: null,
  searchResults: [],
  activeSearchIndex: -1,
  searchAbort: null,
  weatherAbort: null,
  refreshTimer: null,
  clockTimer: null,
};

const elements = {
  form: document.querySelector("#location-form"),
  input: document.querySelector("#location-input"),
  results: document.querySelector("#search-results"),
  resultTemplate: document.querySelector("#search-result-template"),
  stage: document.querySelector("#weather-stage"),
  loading: document.querySelector("#loading-overlay"),
  refresh: document.querySelector("#refresh-button"),
  unit: document.querySelector("#unit-toggle"),
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
  sceneState: document.querySelector("#scene-state"),
  lastUpdated: document.querySelector("#last-updated"),
  nextRefresh: document.querySelector("#next-refresh"),
  engineNote: document.querySelector("#engine-note"),
  stars: document.querySelector("#stars"),
  windLayer: document.querySelector("#wind-layer"),
  precipitationLayer: document.querySelector("#precipitation-layer"),
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
  forecastGrid: document.querySelector("#forecast-grid"),
  forecastTemplate: document.querySelector("#forecast-template"),
  sunCycle: document.querySelector("#sun-cycle"),
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
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());
}

function minutesFromIso(value) {
  if (!value || !value.includes("T")) return null;
  const [hour, minute] = value.split("T")[1].split(":").map(Number);
  return hour * 60 + minute;
}

function formatIsoClock(value) {
  if (!value || !value.includes("T")) return "--";
  const [hour, minute] = value.split("T")[1].split(":").map(Number);
  return new Intl.DateTimeFormat("en-US", {
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

function formatLocationContext(location) {
  return [location.admin1, location.country].filter(Boolean).filter((item, index, items) => items.indexOf(item) === index).join(" · ");
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
  [...elements.stage.classList].forEach((className) => {
    if (className.startsWith("phase-") || (className.startsWith("weather-") && className !== "weather-stage")) {
      elements.stage.classList.remove(className);
    }
  });
  elements.stage.classList.add(`phase-${phase}`, `weather-${sceneKind(kind)}`);
}

function renderScene() {
  const current = state.forecast.current;
  const daily = state.forecast.daily;
  const phase = determineDayPhase(state.location.timezone, daily.sunrise[0], daily.sunset[0]);
  const meta = weatherMeta(current.weather_code);
  const isDay = Number(current.is_day) === 1;
  const artwork = resolveArtwork(current.weather_code, isDay, phase);

  updateStageClasses(phase, meta.kind);
  elements.conditionArt.onerror = () => {
    elements.conditionArt.src = asset(isDay ? "partly-cloudy-day" : "cloudy");
  };
  if (artwork.condition) {
    elements.conditionArt.src = asset(artwork.condition);
    elements.conditionArt.hidden = false;
  } else {
    elements.conditionArt.hidden = true;
  }
  elements.weatherArt.classList.toggle("moon-only", !artwork.condition && artwork.showMoon);

  if (artwork.showMoon) {
    elements.moonArt.src = asset(artwork.moon.slug);
    elements.moonArt.hidden = false;
    elements.moonHalo.hidden = artwork.moon.slug === "moon-new";
    elements.moonHalo.style.opacity = Math.max(.18, artwork.moon.illumination).toFixed(2);
  } else {
    elements.moonArt.hidden = true;
    elements.moonHalo.hidden = true;
  }

  populateWind(current.wind_speed_10m);
  populatePrecipitation(meta.kind, current.precipitation, current.snowfall);

  const phaseLabel = phase.charAt(0).toUpperCase() + phase.slice(1);
  const moonLabel = !isDay ? ` · ${artwork.moon.name}` : "";
  elements.sceneState.textContent = `${phaseLabel} · ${meta.label} · ${windName(current.wind_speed_10m)}${moonLabel}`;
}

function renderCurrent() {
  const current = state.forecast.current;
  const meta = weatherMeta(current.weather_code);
  elements.locationName.textContent = state.location.name;
  elements.locationContext.textContent = formatLocationContext(state.location) || `${state.location.latitude.toFixed(3)}, ${state.location.longitude.toFixed(3)}`;
  elements.temperature.textContent = temperature(current.temperature_2m);
  elements.condition.textContent = meta.label;
  elements.feels.textContent = `Feels like ${temperature(current.apparent_temperature)} · ${Math.round(current.cloud_cover ?? 0)}% cloud cover`;
  renderClock();
}

function renderMetrics() {
  const current = state.forecast.current;
  const air = state.air?.current ?? {};
  const windDirection = directionName(current.wind_direction_10m);
  elements.wind.textContent = `${numberOrDash(current.wind_speed_10m)} km/h`;
  elements.windDetail.textContent = `${windDirection} · gusts ${numberOrDash(current.wind_gusts_10m)} km/h · ${windName(current.wind_speed_10m)}`;
  elements.windCompass.style.setProperty("--wind-deg", `${Number(current.wind_direction_10m) || 0}deg`);
  elements.humidity.textContent = `${numberOrDash(current.relative_humidity_2m)}%`;
  elements.humidityDetail.textContent = Number(current.relative_humidity_2m) >= 80 ? "Very humid air" : Number(current.relative_humidity_2m) >= 60 ? "Humid air" : "Relative humidity";
  elements.aqi.textContent = numberOrDash(air.us_aqi);
  elements.aqiDetail.textContent = `${aqiCategory(air.us_aqi)} · US AQI`;
  elements.uv.textContent = numberOrDash(air.uv_index, 1);
  elements.uvDetail.textContent = uvCategory(air.uv_index);
  elements.pressure.textContent = `${numberOrDash(current.pressure_msl)} hPa`;
  elements.visibility.textContent = `${numberOrDash(Number(current.visibility) / 1000, 1)} km`;
  elements.visibilityDetail.textContent = visibilityCategory(current.visibility);
  elements.precipitation.textContent = `${numberOrDash(current.precipitation, 1)} mm`;
  elements.precipitationDetail.textContent = Number(current.snowfall) > 0 ? `${numberOrDash(current.snowfall, 1)} cm snowfall` : Number(current.precipitation) > 2.5 ? "Heavy current intensity" : Number(current.precipitation) > 0 ? "Active precipitation" : "No current precipitation";
  elements.pm25.textContent = `${numberOrDash(air.pm2_5, 1)} μg/m³`;
}

function renderForecast() {
  const daily = state.forecast.daily;
  const fragment = document.createDocumentFragment();
  const dayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" });
  const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

  daily.time.forEach((dateValue, index) => {
    const item = elements.forecastTemplate.content.firstElementChild.cloneNode(true);
    const date = new Date(`${dateValue}T12:00:00Z`);
    const meta = weatherMeta(daily.weather_code[index]);
    const artwork = resolveArtwork(daily.weather_code[index], true, "noon", true);
    item.querySelector(".forecast-day").textContent = index === 0 ? "Today" : dayFormatter.format(date);
    item.querySelector(".forecast-date").textContent = dateFormatter.format(date);
    item.querySelector(".forecast-icon").src = asset(artwork.condition);
    item.querySelector(".forecast-icon").alt = meta.label;
    item.querySelector(".forecast-condition").textContent = meta.label;
    item.querySelector(".forecast-temp b").textContent = temperature(daily.temperature_2m_max[index]);
    item.querySelector(".forecast-temp span").textContent = temperature(daily.temperature_2m_min[index]);
    const probability = daily.precipitation_probability_max[index];
    const snow = daily.snowfall_sum[index];
    item.querySelector(".forecast-rain").textContent = Number(snow) > 0 ? `${numberOrDash(snow, 1)} cm snow · ${numberOrDash(probability)}% chance` : `${numberOrDash(probability)}% precipitation chance`;
    fragment.append(item);
  });

  elements.forecastGrid.replaceChildren(fragment);
  elements.forecastGrid.setAttribute("aria-busy", "false");
  elements.sunCycle.textContent = `Today · sunrise ${formatIsoClock(daily.sunrise[0])} · sunset ${formatIsoClock(daily.sunset[0])}`;
}

function renderClock() {
  if (!state.location) return;
  elements.localTime.textContent = `${formatLocalTime(state.location.timezone)} · ${state.location.timezone}`;
  if (state.updatedAt) {
    elements.lastUpdated.textContent = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    }).format(state.updatedAt);
  }
  if (state.nextRefreshAt) {
    const remaining = Math.max(0, state.nextRefreshAt.getTime() - Date.now());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    elements.nextRefresh.textContent = `${minutes}:${String(seconds).padStart(2, "0")} · automatic`;
  }
}

function render() {
  renderCurrent();
  renderScene();
  renderMetrics();
  renderForecast();
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

function forecastUrl(location) {
  const params = new URLSearchParams({
    latitude: location.latitude,
    longitude: location.longitude,
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "precipitation",
      "rain",
      "showers",
      "snowfall",
      "weather_code",
      "cloud_cover",
      "pressure_msl",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
      "visibility",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "precipitation_sum",
      "snowfall_sum",
      "sunrise",
      "sunset",
    ].join(","),
    timezone: "auto",
    forecast_days: "7",
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
      "dust",
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
    state.forecast = forecast;
    state.air = air;
    state.updatedAt = new Date();
    state.nextRefreshAt = new Date(Date.now() + REFRESH_INTERVAL);
    persistLocation();
    render();
    scheduleRefresh();
    elements.engineNote.textContent = `Showing ${weatherMeta(forecast.current.weather_code).label.toLowerCase()} in ${state.location.name}. Data refreshes automatically without reloading the page.`;
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
  const safeLocation = {
    name: state.location.name,
    country: state.location.country,
    admin1: state.location.admin1,
    latitude: state.location.latitude,
    longitude: state.location.longitude,
    timezone: state.location.timezone,
  };
  localStorage.setItem("atmoscene-location-v1", JSON.stringify(safeLocation));
  const url = new URL(window.location.href);
  url.searchParams.set("lat", String(safeLocation.latitude));
  url.searchParams.set("lon", String(safeLocation.longitude));
  url.searchParams.set("name", safeLocation.name);
  if (safeLocation.country) url.searchParams.set("country", safeLocation.country);
  if (safeLocation.admin1) url.searchParams.set("admin", safeLocation.admin1);
  history.replaceState({}, "", url);
}

function locationFromStorageOrUrl() {
  const params = new URLSearchParams(window.location.search);
  const hasCoordinates = params.has("lat") && params.has("lon");
  const latitude = Number(params.get("lat"));
  const longitude = Number(params.get("lon"));
  if (hasCoordinates && Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return {
      name: params.get("name") || "Selected location",
      country: params.get("country") || "",
      admin1: params.get("admin") || "",
      latitude,
      longitude,
      timezone: "UTC",
    };
  }

  try {
    const stored = JSON.parse(localStorage.getItem("atmoscene-location-v1"));
    if (Number.isFinite(Number(stored?.latitude)) && Number.isFinite(Number(stored?.longitude))) return stored;
  } catch {
    localStorage.removeItem("atmoscene-location-v1");
  }
  return DEFAULT_LOCATION;
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
    admin1: result.admin1,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone,
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

elements.unit.addEventListener("click", () => {
  state.unit = state.unit === "c" ? "f" : "c";
  const labels = elements.unit.querySelectorAll("span");
  labels[0].classList.toggle("active", state.unit === "c");
  labels[1].classList.toggle("active", state.unit === "f");
  if (state.forecast) {
    renderCurrent();
    renderForecast();
  }
});

function initialize() {
  populateStars();
  state.clockTimer = setInterval(renderClock, 1000);
  loadWeather(locationFromStorageOrUrl());
}

initialize();
