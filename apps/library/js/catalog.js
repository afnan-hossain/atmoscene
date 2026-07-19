(() => {
  'use strict';

  const Engine = window.WeatherIconEngine;
  const VERSION = 'global-library-2026-07';
  const REGISTRY_COUNTS = window.AtmosceneRegistry?.counts;
  const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value);
  const asset = (name) => name ? Engine.url(name) : '';
  const preloaderMarkup = (modifier = '') => `<span class="scene-preloader ${modifier}" role="status" aria-label="Preparing scene preview">
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

  const dayPhases = [
    { key: 'dawn', bn: 'ভোর', en: 'Dawn' },
    { key: 'sunrise', bn: 'সূর্যোদয়', en: 'Sunrise' },
    { key: 'morning', bn: 'সকাল', en: 'Morning' },
    { key: 'noon', bn: 'মধ্যাহ্ন', en: 'Noon' },
    { key: 'afternoon', bn: 'বিকেল', en: 'Afternoon' },
    { key: 'sunset', bn: 'সূর্যাস্ত', en: 'Sunset' },
    { key: 'dusk', bn: 'গোধূলি', en: 'Dusk' },
    { key: 'solar-eclipse', bn: 'সূর্যগ্রহণ', en: 'Solar eclipse' }
  ];

  const moonStates = [
    { key: 'new', bn: 'অমাবস্যা', en: 'New moon' },
    { key: 'waxing-crescent', bn: 'শুক্লপক্ষের সরু চাঁদ', en: 'Waxing crescent' },
    { key: 'first-quarter', bn: 'প্রথম চতুর্থাংশ', en: 'First quarter' },
    { key: 'waxing-gibbous', bn: 'বাড়ন্ত চাঁদ', en: 'Waxing gibbous' },
    { key: 'full', bn: 'পূর্ণিমা', en: 'Full moon' },
    { key: 'waning-gibbous', bn: 'ক্ষয়িষ্ণু চাঁদ', en: 'Waning gibbous' },
    { key: 'last-quarter', bn: 'শেষ চতুর্থাংশ', en: 'Last quarter' },
    { key: 'waning-crescent', bn: 'কৃষ্ণপক্ষের সরু চাঁদ', en: 'Waning crescent' },
    { key: 'pink-moon', bn: 'গোলাপি চাঁদ', en: 'Pink moon' },
    { key: 'blood-moon', bn: 'রক্তিম চাঁদ', en: 'Blood moon' },
    { key: 'lunar-eclipse', bn: 'চন্দ্রগ্রহণ', en: 'Lunar eclipse' }
  ];
  const nightTimes = [
    { key: 'evening', bn: 'সন্ধ্যা', en: 'Evening' },
    { key: 'moonrise', bn: 'চন্দ্রোদয়', en: 'Moonrise' },
    { key: 'midnight', bn: 'মধ্যরাত', en: 'Midnight' },
    { key: 'late-night', bn: 'গভীর রাত', en: 'Late night' },
    { key: 'moonset', bn: 'চন্দ্রাস্ত', en: 'Moonset' },
    { key: 'pre-dawn-night', bn: 'ভোর-পূর্ব', en: 'Pre-dawn' }
  ];
  const nightPhases = nightTimes.flatMap((time) => moonStates.map((moon) => ({
    key: time.key,
    moonKey: moon.key,
    bn: `${time.bn} · ${moon.bn}`,
    en: `${time.en} · ${moon.en}`
  })));

  const dayWeather = [
    { key: 'clear-mild', bn: 'পরিষ্কার · মৃদু', en: 'Clear mild', category: 'clear', condition: '', ownsCelestial: false, heat: 0, wind: 0 },
    { key: 'clear-warm', bn: 'প্রধানত পরিষ্কার · উষ্ণ', en: 'Mostly clear warm', category: 'clear', condition: '', ownsCelestial: false, heat: 1, wind: 0 },
    { key: 'hot', bn: 'প্রখর রোদ', en: 'Hot sun', category: 'clear', condition: '', ownsCelestial: false, heat: 2, wind: 0 },
    { key: 'extreme-heat', bn: 'তীব্র তাপপ্রবাহ', en: 'Extreme heat', category: 'clear', condition: '', ownsCelestial: false, heat: 3, wind: 0 },
    { key: 'partly-cloudy', bn: 'আংশিক মেঘলা', en: 'Partly cloudy', category: 'cloud', condition: 'cloudy', ownsCelestial: false, cloud: 1, wind: 0 },
    { key: 'overcast', bn: 'মেঘাচ্ছন্ন', en: 'Overcast', category: 'cloud', condition: 'overcast', ownsCelestial: false, cloud: 2, wind: 0 },
    { key: 'drizzle', bn: 'গুঁড়ি বৃষ্টি', en: 'Drizzle', category: 'rain', condition: 'drizzle', ownsCelestial: false, rain: 1, cloud: 1, wind: 0 },
    { key: 'rain', bn: 'বৃষ্টি', en: 'Rain', category: 'rain', condition: 'rain', ownsCelestial: false, rain: 2, cloud: 1, wind: 1 },
    { key: 'heavy-rain', bn: 'ভারী বৃষ্টি', en: 'Heavy rain', category: 'rain', condition: 'extreme-rain', ownsCelestial: false, rain: 3, cloud: 2, wind: 2 },
    { key: 'storm', bn: 'বজ্রঝড়', en: 'Thunderstorm', category: 'storm', condition: 'thunderstorms-extreme-rain', ownsCelestial: false, rain: 3, cloud: 3, wind: 4, storm: true },
    { key: 'fog', bn: 'কুয়াশা', en: 'Fog', category: 'visibility', condition: 'fog', ownsCelestial: false, visibility: 'fog', wind: 0 },
    { key: 'haze', bn: 'ধোঁয়াশা', en: 'Haze', category: 'visibility', condition: 'haze', ownsCelestial: false, visibility: 'haze', heat: 1, wind: 0 },
    { key: 'breeze', bn: 'মৃদু বাতাস', en: 'Breeze', category: 'wind', condition: '', wind: 1 },
    { key: 'windy', bn: 'প্রবাহিত বাতাস', en: 'Windy', category: 'wind', condition: '', wind: 2 },
    { key: 'gusty', bn: 'দমকা বাতাস', en: 'Gusty', category: 'wind', condition: '', wind: 3 },
    { key: 'squall', bn: 'প্রবল ঝোড়ো বাতাস', en: 'Squall', category: 'wind', condition: '', wind: 4, cloud: 2 }
  ];

  const nightWeather = [
    { key: 'clear-night', bn: 'পরিষ্কার রাত', en: 'Clear night', category: 'clear', condition: '', wind: 0 },
    { key: 'partly-cloudy-night', bn: 'আংশিক মেঘলা রাত', en: 'Partly cloudy night', category: 'cloud', condition: 'cloudy', cloud: 1, wind: 0 },
    { key: 'overcast-night', bn: 'মেঘাচ্ছন্ন রাত', en: 'Overcast night', category: 'cloud', condition: 'overcast', cloud: 2, wind: 0 },
    { key: 'drizzle-night', bn: 'রাতের গুঁড়ি বৃষ্টি', en: 'Night drizzle', category: 'rain', condition: 'drizzle', rain: 1, cloud: 1, wind: 0 },
    { key: 'rain-night', bn: 'রাতের বৃষ্টি', en: 'Night rain', category: 'rain', condition: 'rain', rain: 2, cloud: 1, wind: 1 },
    { key: 'heavy-rain-night', bn: 'রাতের ভারী বৃষ্টি', en: 'Night heavy rain', category: 'rain', condition: 'extreme-rain', rain: 3, cloud: 2, wind: 2 },
    { key: 'storm-night', bn: 'রাতের বজ্রঝড়', en: 'Night thunderstorm', category: 'storm', condition: 'thunderstorms-extreme-rain', rain: 3, cloud: 3, wind: 4, storm: true },
    { key: 'fog-night', bn: 'রাতের কুয়াশা', en: 'Night fog', category: 'visibility', condition: 'fog', visibility: 'fog', wind: 0 },
    { key: 'haze-night', bn: 'রাতের ধোঁয়াশা', en: 'Night haze', category: 'visibility', condition: 'haze', visibility: 'haze', wind: 0 },
    { key: 'breeze-night', bn: 'রাতের মৃদু বাতাস', en: 'Night breeze', category: 'wind', condition: '', wind: 1 },
    { key: 'windy-night', bn: 'রাতের প্রবাহিত বাতাস', en: 'Night windy', category: 'wind', condition: '', wind: 2 },
    { key: 'gusty-night', bn: 'রাতের দমকা বাতাস', en: 'Night gusty', category: 'wind', condition: '', wind: 3 },
    { key: 'squall-night', bn: 'রাতের প্রবল ঝোড়ো বাতাস', en: 'Night squall', category: 'wind', condition: '', wind: 4, cloud: 2 }
  ];

  const snowIceDay = [
    { key: 'flurries', bn: '', en: 'Flurries', category: 'snow', condition: 'cloudy', cloud: 1, snow: 1, wind: 1 },
    { key: 'light-snow', bn: '', en: 'Light snow', category: 'snow', condition: 'overcast', cloud: 2, snow: 1, wind: 1 },
    { key: 'moderate-snow', bn: '', en: 'Moderate snow', category: 'snow', condition: 'overcast', cloud: 2, snow: 2, wind: 1 },
    { key: 'heavy-snow', bn: '', en: 'Heavy snow', category: 'snow', condition: 'overcast', cloud: 3, snow: 3, wind: 2, drift: true },
    { key: 'blowing-snow', bn: '', en: 'Blowing snow', category: 'snow', condition: 'overcast', cloud: 2, snow: 3, wind: 3, drift: true },
    { key: 'blizzard', bn: '', en: 'Blizzard', category: 'snow', condition: 'overcast', cloud: 3, snow: 4, wind: 4, drift: true, whiteout: true },
    { key: 'freezing-fog', bn: '', en: 'Freezing fog', category: 'ice', condition: 'fog', visibility: 'fog', cloud: 1, ice: 1, wind: 0 },
    { key: 'diamond-dust', bn: '', en: 'Diamond dust', category: 'ice', condition: '', cloud: 0, ice: 2, wind: 0 }
  ];

  const snowIceNight = snowIceDay.map((weather) => ({
    ...weather,
    key: `${weather.key}-night`,
    en: `Night ${weather.en.toLowerCase()}`
  }));

  const asNightFamily = (states) => states.map((weather) => ({
    ...weather,
    key: `${weather.key}-night`,
    en: `Night ${weather.en.toLowerCase()}`
  }));

  const auroraPolarDay = [
    { key: 'polar-day-clear', en: 'Polar day', family: 'aurora-polar', category: 'aurora-polar', effect: 'polar-day', wind: 1 },
    { key: 'polar-day-clouds', en: 'Cloudy polar day', family: 'aurora-polar', category: 'aurora-polar', effect: 'polar-clouds', cloud: 1, wind: 1 },
    { key: 'nacreous-clouds', en: 'Nacreous clouds', family: 'aurora-polar', category: 'aurora-polar', effect: 'nacreous', cloud: 1, wind: 1 },
    { key: 'diamond-dust-sun', en: 'Diamond dust sunlight', family: 'aurora-polar', category: 'aurora-polar', effect: 'diamond-sun', ice: 2, wind: 0 },
    { key: 'polar-twilight', en: 'Polar twilight', family: 'aurora-polar', category: 'aurora-polar', effect: 'polar-twilight', wind: 1 }
  ];
  const auroraPolarNight = [
    { key: 'polar-night-clear', en: 'Polar night', family: 'aurora-polar', category: 'aurora-polar', effect: 'polar-night', wind: 0 },
    { key: 'aurora-faint', en: 'Faint aurora', family: 'aurora-polar', category: 'aurora-polar', effect: 'aurora-faint', aurora: 1, wind: 0 },
    { key: 'aurora-moderate', en: 'Moderate aurora', family: 'aurora-polar', category: 'aurora-polar', effect: 'aurora-moderate', aurora: 2, wind: 0 },
    { key: 'aurora-strong', en: 'Strong aurora', family: 'aurora-polar', category: 'aurora-polar', effect: 'aurora-strong', aurora: 3, wind: 1 },
    { key: 'aurora-corona', en: 'Aurora corona', family: 'aurora-polar', category: 'aurora-polar', effect: 'aurora-corona', aurora: 4, wind: 1 },
    { key: 'aurora-cloudy', en: 'Aurora behind clouds', family: 'aurora-polar', category: 'aurora-polar', effect: 'aurora-cloudy', aurora: 2, cloud: 2, wind: 1 },
    { key: 'noctilucent-clouds', en: 'Noctilucent clouds', family: 'aurora-polar', category: 'aurora-polar', effect: 'noctilucent', cloud: 1, wind: 1 }
  ];

  const tropicalMarineDay = [
    { key: 'sea-breeze', en: 'Sea breeze', family: 'tropical-marine', category: 'tropical-marine', effect: 'sea-breeze', marine: 1, wind: 1 },
    { key: 'tropical-shower', en: 'Tropical shower', family: 'tropical-marine', category: 'tropical-marine', effect: 'tropical-shower', marine: 1, rain: 2, cloud: 1, wind: 1 },
    { key: 'monsoon-rain', en: 'Monsoon rain', family: 'tropical-marine', category: 'tropical-marine', effect: 'monsoon', marine: 2, rain: 3, cloud: 3, wind: 2 },
    { key: 'tropical-thunderstorm', en: 'Tropical thunderstorm', family: 'tropical-marine', category: 'tropical-marine', effect: 'tropical-storm', marine: 2, rain: 3, cloud: 3, wind: 3, storm: true },
    { key: 'tropical-cyclone', en: 'Tropical cyclone', family: 'tropical-marine', category: 'tropical-marine', effect: 'cyclone', marine: 3, rain: 3, cloud: 3, wind: 4, storm: true },
    { key: 'waterspout', en: 'Waterspout', family: 'tropical-marine', category: 'tropical-marine', effect: 'waterspout', marine: 3, rain: 1, cloud: 2, wind: 3 },
    { key: 'marine-fog', en: 'Marine fog', family: 'tropical-marine', category: 'tropical-marine', effect: 'marine-fog', marine: 1, visibility: 'fog', cloud: 1, wind: 0 },
    { key: 'high-surf', en: 'High surf', family: 'tropical-marine', category: 'tropical-marine', effect: 'high-surf', marine: 3, cloud: 1, wind: 3 }
  ];
  const tropicalMarineNight = asNightFamily(tropicalMarineDay);

  const aerosolDay = [
    { key: 'airborne-dust', en: 'Airborne dust', family: 'aerosols', category: 'aerosols', effect: 'dust', aerosol: 1, visibility: 'dust', wind: 1 },
    { key: 'sandstorm', en: 'Sandstorm', family: 'aerosols', category: 'aerosols', effect: 'sandstorm', aerosol: 3, visibility: 'dust', cloud: 1, wind: 4 },
    { key: 'smoke', en: 'Smoke', family: 'aerosols', category: 'aerosols', effect: 'smoke', aerosol: 1, visibility: 'smoke', wind: 1 },
    { key: 'wildfire-smoke', en: 'Wildfire smoke', family: 'aerosols', category: 'aerosols', effect: 'wildfire-smoke', aerosol: 3, visibility: 'smoke', cloud: 1, heat: 1, wind: 2 },
    { key: 'volcanic-ash', en: 'Volcanic ash', family: 'aerosols', category: 'aerosols', effect: 'volcanic-ash', aerosol: 4, visibility: 'smoke', cloud: 2, wind: 2 },
    { key: 'urban-smog', en: 'Urban smog', family: 'aerosols', category: 'aerosols', effect: 'smog', aerosol: 2, visibility: 'haze', cloud: 1, wind: 0 }
  ];
  const aerosolNight = asNightFamily(aerosolDay);

  const rareCelestialDay = [
    { key: 'solar-halo', en: 'Solar halo', family: 'rare-celestial', category: 'rare-celestial', effect: 'solar-halo', celestialEvent: 'solar-halo', wind: 0 },
    { key: 'sun-dogs', en: 'Sun dogs', family: 'rare-celestial', category: 'rare-celestial', effect: 'sun-dogs', celestialEvent: 'sun-dogs', wind: 0 },
    { key: 'circumzenithal-arc', en: 'Circumzenithal arc', family: 'rare-celestial', category: 'rare-celestial', effect: 'circumzenithal-arc', celestialEvent: 'circumzenithal-arc', wind: 0 },
    { key: 'rainbow', en: 'Rainbow', family: 'rare-celestial', category: 'rare-celestial', effect: 'rainbow', celestialEvent: 'rainbow', cloud: 1, rain: 1, wind: 0 },
    { key: 'double-rainbow', en: 'Double rainbow', family: 'rare-celestial', category: 'rare-celestial', effect: 'double-rainbow', celestialEvent: 'double-rainbow', cloud: 1, rain: 1, wind: 0 }
  ];
  const rareCelestialNight = [
    { key: 'meteor-shower', en: 'Meteor shower', family: 'rare-celestial', category: 'rare-celestial', effect: 'meteor-shower', celestialEvent: 'meteor-shower', wind: 0 },
    { key: 'comet', en: 'Comet', family: 'rare-celestial', category: 'rare-celestial', effect: 'comet', celestialEvent: 'comet', wind: 0 },
    { key: 'zodiacal-light', en: 'Zodiacal light', family: 'rare-celestial', category: 'rare-celestial', effect: 'zodiacal-light', celestialEvent: 'zodiacal-light', wind: 0 },
    { key: 'lunar-halo', en: 'Lunar halo', family: 'rare-celestial', category: 'rare-celestial', effect: 'lunar-halo', celestialEvent: 'lunar-halo', wind: 0 },
    { key: 'light-pillars', en: 'Light pillars', family: 'rare-celestial', category: 'rare-celestial', effect: 'light-pillars', celestialEvent: 'light-pillars', ice: 1, wind: 0 },
    { key: 'supermoon', en: 'Supermoon', family: 'rare-celestial', category: 'rare-celestial', effect: 'supermoon', celestialEvent: 'supermoon', wind: 0 }
  ];

  const starMarkup = `
    <svg class="wx-stars" viewBox="0 0 600 400" aria-hidden="true">
      <g class="silver-stars">
        <path style="--d:-.4s;--t:5.2s" transform="translate(55 54)" d="M0-3.2 1-1 3.2 0 1 1 0 3.2-1 1-3.2 0-1-1Z"/>
        <circle style="--d:-2.1s;--t:6.4s" cx="102" cy="84" r="1.5"/>
        <path style="--d:-3.3s;--t:7.1s" transform="translate(154 42)" d="M0-2.7.8-.8 2.7 0 .8.8 0 2.7-.8.8-2.7 0-.8-.8Z"/>
        <circle style="--d:-1.5s;--t:5.8s" cx="221" cy="72" r="1.2"/>
        <path style="--d:-4.8s;--t:8.3s" transform="translate(284 38)" d="M0-3 .9-.9 3 0 .9.9 0 3-.9.9-3 0-.9-.9Z"/>
        <circle style="--d:-.7s;--t:6.8s" cx="347" cy="95" r="1.45"/>
        <path style="--d:-2.9s;--t:5.6s" transform="translate(406 50)" d="M0-2.5.75-.75 2.5 0 .75.75 0 2.5-.75.75-2.5 0-.75-.75Z"/>
        <circle style="--d:-5.1s;--t:7.6s" cx="485" cy="88" r="1.3"/>
        <path style="--d:-1.1s;--t:6.1s" transform="translate(544 43)" d="M0-3.1.9-.9 3.1 0 .9.9 0 3.1-.9.9-3.1 0-.9-.9Z"/>
        <circle style="--d:-3.8s;--t:8s" cx="72" cy="148" r="1.25"/>
        <path style="--d:-.2s;--t:5.9s" transform="translate(182 128)" d="M0-2.4.7-.7 2.4 0 .7.7 0 2.4-.7.7-2.4 0-.7-.7Z"/>
        <circle style="--d:-2.4s;--t:7.3s" cx="259" cy="154" r="1.1"/>
        <path style="--d:-4.2s;--t:6.6s" transform="translate(373 137)" d="M0-2.8.8-.8 2.8 0 .8.8 0 2.8-.8.8-2.8 0-.8-.8Z"/>
        <circle style="--d:-1.8s;--t:5.4s" cx="449" cy="157" r="1.45"/>
        <path style="--d:-3s;--t:7.8s" transform="translate(524 132)" d="M0-2.5.75-.75 2.5 0 .75.75 0 2.5-.75.75-2.5 0-.75-.75Z"/>
        <circle style="--d:-4.6s;--t:6.9s" cx="40" cy="210" r="1.05"/>
        <circle style="--d:-1.3s;--t:7.7s" cx="132" cy="224" r=".9"/>
        <path style="--d:-5.4s;--t:8.6s" transform="translate(208 203)" d="M0-2.2.65-.65 2.2 0 .65.65 0 2.2-.65.65-2.2 0-.65-.65Z"/>
        <circle style="--d:-2.7s;--t:5.7s" cx="322" cy="216" r="1.15"/>
        <circle style="--d:-.9s;--t:7.2s" cx="416" cy="205" r=".95"/>
        <path style="--d:-3.6s;--t:6.3s" transform="translate(561 219)" d="M0-2.1.62-.62 2.1 0 .62.62 0 2.1-.62.62-2.1 0-.62-.62Z"/>
        <circle style="--d:-4.1s;--t:8.2s" cx="93" cy="312" r="1.1"/>
        <path style="--d:-1.9s;--t:7.4s" transform="translate(246 292)" d="M0-2.4.7-.7 2.4 0 .7.7 0 2.4-.7.7-2.4 0-.7-.7Z"/>
        <circle style="--d:-5.8s;--t:6.6s" cx="390" cy="325" r="1.25"/>
        <circle style="--d:-2.2s;--t:8.8s" cx="535" cy="294" r=".95"/>
        <circle style="--d:-1.7s;--t:7.9s" cx="24" cy="106" r=".72"/>
        <circle style="--d:-4.7s;--t:6.7s" cx="128" cy="42" r=".7"/>
        <path style="--d:-2.8s;--t:8.4s" transform="translate(194 88)" d="M0-1.8.55-.55 1.8 0 .55.55 0 1.8-.55.55-1.8 0-.55-.55Z"/>
        <circle style="--d:-.6s;--t:6.2s" cx="316" cy="64" r=".78"/>
        <circle style="--d:-3.9s;--t:8.7s" cx="455" cy="33" r=".66"/>
        <path style="--d:-5.2s;--t:7.2s" transform="translate(574 83)" d="M0-1.7.5-.5 1.7 0 .5.5 0 1.7-.5.5-1.7 0-.5-.5Z"/>
        <circle style="--d:-2.3s;--t:6.5s" cx="17" cy="170" r=".8"/>
        <circle style="--d:-4.4s;--t:8.1s" cx="147" cy="177" r=".68"/>
        <path style="--d:-1.2s;--t:7.5s" transform="translate(299 121)" d="M0-1.9.56-.56 1.9 0 .56.56 0 1.9-.56.56-1.9 0-.56-.56Z"/>
        <circle style="--d:-3.4s;--t:6.9s" cx="490" cy="194" r=".72"/>
        <circle style="--d:-.8s;--t:8.9s" cx="585" cy="166" r=".62"/>
        <circle style="--d:-5.6s;--t:7.1s" cx="61" cy="266" r=".74"/>
        <path style="--d:-2s;--t:8.3s" transform="translate(170 264)" d="M0-1.7.5-.5 1.7 0 .5.5 0 1.7-.5.5-1.7 0-.5-.5Z"/>
        <circle style="--d:-4.9s;--t:6.4s" cx="280" cy="345" r=".7"/>
        <circle style="--d:-1.6s;--t:7.8s" cx="458" cy="273" r=".76"/>
        <path style="--d:-3.1s;--t:8.6s" transform="translate(580 350)" d="M0-1.8.55-.55 1.8 0 .55.55 0 1.8-.55.55-1.8 0-.55-.55Z"/>
      </g>
    </svg>`;

  const rainMarkup = `
    <svg class="wx-rain" viewBox="0 0 600 400" preserveAspectRatio="none" aria-hidden="true">
      <g class="rain-fine"><path d="M52-80 8 170M142-60 98 190M236-90 192 160M330-55 286 195M424-85 380 165M518-55 474 195M612-88 568 162"/></g>
      <g class="rain-medium"><path d="M24-120-34 210M108-90 50 240M194-125 136 205M280-80 222 250M366-115 308 215M452-85 394 245M538-120 480 210M624-90 566 240"/></g>
      <g class="rain-heavy"><path d="M4-160-72 270M66-125-10 305M128-175 52 255M190-130 114 300M252-165 176 265M314-120 238 310M376-170 300 260M438-125 362 305M500-165 424 265M562-120 486 310M624-170 548 260M686-125 610 305"/></g>
    </svg>`;

  const snowParticleGroup = (className, count, seed, sizeBase) => `<div class="snow-group ${className}">${Array.from({ length: count }, (_, index) => {
    const x = (index * 37 + seed * 19) % 103;
    const size = sizeBase + ((index * 13 + seed) % 7) * .55;
    const duration = 6.8 + ((index * 17 + seed) % 12) * .42;
    const delay = -((index * 23 + seed * 7) % 120) / 10;
    const jitter = ((index * 29 + seed) % 31) - 15;
    return `<i style="--x:${x}%;--flake-size:${size.toFixed(1)}px;--flake-duration:${duration.toFixed(2)}s;--flake-delay:${delay.toFixed(1)}s;--jitter:${jitter}px"></i>`;
  }).join('')}</div>`;

  const snowMarkup = `
    <div class="wx-snowfall" aria-hidden="true">
      ${snowParticleGroup('snow-flurries', 20, 3, 2.2)}
      ${snowParticleGroup('snow-steady', 30, 7, 2.8)}
      ${snowParticleGroup('snow-heavy', 42, 11, 3.2)}
    </div>
    <svg class="wx-ice-crystals" viewBox="0 0 600 400" aria-hidden="true">
      <g>
        <path style="--d:-.4s" transform="translate(72 92)" d="M0-6V6M-5-3 5 3M-5 3 5-3"/>
        <path style="--d:-2.1s" transform="translate(141 168)" d="M0-5V5M-4-2.5 4 2.5M-4 2.5 4-2.5"/>
        <path style="--d:-3.7s" transform="translate(225 68)" d="M0-7V7M-6-3.5 6 3.5M-6 3.5 6-3.5"/>
        <path style="--d:-1.2s" transform="translate(318 132)" d="M0-4.5V4.5M-4-2 4 2M-4 2 4-2"/>
        <path style="--d:-4.8s" transform="translate(398 82)" d="M0-6V6M-5-3 5 3M-5 3 5-3"/>
        <path style="--d:-2.8s" transform="translate(506 153)" d="M0-5V5M-4-2.5 4 2.5M-4 2.5 4-2.5"/>
        <path style="--d:-.9s" transform="translate(104 272)" d="M0-5V5M-4-2.5 4 2.5M-4 2.5 4-2.5"/>
        <path style="--d:-3.1s" transform="translate(274 244)" d="M0-6V6M-5-3 5 3M-5 3 5-3"/>
        <path style="--d:-5.2s" transform="translate(447 286)" d="M0-7V7M-6-3.5 6 3.5M-6 3.5 6-3.5"/>
        <path style="--d:-1.9s" transform="translate(552 232)" d="M0-4.5V4.5M-4-2 4 2M-4 2 4-2"/>
      </g>
    </svg>
    <svg class="wx-snow-ground" viewBox="0 0 600 400" preserveAspectRatio="none" aria-hidden="true">
      <path class="snow-drift-back" d="M-40 342C38 322 92 337 157 346 232 356 294 326 367 334 447 343 517 319 642 337V420H-40Z"/>
      <path class="snow-drift-front" d="M-40 374C54 347 134 383 226 366 324 348 414 385 501 360 551 346 596 350 642 364V420H-40Z"/>
    </svg>
    <div class="wx-whiteout" aria-hidden="true"></div>`;

  const windMarkup = `
    <svg class="wx-wind-flow" viewBox="0 0 600 400" aria-hidden="true">
      <g class="wind-system wind-breeze">
        <path class="wind-line" pathLength="1" d="M-80 145C55 118 164 163 294 137S505 111 680 138"/>
        <path class="wind-line wind-delay" pathLength="1" d="M-106 247C40 223 165 264 288 241S500 215 706 243"/>
      </g>
      <g class="wind-system wind-steady">
        <path class="wind-line" pathLength="1" d="M-92 108C33 72 142 138 258 103S470 70 563 107C611 126 651 125 700 98"/>
        <path class="wind-line wind-delay" pathLength="1" d="M-114 203C5 165 103 226 210 191 304 160 389 160 466 193 527 219 596 223 708 180"/>
        <path class="wind-line wind-delay-2" pathLength="1" d="M-84 302C44 271 140 317 247 294 358 270 465 260 571 293 624 310 666 307 706 291"/>
      </g>
      <g class="wind-system wind-gusty">
        <path class="wind-line gust-short" pathLength="1" d="M-44 105C31 65 91 146 164 102S289 69 353 101"/>
        <path class="wind-line gust-long wind-delay" pathLength="1" d="M108 183C211 133 296 221 398 176S570 145 680 174"/>
        <path class="wind-line gust-short wind-delay-2" pathLength="1" d="M-62 274C24 233 97 310 181 268S330 238 414 269"/>
        <path class="wind-line gust-long wind-delay-3" pathLength="1" d="M286 329C377 286 458 357 548 319S647 306 706 315"/>
      </g>
      <g class="wind-system wind-squall">
        <path class="wind-line squall-arc" pathLength="1" d="M-132 72C18 14 118 134 258 74S498 25 731 80"/>
        <path class="wind-line squall-arc wind-delay" pathLength="1" d="M-102 151C45 91 160 206 301 146S527 106 718 145"/>
        <path class="wind-line squall-arc wind-delay-2" pathLength="1" d="M-122 238C28 176 144 294 290 232S510 189 730 237"/>
        <path class="wind-line squall-arc wind-delay-3" pathLength="1" d="M-104 326C55 263 172 376 324 315S558 274 724 316"/>
        <path class="wind-cross" d="M38 21 2 124M151-7 111 132M278-12 236 139M414-18 369 142M552-8 505 147M675-21 624 141"/>
      </g>
      <g class="wind-leaves">
        <path d="M88 214c10-10 21-9 29 2-8 12-20 13-29-2Z"/><path d="M308 278c9-9 18-8 25 2-7 10-17 11-25-2Z"/><path d="M486 145c8-8 17-7 23 2-6 10-15 10-23-2Z"/>
      </g>
    </svg>`;

  const fogMarkup = `
    <svg class="wx-fog" viewBox="0 0 600 400" preserveAspectRatio="none" aria-hidden="true">
      <g class="fog-bank fog-back"><path d="M-90 206C18 170 116 190 207 214 304 240 395 243 503 204 572 179 644 183 705 205L705 258C615 236 543 241 468 265 363 298 270 291 176 264 84 238 7 235-90 270Z"/></g>
      <g class="fog-bank fog-mid"><path d="M-110 270C-8 239 86 251 175 279 274 310 365 312 462 281 548 254 632 255 715 284L715 337C627 309 553 311 473 340 369 377 265 367 173 337 79 306-10 304-110 339Z"/></g>
      <g class="fog-bank fog-front"><path d="M-100 332C6 303 96 315 184 343 279 373 374 377 469 347 553 320 637 321 710 350L710 407H-100Z"/></g>
    </svg>`;

  const hazeMarkup = `
    <div class="wx-haze-veil" aria-hidden="true"></div>
    <svg class="wx-haze-particles" viewBox="0 0 600 400" aria-hidden="true">
      <g><circle cx="92" cy="102" r="2"/><circle cx="151" cy="168" r="1.5"/><circle cx="229" cy="91" r="1.8"/><circle cx="306" cy="142" r="1.3"/><circle cx="378" cy="86" r="1.7"/><circle cx="451" cy="164" r="2"/><circle cx="520" cy="109" r="1.4"/><circle cx="116" cy="268" r="1.6"/><circle cx="258" cy="244" r="1.4"/><circle cx="405" cy="270" r="1.8"/><circle cx="507" cy="231" r="1.3"/></g>
    </svg>`;

  const heatMarkup = `
    <svg class="wx-heat" viewBox="0 0 600 400" aria-hidden="true">
      <path class="heat-1" d="M118 310C153 280 190 340 225 310S296 280 331 310"/>
      <path class="heat-2" d="M248 344C284 314 320 374 356 344S428 314 464 344"/>
      <path class="heat-3" d="M72 356C104 330 136 382 168 356"/>
    </svg>`;

  const stormMarkup = `
    <div class="wx-lightning-flash" aria-hidden="true"></div>
    <svg class="wx-lightning" viewBox="0 0 600 400" aria-hidden="true">
      <g class="bolt bolt-a"><path d="M338 150 292 231 326 224 286 320"/><path d="M309 211 273 250 250 298"/><path d="M323 226 360 270 348 323"/></g>
      <g class="bolt bolt-b"><path d="M468 127 438 191 462 185 431 258"/><path d="M447 181 414 211 401 254"/></g>
    </svg>`;

  const auroraPolarMarkup = `
    <svg class="wx-aurora-polar" viewBox="0 0 600 400" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="aurora-green" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#bbffd9" stop-opacity=".92"/><stop offset=".44" stop-color="#4ee5ba" stop-opacity=".66"/><stop offset="1" stop-color="#3c8fe8" stop-opacity="0"/></linearGradient>
        <linearGradient id="aurora-violet" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f0baff" stop-opacity=".82"/><stop offset=".5" stop-color="#8f6cff" stop-opacity=".52"/><stop offset="1" stop-color="#3478e8" stop-opacity="0"/></linearGradient>
        <linearGradient id="polar-pearl" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#9ce7ff"/><stop offset=".35" stop-color="#dfb6ff"/><stop offset=".68" stop-color="#ffe4b0"/><stop offset="1" stop-color="#8fcaff"/></linearGradient>
      </defs>
      <g class="aurora-curtains">
        <path class="aurora-ribbon aurora-ribbon-a" d="M-70 52C58 12 119 96 228 42S414 12 492 68 625 72 680 28V285C581 315 515 238 421 276S244 314 154 264 11 260-70 305Z" fill="url(#aurora-green)"/>
        <path class="aurora-ribbon aurora-ribbon-b" d="M-55 8C47 76 131 11 222 74S405 99 496 39 618 30 671 74V250C590 221 519 292 424 232S249 204 157 250 13 232-55 274Z" fill="url(#aurora-violet)"/>
        <path class="aurora-ribbon aurora-ribbon-c" d="M94-30C143 66 213 8 266 93S379 133 427 54 521 1 568 86V238C493 194 456 287 386 230S264 179 205 231 122 190 94 245Z" fill="url(#aurora-green)"/>
      </g>
      <g class="polar-clouds"><path d="M-60 255C52 212 124 265 221 236S397 221 486 253 619 260 672 229V394H-60Z"/><path d="M-40 302C64 272 145 316 236 287S405 281 505 307 625 306 674 282V410H-40Z"/></g>
      <g class="nacreous-clouds" fill="none" stroke="url(#polar-pearl)" stroke-linecap="round"><path d="M42 128C130 74 192 150 281 101S445 90 552 136"/><path d="M7 176C110 119 184 194 281 151S456 136 596 188"/><path d="M81 219C163 176 239 235 325 196S461 189 535 221"/></g>
      <g class="noctilucent-clouds" fill="none"><path d="M-20 127C95 83 160 149 263 113S451 101 620 154"/><path d="M-30 171C89 134 181 192 278 158S459 150 632 196"/></g>
      <g class="polar-sparkles"><circle cx="116" cy="91" r="2"/><circle cx="184" cy="188" r="1.5"/><circle cx="298" cy="74" r="1.8"/><circle cx="391" cy="161" r="1.4"/><circle cx="489" cy="101" r="2"/><circle cx="542" cy="223" r="1.5"/></g>
    </svg>`;

  const marineMarkup = `
    <svg class="wx-marine" viewBox="0 0 600 400" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="sea-depth" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#3cc8d4" stop-opacity=".78"/><stop offset="1" stop-color="#073c66" stop-opacity=".96"/></linearGradient></defs>
      <g class="marine-sea"><path class="sea-back" d="M-50 278C46 240 118 301 207 266S368 245 463 276 579 286 658 252V430H-50Z" fill="url(#sea-depth)"/><path class="sea-mid" d="M-60 319C35 276 114 340 207 304S379 289 471 321 586 329 663 299"/><path class="sea-front" d="M-48 356C52 316 137 374 231 342S398 331 486 358 591 365 654 343"/></g>
      <g class="marine-clouds"><path d="M89 161C103 119 145 107 179 132 201 89 270 86 298 132 335 114 379 137 381 174H90Z"/><path d="M352 116C366 85 401 78 425 98 449 69 497 76 509 111 539 104 565 124 568 151H351Z"/></g>
      <g class="marine-foam"><path d="M-22 323C54 290 116 334 185 312S313 296 376 320"/><path d="M286 353C357 319 414 364 481 341S586 335 631 349"/></g>
      <g class="cyclone-system" aria-hidden="true">
        <g class="cyclone-rainbands" fill="none">
          <path class="cyclone-band cyclone-band-a" d="M55 276C66 158 151 67 268 56C378 45 470 103 493 190"/>
          <path class="cyclone-band cyclone-band-b" d="M550 102C457 40 348 52 280 111C228 156 224 213 254 253"/>
          <path class="cyclone-band cyclone-band-c" d="M535 295C454 363 337 379 244 335C174 302 139 248 151 195"/>
          <path class="cyclone-band cyclone-band-d" d="M101 126C151 83 208 72 258 86"/>
          <path class="cyclone-feeder cyclone-feeder-a" d="M-18 336C92 274 170 270 232 304"/>
          <path class="cyclone-feeder cyclone-feeder-b" d="M404 104C474 68 541 76 613 132"/>
        </g>
        <g class="cyclone-core">
          <ellipse class="cyclone-eyewall" cx="310" cy="207" rx="91" ry="69"/>
          <path class="cyclone-inner-spiral" d="M222 219C230 155 284 120 342 132C397 143 425 189 409 232C395 270 355 288 319 277"/>
          <ellipse class="cyclone-eye" cx="319" cy="204" rx="31" ry="24"/>
          <ellipse class="cyclone-eye-glint" cx="310" cy="196" rx="10" ry="6"/>
        </g>
        <g class="cyclone-convection">
          <path d="M231 166C237 138 269 124 292 139C307 112 351 114 362 145C386 139 405 158 402 182C373 164 343 157 311 161C280 164 254 174 229 193C224 184 225 174 231 166Z"/>
          <path d="M392 178C420 188 430 222 411 244C426 266 405 298 378 291C364 312 328 311 316 286C348 282 371 267 387 244C402 222 405 200 392 178Z"/>
          <path d="M315 286C294 310 256 305 245 278C218 280 203 247 219 226C201 205 214 170 239 164C227 197 230 226 246 251C262 275 282 286 315 286Z"/>
        </g>
      </g>
      <g class="waterspout"><path class="waterspout-funnel" d="M305 88C277 140 280 185 299 228 313 260 310 294 282 329H355C327 295 328 260 342 226 359 184 358 139 334 88Z"/><path class="waterspout-ring" d="M256 330C294 311 345 311 383 333"/></g>
      <g class="sea-spray"><circle cx="78" cy="282" r="2"/><circle cx="132" cy="309" r="1.5"/><circle cx="218" cy="286" r="2.2"/><circle cx="408" cy="305" r="1.6"/><circle cx="505" cy="279" r="2"/><circle cx="557" cy="321" r="1.4"/></g>
    </svg>`;

  const aerosolMarkup = `
    <div class="wx-aerosol-veil" aria-hidden="true"></div>
    <svg class="wx-aerosols" viewBox="0 0 600 400" preserveAspectRatio="none" aria-hidden="true">
      <g class="dust-sheets"><path d="M-90 171C31 125 124 187 236 151S448 128 690 189"/><path d="M-110 244C27 198 148 263 276 224S494 213 706 261"/><path d="M-84 319C50 281 167 337 286 306S503 289 690 333"/></g>
      <g class="smoke-curls"><path class="smoke-plume smoke-plume-a" d="M42 410C35 366 57 331 101 310 133 295 140 268 117 246 83 214 94 178 130 162 166 146 177 119 158 78 205 116 217 161 188 198 166 225 172 254 202 278 239 307 230 348 190 368 158 384 144 398 141 410Z"/><path class="smoke-plume smoke-plume-b" d="M248 410C237 373 255 340 291 322 325 305 334 280 315 257 286 224 300 190 335 176 368 162 377 135 360 99 403 132 416 171 393 202 374 229 381 257 408 279 439 305 434 344 400 365 369 385 355 399 353 410Z"/><path class="smoke-plume smoke-plume-c" d="M453 410C447 381 459 355 487 339 516 322 523 300 507 281 483 251 493 222 522 209 552 195 560 173 547 143 583 171 592 204 573 231 557 253 563 277 585 297 612 321 606 354 579 373 556 390 546 401 545 410Z"/></g>
      <g class="ash-fall"><path d="m65 47 6 11-12 2Z"/><path d="m145 92 5 9-10 3Z"/><path d="m224 54 7 12-13 2Z"/><path d="m309 103 5 10-11 2Z"/><path d="m401 58 7 11-13 3Z"/><path d="m510 111 5 9-10 2Z"/><path d="m558 61 6 10-11 3Z"/></g>
      <g class="ember-traces"><path d="M105 268c14-17 19-31 13-45"/><path d="M238 306c12-18 15-31 8-43"/><path d="M445 275c15-16 21-30 16-45"/></g>
      <g class="smog-bands"><path d="M-30 265H630"/><path d="M-20 302H620"/><path d="M-15 338H615"/></g>
    </svg>`;

  const celestialEventsMarkup = `
    <svg class="wx-celestial-events" viewBox="0 0 600 400" aria-hidden="true">
      <defs><linearGradient id="rainbow-spectrum" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#ff6d78"/><stop offset=".2" stop-color="#ffc45a"/><stop offset=".4" stop-color="#f7f284"/><stop offset=".6" stop-color="#65e4b3"/><stop offset=".8" stop-color="#69b8ff"/><stop offset="1" stop-color="#b28cff"/></linearGradient><linearGradient id="zodiac-glow" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#b9d4ff" stop-opacity="0"/><stop offset=".35" stop-color="#d8c5ff" stop-opacity=".45"/><stop offset="1" stop-color="#f5e4ff" stop-opacity=".08"/></linearGradient></defs>
      <g class="solar-halo" fill="none"><circle cx="456" cy="104" r="78"/><circle cx="456" cy="104" r="92"/></g>
      <g class="sun-dogs"><circle cx="340" cy="104" r="11"/><circle cx="572" cy="104" r="11"/><path d="M316 104H364M548 104H596"/></g>
      <path class="circumzenithal-arc" d="M337 47C383 4 525 4 576 48" fill="none"/>
      <g class="rainbow-arcs" fill="none"><path class="rainbow-one" d="M44 354C83 168 226 77 383 114 486 139 548 225 566 353"/><path class="rainbow-two" d="M18 355C57 139 223 35 401 78 517 106 587 211 595 354"/></g>
      <g class="meteor-shower"><path d="M72 72 154 133"/><path d="M207 32 281 88"/><path d="M358 66 443 129"/><path d="M468 27 542 84"/><path d="M129 169 193 216"/></g>
      <g class="comet"><path d="M102 96C206 113 294 132 382 163"/><path d="M88 113C203 124 294 142 380 167"/><circle cx="397" cy="171" r="10"/></g>
      <path class="zodiacal-light" d="M190 371 297 71 394 371Z" fill="url(#zodiac-glow)"/>
      <g class="lunar-halo" fill="none"><circle cx="456" cy="104" r="76"/><circle cx="456" cy="104" r="91"/></g>
      <g class="light-pillars"><path d="M86 356V190"/><path d="M183 356V154"/><path d="M300 356V205"/><path d="M417 356V142"/><path d="M521 356V186"/></g>
    </svg>`;

  const sunGraphic = `
    <div class="wx-sun" aria-hidden="true">
      <i class="sun-halo"></i>
      <i class="sun-orbit"></i>
      <i class="sun-ray ray-1"></i><i class="sun-ray ray-2"></i><i class="sun-ray ray-3"></i><i class="sun-ray ray-4"></i>
      <i class="sun-ray ray-5"></i><i class="sun-ray ray-6"></i><i class="sun-ray ray-7"></i><i class="sun-ray ray-8"></i>
      <b class="sun-disc"></b>
      <span class="sun-glint"></span>
    </div>`;

  const moonGraphic = (phase, id) => {
    const shadows = {
      new: '<circle cx="64" cy="64" r="33"/>',
      'waxing-crescent': '<circle cx="49" cy="64" r="33"/>',
      'first-quarter': '<path d="M31 31H64V97H31Z"/>',
      'waxing-gibbous': '<circle cx="35" cy="64" r="33"/>',
      full: '',
      'waning-gibbous': '<circle cx="93" cy="64" r="33"/>',
      'last-quarter': '<path d="M64 31H97V97H64Z"/>',
      'waning-crescent': '<circle cx="79" cy="64" r="33"/>',
      'pink-moon': '',
      'blood-moon': '',
      'lunar-eclipse': '<circle cx="75" cy="60" r="29"/>'
    };
    return `<svg class="wx-moon-svg phase-${phase}" viewBox="0 0 128 128" aria-hidden="true">
      <defs>
        <clipPath id="moon-disc-${id}"><circle cx="64" cy="64" r="32"/></clipPath>
        <filter id="crater-groove-${id}" x="-35%" y="-35%" width="170%" height="170%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" result="blur"/>
          <feOffset in="blur" dx="1.1" dy="1.1" result="offsetBlur"/>
          <feComposite in="SourceGraphic" in2="offsetBlur" operator="out" result="inverse"/>
          <feFlood flood-color="#45566b" flood-opacity=".62" result="shadowColor"/>
          <feComposite in="shadowColor" in2="inverse" operator="in" result="innerShadow"/>
          <feComposite in="SourceGraphic" in2="innerShadow" operator="over"/>
        </filter>
      </defs>
      <g clip-path="url(#moon-disc-${id})">
        <circle class="moon-surface" cx="64" cy="64" r="32"/>
        <g class="moon-grooves" filter="url(#crater-groove-${id})">
          <ellipse cx="51" cy="52" rx="7" ry="5"/><ellipse cx="73" cy="73" rx="8" ry="6"/><ellipse cx="78" cy="48" rx="4.5" ry="3.5"/><ellipse cx="55" cy="79" rx="3.8" ry="3"/><ellipse cx="66" cy="59" rx="2.8" ry="2.2"/>
          <path d="M45 50c4-4 10-4 14-1M65 70c5-3 12-2 16 1M74 46c3-2 7-1 9 1M52 77c2-2 5-2 7 0"/>
        </g>
        <g class="moon-shadow">${shadows[phase] || ''}</g>
        <ellipse class="moon-sheen" cx="54" cy="46" rx="18" ry="11"/>
      </g>
      <circle class="moon-rim" cx="64" cy="64" r="31.4"/>
    </svg>`;
  };

  const eclipseConditionSlug = (weather) => {
    if (weather.category === 'clear' || weather.category === 'wind') return '';
    if (weather.key === 'partly-cloudy') return 'cloudy';
    if (weather.key === 'overcast') return 'overcast';
    if (weather.key === 'drizzle') return 'drizzle';
    if (weather.key === 'rain') return 'rain';
    if (weather.key === 'heavy-rain') return 'extreme-rain';
    if (weather.key === 'storm') return 'thunderstorms-extreme-rain';
    if (weather.key === 'fog') return 'fog';
    if (weather.key === 'haze') return 'haze';
    return '';
  };

  const resolveWindProfile = (weather) => {
    if (weather.windProfile) return weather.windProfile;
    if (weather.storm || weather.category === 'storm' || weather.effect === 'cyclone') return 'turbulent';
    if (weather.category === 'snow' || weather.category === 'ice') return 'drift';
    if (weather.category === 'rain' || weather.rain || weather.effect === 'monsoon' || weather.effect === 'tropical-shower') return 'precipitation';
    if (weather.category === 'aerosols') return 'aerosol-flow';
    if (weather.category === 'visibility') return 'laminar';
    if (weather.category === 'cloud' || weather.effect === 'nacreous' || weather.effect === 'noctilucent') return 'cloud-flow';
    if (weather.category === 'wind') {
      const force = Number(weather.wind) || 0;
      if (force <= 1) return 'breeze';
      if (force === 2) return 'open-air';
      if (force === 3) return 'gusting';
      return 'turbulent';
    }
    return 'open-air';
  };

  const sceneMarkup = (config, id) => {
    const { mode, phase, weather } = config;
    const isNight = mode === 'night';
    const moonKey = phase.moonKey || phase.key;
    const conditionSlug = isNight
      ? weather.condition
      : phase.key === 'solar-eclipse'
        ? eclipseConditionSlug(weather)
        : weather.condition;
    // Meteocons' two-cloud overcast mark can read as a cloud plus a crescent
    // when Atmoscene already owns the sun or moon. Use its celestial-neutral
    // cloud ingredient so every scene has exactly one celestial source.
    const conditionAssetSlug = conditionSlug === 'overcast' ? 'cloudy' : conditionSlug;
    const conditionImage = conditionAssetSlug && !weather.family ? `<img class="wx-condition" src="${asset(conditionAssetSlug)}" alt="" aria-hidden="true">` : '';
    const celestial = isNight
      ? `<div class="wx-moon phase-${moonKey}">${moonGraphic(moonKey, id)}</div>`
      : phase.key === 'solar-eclipse'
        ? '<div class="wx-solar-eclipse"><i></i><b></b></div>'
        : sunGraphic;
    const windProfile = resolveWindProfile(weather);
    return `<div class="wx-scene mode-${mode}" data-renderer="atmoscene-scene-v3" data-layers="sky horizon stars celestial condition aurora marine aerosol celestial-events precipitation snow ice wind visibility lightning heat" data-phase="${phase.key}" data-moon="${moonKey}" data-weather="${weather.key}" data-family="${weather.family || 'core'}" data-effect="${weather.effect || 'standard'}" data-category="${weather.category}" data-owns-celestial="false" data-celestial-source="atmoscene" data-aurora="${weather.aurora || 0}" data-marine="${weather.marine || 0}" data-aerosol="${weather.aerosol || 0}" data-celestial-event="${weather.celestialEvent || 'none'}" data-rain="${weather.rain || 0}" data-snow="${weather.snow || 0}" data-ice="${weather.ice || 0}" data-drift="${weather.drift ? 'true' : 'false'}" data-whiteout="${weather.whiteout ? 'true' : 'false'}" data-wind="${weather.wind || 0}" data-wind-profile="${windProfile}" data-wind-bearing="${weather.windBearing ?? 0}" data-cloud="${weather.cloud || 0}" data-heat="${weather.heat || 0}" data-visibility="${weather.visibility || 'clear'}" data-storm="${weather.storm ? 'true' : 'false'}" style="--scene-seed:${id % 7};--wind-tilt:${weather.windTilt || 0}deg;--wind-flip:${weather.windFlip || 1}">
      <div class="wx-sky" aria-hidden="true"></div>
      <div class="wx-horizon" aria-hidden="true"><i></i></div>
      ${starMarkup}
      <div class="wx-celestial" aria-hidden="true">${celestial}</div>
      ${conditionImage}
      ${auroraPolarMarkup}
      ${marineMarkup}
      ${aerosolMarkup}
      ${celestialEventsMarkup}
      ${heatMarkup}
      ${rainMarkup}
      ${snowMarkup}
      ${windMarkup}
      ${fogMarkup}
      ${hazeMarkup}
      ${stormMarkup}
      <div class="wx-vignette" aria-hidden="true"></div>
    </div>`;
  };

  window.AtmosceneSceneRenderer = Object.freeze({
    version: VERSION,
    sceneMarkup,
    resolveWindProfile,
    dayPhases,
    nightTimes,
    moonStates,
    dayWeather,
    nightWeather,
    snowIceDay,
    snowIceNight,
    auroraPolarDay,
    auroraPolarNight,
    tropicalMarineDay,
    tropicalMarineNight,
    aerosolDay,
    aerosolNight,
    rareCelestialDay,
    rareCelestialNight,
    dayPhase(key) {
      return dayPhases.find((phase) => phase.key === key) || dayPhases.find((phase) => phase.key === 'noon');
    },
    nightPhase(timeKey, moonKey) {
      const time = nightTimes.find((item) => item.key === timeKey) || nightTimes.find((item) => item.key === 'midnight');
      const moon = moonStates.find((item) => item.key === moonKey) || moonStates.find((item) => item.key === 'full');
      return { key: time.key, moonKey: moon.key, bn: `${time.bn} · ${moon.bn}`, en: `${time.en} · ${moon.en}` };
    },
    weather(mode, key) {
      const source = mode === 'night'
        ? [...nightWeather, ...snowIceNight, ...auroraPolarNight, ...tropicalMarineNight, ...aerosolNight, ...rareCelestialNight]
        : [...dayWeather, ...snowIceDay, ...auroraPolarDay, ...tropicalMarineDay, ...aerosolDay, ...rareCelestialDay];
      return source.find((item) => item.key === key) || source[0];
    }
  });

  if (!document.querySelector('[data-day-grid]') || !document.querySelector('[data-night-grid]')) return;

  {
    const PAGE_SIZE = 24;
    const families = Object.freeze({
      core: {
        label: 'Core weather', short: 'Core', description: 'Daylight, cloud, rain, storm, visibility, wind, snow, ice, night and lunar scenes.',
        day: [...dayWeather, ...snowIceDay], night: [...nightWeather, ...snowIceNight],
        counts: { total: 1578, day: 192, night: 1386 }
      },
      'snow-ice': {
        label: 'Snow & ice', short: 'Snow & ice', description: 'Flurries, snowfall, blowing snow, blizzards, freezing fog and diamond dust.',
        day: snowIceDay, night: snowIceNight, counts: { total: 592, day: 64, night: 528 }
      },
      'aurora-polar': {
        label: 'Aurora & polar sky', short: 'Aurora & polar', description: 'Polar day and night, aurora intensity, nacreous clouds, noctilucent clouds and diamond dust.',
        day: auroraPolarDay, night: auroraPolarNight, counts: { total: 502, day: 40, night: 462 }
      },
      'tropical-marine': {
        label: 'Tropical & marine', short: 'Tropical & marine', description: 'Sea breeze, tropical showers, monsoon rain, cyclones, waterspouts, marine fog and high surf.',
        day: tropicalMarineDay, night: tropicalMarineNight, counts: { total: 592, day: 64, night: 528 }
      },
      aerosols: {
        label: 'Dust, smoke & ash', short: 'Dust, smoke & ash', description: 'Airborne dust, sandstorm, smoke, wildfire smoke, volcanic ash and urban smog.',
        day: aerosolDay, night: aerosolNight, counts: { total: 444, day: 48, night: 396 }
      },
      'rare-celestial': {
        label: 'Rare celestial events', short: 'Rare celestial', description: 'Halos, sun dogs, atmospheric arcs, rainbows, meteor showers, comets, light pillars and supermoons.',
        day: rareCelestialDay, night: rareCelestialNight, counts: { total: 436, day: 40, night: 396 }
      }
    });
    const allowedModes = ['day', 'night'];
    const url = new URLSearchParams(location.search);
    const legacyFamily = url.get('production') === 'snow-ice' ? 'snow-ice' : '';
    let activeFamilyKey = families[url.get('family')] ? url.get('family') : legacyFamily || 'core';
    let activeMode = allowedModes.includes(url.get('mode')) ? url.get('mode') : 'day';
    let activeState = url.get('state') || 'all';
    let query = (url.get('q') || '').trim().toLowerCase();
    let page = Math.max(1, Number.parseInt(url.get('page') || '1', 10) || 1);
    let cards = [];
    let observer;
    let renderToken = 0;
    const results = document.querySelector('.catalog-results');
    const dayGrid = document.querySelector('[data-day-grid]');
    const nightGrid = document.querySelector('[data-night-grid]');
    const searchInput = document.querySelector('[data-search]');
    const format = (value) => formatNumber(value);
    const loader = () => preloaderMarkup();

    const familyNav = document.querySelector('.catalog-category-nav');
    familyNav.innerHTML = Object.entries(families).map(([key, family]) => `<a href="catalog.html?family=${key}&mode=${activeMode}" data-family-link="${key}">${family.short}</a>`).join('');

    const familyStates = () => [...new Set([...families[activeFamilyKey].day, ...families[activeFamilyKey].night].map((weather) => weather.category))];
    const stateLabel = (state) => ({ clear: 'Clear', cloud: 'Cloud', rain: 'Rain', storm: 'Storm', visibility: 'Fog & haze', wind: 'Wind', snow: 'Snow', ice: 'Ice', 'aurora-polar': 'Polar sky', 'tropical-marine': 'Marine weather', aerosols: 'Aerosols', 'rare-celestial': 'Celestial events' }[state] || state.replaceAll('-', ' '));
    const rebuildStateButtons = () => {
      const states = familyStates();
      if (activeState !== 'all' && !states.includes(activeState)) activeState = 'all';
      document.querySelector('.state-switch').innerHTML = [`<button type="button" data-state="all">All scenes</button>`, ...states.map((state) => `<button type="button" data-state="${state}">${stateLabel(state)}</button>`)].join('');
      document.querySelectorAll('.state-switch [data-state]').forEach((button) => button.addEventListener('click', () => {
        if (activeState === button.dataset.state) return;
        activeState = button.dataset.state;
        page = 1;
        renderCatalogue();
      }));
    };

    const configList = () => {
      const weather = activeMode === 'day' ? families[activeFamilyKey].day : families[activeFamilyKey].night;
      const phases = activeMode === 'day' ? dayPhases : nightPhases;
      const configs = [];
      weather.forEach((state) => phases.forEach((phase) => configs.push({ mode: activeMode, phase, weather: state })));
      return configs.filter((config) => {
        if (activeState !== 'all' && config.weather.category !== activeState) return false;
        if (!query) return true;
        return `${config.weather.en} ${config.weather.key} ${config.weather.category} ${config.phase.en} ${config.phase.key} ${activeMode}`.toLowerCase().includes(query);
      });
    };

    const hydrate = (card) => {
      if (card.dataset.loaded === 'true') return;
      card.querySelector('[data-scene-host]').innerHTML = sceneMarkup(card._weatherConfig, card._sceneId);
      card.dataset.loaded = 'true';
    };
    const observe = () => {
      observer?.disconnect();
      if (!('IntersectionObserver' in window)) { cards.forEach(hydrate); return; }
      observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) hydrate(entry.target); }), { rootMargin: '280px 0px' });
      cards.forEach((card) => observer.observe(card));
    };

    const updateRobots = (isCanonicalState) => {
      const robots = document.querySelector('meta[name="robots"]');
      if (robots) robots.content = isCanonicalState ? 'index, follow, max-image-preview:large, max-snippet:-1' : 'noindex, follow';
    };

    const updateUrl = ({ replace = false } = {}) => {
      const params = new URLSearchParams({ family: activeFamilyKey, mode: activeMode });
      if (activeState !== 'all') params.set('state', activeState);
      if (query) params.set('q', query);
      if (page > 1) params.set('page', String(page));
      const isCanonicalState = activeFamilyKey === 'core' && activeMode === 'day' && activeState === 'all' && !query && page === 1;
      history[replace ? 'replaceState' : 'pushState']({}, '', isCanonicalState ? 'catalog.html' : `catalog.html?${params}`);
      updateRobots(isCanonicalState);
    };

    const updateChrome = (totalMatches) => {
      const family = families[activeFamilyKey];
      document.title = `${family.label} Animated Weather Scenes — Atmoscene`;
      document.querySelector('.catalog-app-hero .library-kicker').innerHTML = `<span></span> ${family.label} animated SVG collection`;
      document.querySelector('.catalog-app-hero h1').innerHTML = `<span>${format(family.counts.total)}</span> ${family.label.toLowerCase()} scenes,<br><em>ready to explore.</em>`;
      document.querySelector('.catalog-app-hero > div:first-child > p:last-of-type').textContent = family.description;
      const facts = [family.counts.total, family.counts.day, family.counts.night, family.day.length + family.night.length];
      ['total', 'day', 'night', 'states'].forEach((key, index) => document.querySelectorAll(`[data-audit-${key}]`).forEach((node) => { node.textContent = format(facts[index]); }));
      familyNav.querySelectorAll('[data-family-link]').forEach((link) => link.classList.toggle('is-active', link.dataset.familyLink === activeFamilyKey));
      document.querySelectorAll('.mode-switch [data-mode]').forEach((button) => button.classList.toggle('is-active', button.dataset.mode === activeMode));
      document.querySelectorAll('.state-switch [data-state]').forEach((button) => button.classList.toggle('is-active', button.dataset.state === activeState));
      document.querySelector('[data-visible-count]').textContent = format(totalMatches);
      const activeFilter = document.querySelector('[data-active-filter]');
      if (activeFilter) activeFilter.textContent = `${family.short} collection · ${activeMode === 'day' ? 'daylight' : 'night & moon'}${activeState === 'all' ? '' : ` · ${stateLabel(activeState)}`}`;
      const heading = document.querySelector(`.${activeMode}-section .section-heading`);
      heading.innerHTML = `<p>${activeMode === 'day' ? 'DAYLIGHT' : 'NIGHT & MOON'} · ${family.label.toUpperCase()}</p><h2>${format(totalMatches)} matching scene combinations</h2><span>Showing a maximum of ${PAGE_SIZE} animated scenes per page for fast browsing.</span>`;
      document.querySelector('.day-section').hidden = activeMode !== 'day';
      document.querySelector('.night-section').hidden = activeMode !== 'night';
    };

    let pager = document.querySelector('[data-catalog-pager]');
    if (!pager) {
      pager = document.createElement('nav');
      pager.className = 'catalog-pager';
      pager.dataset.catalogPager = '';
      pager.setAttribute('aria-label', 'Catalogue pages');
      results.append(pager);
    }

    const renderCatalogue = ({ sync = true, replace = false } = {}) => {
      const token = ++renderToken;
      results.classList.add('is-filtering');
      results.setAttribute('aria-busy', 'true');
      requestAnimationFrame(() => setTimeout(() => {
        if (token !== renderToken) return;
        observer?.disconnect();
        const all = configList();
        const pages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
        page = Math.min(page, pages);
        const start = (page - 1) * PAGE_SIZE;
        const visible = all.slice(start, start + PAGE_SIZE);
        const markup = visible.length
          ? visible.map((config, index) => `<article class="variant-card" tabindex="0" data-mode="${config.mode}" data-state="${config.weather.category}" data-title="${config.weather.en} · ${config.phase.en}"><div class="variant-scene" data-scene-host>${loader(config.mode)}</div><div class="variant-copy"><small>${config.mode === 'day' ? 'Daylight' : 'Night & moon'} · ${format(start + index + 1)}</small><h3>${config.weather.en}</h3><b>${config.phase.en}</b><span class="variant-open">Open animated preview</span></div></article>`).join('')
          : `<div class="catalog-empty"><span>No matching scene</span><strong>Try a broader weather term.</strong><p>Search by condition, daylight phase or moon phase, or clear the current search to return to this collection.</p><button type="button" data-clear-catalogue>Clear search</button></div>`;
        dayGrid.innerHTML = activeMode === 'day' ? markup : '';
        nightGrid.innerHTML = activeMode === 'night' ? markup : '';
        cards = [...(activeMode === 'day' ? dayGrid : nightGrid).querySelectorAll('.variant-card')];
        cards.forEach((card, index) => { card._weatherConfig = visible[index]; card._sceneId = start + index + 1000; });
        pager.innerHTML = `<button type="button" data-page-action="previous" ${page === 1 ? 'disabled' : ''}>Previous</button><span>Page <strong>${page}</strong> of ${pages}</span><button type="button" data-page-action="next" ${page === pages ? 'disabled' : ''}>Next</button>`;
        updateChrome(all.length);
        observe();
        if (sync) updateUrl({ replace });
        results.classList.remove('is-filtering');
        results.removeAttribute('aria-busy');
        window.WEATHER_VARIATION_AUDIT = { build: VERSION, family: activeFamilyKey, total: families[activeFamilyKey].counts.total, day: families[activeFamilyKey].counts.day, night: families[activeFamilyKey].counts.night, canonicalStates: families[activeFamilyKey].day.length + families[activeFamilyKey].night.length, matching: all.length, loaded: cards.length, page, pages, pageSize: PAGE_SIZE };
      }, 90));
    };

    rebuildStateButtons();
    searchInput.value = query;
    searchInput.addEventListener('input', (event) => { query = event.target.value.trim().toLowerCase(); page = 1; renderCatalogue({ replace: true }); });
    document.querySelectorAll('.mode-switch [data-mode]').forEach((button) => button.addEventListener('click', () => { if (activeMode === button.dataset.mode) return; activeMode = button.dataset.mode; page = 1; renderCatalogue(); }));
    familyNav.addEventListener('click', (event) => {
      const link = event.target.closest('[data-family-link]');
      if (!link) return;
      event.preventDefault();
      activeFamilyKey = link.dataset.familyLink;
      activeState = 'all'; page = 1; query = ''; searchInput.value = '';
      rebuildStateButtons(); renderCatalogue();
    });
    pager.addEventListener('click', (event) => {
      const action = event.target.closest('[data-page-action]')?.dataset.pageAction;
      if (!action) return;
      page += action === 'next' ? 1 : -1;
      renderCatalogue();
      document.querySelector('.control-bar').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    results.addEventListener('click', (event) => {
      if (event.target.closest('[data-clear-catalogue]')) {
        query = ''; activeState = 'all'; page = 1; searchInput.value = '';
        renderCatalogue();
        searchInput.focus();
        return;
      }
      const card = event.target.closest('.variant-card');
      if (!card) return;
      const dialog = document.querySelector('[data-preview-dialog]');
      document.querySelector('[data-dialog-scene]').innerHTML = sceneMarkup(card._weatherConfig, 99999);
      document.querySelector('[data-dialog-mode]').textContent = `${card._weatherConfig.mode.toUpperCase()} SCENE COMBINATION`;
      document.querySelector('[data-dialog-title]').textContent = card.dataset.title;
      document.querySelector('[data-dialog-file]').textContent = `Animated SVG · ${card._weatherConfig.weather.key} · ${card._weatherConfig.phase.key}`;
      dialog.showModal();
    });
    document.querySelector('[data-dialog-close]').addEventListener('click', () => document.querySelector('[data-preview-dialog]').close());
    document.querySelector('[data-preview-dialog]').addEventListener('click', (event) => { if (event.target === event.currentTarget) event.currentTarget.close(); });
    addEventListener('popstate', () => {
      const params = new URLSearchParams(location.search);
      activeFamilyKey = families[params.get('family')] ? params.get('family') : 'core';
      activeMode = allowedModes.includes(params.get('mode')) ? params.get('mode') : 'day';
      activeState = params.get('state') || 'all';
      query = (params.get('q') || '').trim().toLowerCase();
      page = Math.max(1, Number.parseInt(params.get('page') || '1', 10) || 1);
      searchInput.value = query;
      rebuildStateButtons();
      renderCatalogue({ sync: false });
    });
    renderCatalogue({ replace: true });
    return;
  }

  let cards = [];
  const sceneLoaderMarkup = () => preloaderMarkup();
  const cardMarkup = (config, index) => {
    const { mode, phase, weather } = config;
    const search = `${weather.en} ${phase.en} ${mode} ${weather.category} ${weather.key} ${phase.key}`.toLowerCase();
    return `<article class="variant-card" tabindex="0" data-mode="${mode}" data-state="${weather.category}" data-search="${search}" data-title="${weather.en} · ${phase.en}">
      <div class="variant-scene" data-scene-host>${sceneLoaderMarkup(mode)}</div>
      <div class="variant-copy"><small>${mode === 'day' ? 'Daylight' : 'Night & moon'} · ${formatNumber(index + 1)}</small><h3>${weather.en}</h3><b>${phase.en}</b><span class="variant-open">Open animated preview</span></div>
    </article>`;
  };

  const renderMatrix = (container, mode, weatherList, phaseList) => {
    const configs = [];
    weatherList.forEach((weather) => phaseList.forEach((phase) => configs.push({ mode, phase, weather })));
    container.innerHTML = configs.map(cardMarkup).join('');
    container.querySelectorAll('.variant-card').forEach((card, index) => {
      card._weatherConfig = configs[index];
      card._sceneId = cards.length + index;
    });
    cards.push(...container.querySelectorAll('.variant-card'));
  };

  const urlState = new URLSearchParams(window.location.search);
  const productionFamily = urlState.get('production') === 'snow-ice' ? 'snow-ice' : '';
  const allowedModes = ['day', 'night'];
  const allowedStates = ['all', 'clear', 'cloud', 'rain', 'storm', 'visibility', 'wind', 'snow', 'ice'];
  const requestedMode = allowedModes.includes(urlState.get('mode')) ? urlState.get('mode') : 'day';
  const requestedState = allowedStates.includes(urlState.get('state')) ? urlState.get('state') : 'all';
  const inRequestedState = (weather) => requestedState === 'all' || weather.category === requestedState;

  const reviewDayPhases = ['dawn', 'noon', 'sunset'].map((key) => dayPhases.find((phase) => phase.key === key));
  const reviewNightPhases = [
    { ...nightPhases.find((phase) => phase.key === 'evening' && phase.moonKey === 'waxing-crescent') },
    { ...nightPhases.find((phase) => phase.key === 'midnight' && phase.moonKey === 'full') },
    { ...nightPhases.find((phase) => phase.key === 'pre-dawn-night' && phase.moonKey === 'waning-crescent') }
  ];
  const activeDayWeather = productionFamily ? snowIceDay : [...dayWeather, ...snowIceDay];
  const activeNightWeather = productionFamily ? snowIceNight : [...nightWeather, ...snowIceNight];
  const activeDayPhases = productionFamily ? reviewDayPhases : dayPhases;
  const activeNightPhases = productionFamily ? reviewNightPhases : nightPhases;

  if (productionFamily === 'snow-ice') {
    document.title = 'Snow & Ice Animated Weather Scenes — Atmoscene Production Preview';
    document.querySelector('.catalog-app-hero .library-kicker').innerHTML = '<span></span> GLOBAL PRODUCTION BATCH 01 · SNOW & ICE';
    document.querySelector('.catalog-app-hero h1').innerHTML = 'Snow & ice<br><em>production preview.</em>';
    document.querySelector('.catalog-app-hero > div:first-child > p:last-of-type').textContent = 'Review original Atmoscene snowfall, wind-responsive drift, foreground accumulation, ice-crystal shimmer and full-scene whiteout layers before this global family is approved for release.';
    const labels = document.querySelectorAll('.catalog-facts span');
    if (labels[0]) labels[0].textContent = 'Potential combinations';
    if (labels[1]) labels[1].textContent = 'Day combinations';
    if (labels[2]) labels[2].textContent = 'Night combinations';
    if (labels[3]) labels[3].textContent = 'Canonical states';
    document.querySelector('.catalog-category-nav').innerHTML = '<a href="catalog.html?production=snow-ice&mode=day">Day snow & ice</a><a href="catalog.html?production=snow-ice&mode=night">Night snow & ice</a><a href="catalog.html?production=snow-ice&mode=day&state=snow">Snow only</a><a href="catalog.html?production=snow-ice&mode=day&state=ice">Ice atmosphere</a><a href="index.html">Approved library</a>';
    document.querySelector('.state-switch').innerHTML = '<button class="is-active" type="button" data-state="all">All states</button><button type="button" data-state="snow">Snow</button><button type="button" data-state="ice">Ice</button>';
    document.querySelector('[data-search]').placeholder = 'Try blizzard, diamond dust or freezing fog';
    document.querySelector('.day-section .section-heading').innerHTML = '<p>DAY SNOW & ICE REVIEW</p><h2>8 states × 3 representative daylight phases</h2><span>The compositor supports the full eight-phase daylight system; this route keeps review focused and fast.</span>';
    document.querySelector('.night-section .section-heading').innerHTML = '<p>NIGHT SNOW & ICE REVIEW</p><h2>8 states × 3 representative lunar scenes</h2><span>The same states compose with all 66 night and moon combinations after approval.</span>';
  }

  renderMatrix(document.querySelector('[data-day-grid]'), 'day', requestedMode === 'day' ? activeDayWeather.filter(inRequestedState) : [], activeDayPhases);
  renderMatrix(document.querySelector('[data-night-grid]'), 'night', requestedMode === 'night' ? activeNightWeather.filter(inRequestedState) : [], activeNightPhases);

  const auditValues = productionFamily ? {
    total: snowIceDay.length * dayPhases.length + snowIceNight.length * nightPhases.length,
    day: snowIceDay.length * dayPhases.length,
    night: snowIceNight.length * nightPhases.length,
    wind: snowIceDay.length + snowIceNight.length
  } : {
    total: REGISTRY_COUNTS?.total ?? (dayWeather.length + snowIceDay.length) * dayPhases.length + (nightWeather.length + snowIceNight.length) * nightPhases.length,
    day: REGISTRY_COUNTS?.day ?? (dayWeather.length + snowIceDay.length) * dayPhases.length,
    night: REGISTRY_COUNTS?.night ?? (nightWeather.length + snowIceNight.length) * nightPhases.length,
    wind: REGISTRY_COUNTS?.wind ?? 4 * (dayPhases.length + nightPhases.length)
  };
  Object.entries(auditValues).forEach(([key, value]) => {
    document.querySelectorAll(`[data-audit-${key}]`).forEach((node) => { node.textContent = formatNumber(value); });
  });

  const loadCard = (card) => {
    if (card.dataset.loaded === 'true') return;
    card.querySelector('[data-scene-host]').innerHTML = sceneMarkup(card._weatherConfig, card._sceneId);
    card.dataset.loaded = 'true';
  };
  const unloadCard = (card) => {
    if (card.matches(':hover,:focus-within')) return;
    card.querySelector('[data-scene-host]').innerHTML = sceneLoaderMarkup(card.dataset.mode);
    card.dataset.loaded = 'false';
  };

  let sceneObserver = null;
  const observeCards = () => {
    sceneObserver?.disconnect();
    if ('IntersectionObserver' in window) {
      sceneObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) loadCard(entry.target);
        else window.setTimeout(() => { if (entry.target.isConnected) unloadCard(entry.target); }, 900);
      }), { rootMargin: '460px 0px' });
      cards.forEach((card) => sceneObserver.observe(card));
    } else {
      cards.forEach(loadCard);
    }
  };
  observeCards();

  let activeMode = requestedMode;
  let activeState = requestedState;
  let query = (urlState.get('q') || '').trim().toLowerCase();
  const updateFilters = () => {
    let visible = 0;
    cards.forEach((card) => {
      const show = (activeMode === 'all' || card.dataset.mode === activeMode)
        && (activeState === 'all' || card.dataset.state === activeState)
        && (!query || card.dataset.search.includes(query));
      card.hidden = !show;
      if (show) visible += 1;
    });
    document.querySelector('[data-visible-count]').textContent = formatNumber(visible);
    document.querySelectorAll('[data-section-mode]').forEach((section) => {
      section.hidden = activeMode !== 'all' && section.dataset.sectionMode !== activeMode;
    });
  };

  const results = document.querySelector('.catalog-results');
  const partialLoader = document.createElement('div');
  partialLoader.className = 'catalog-partial-loader';
  partialLoader.setAttribute('aria-hidden', 'true');
  results.append(partialLoader);
  let renderToken = 0;

  const updateControlState = () => {
    document.querySelectorAll('.mode-switch button[data-mode]').forEach((button) => button.classList.toggle('is-active', button.dataset.mode === activeMode));
    document.querySelectorAll('.state-switch button[data-state]').forEach((button) => button.classList.toggle('is-active', button.dataset.state === activeState));
  };

  const syncCatalogueUrl = ({ replace = false } = {}) => {
    const params = new URLSearchParams();
    params.set('mode', activeMode);
    if (activeState !== 'all') params.set('state', activeState);
    if (query) params.set('q', query);
    if (productionFamily) params.set('production', productionFamily);
    window.history[replace ? 'replaceState' : 'pushState']({}, '', `catalog.html?${params.toString()}`);
  };

  const renderActiveSubset = ({ syncUrl = true, replace = false } = {}) => {
    const token = ++renderToken;
    results.classList.add('is-filtering');
    results.setAttribute('aria-busy', 'true');
    partialLoader.innerHTML = sceneLoaderMarkup(activeMode);
    updateControlState();
    window.requestAnimationFrame(() => window.setTimeout(() => {
      if (token !== renderToken) return;
      sceneObserver?.disconnect();
      cards = [];
      const matchesState = (weather) => activeState === 'all' || weather.category === activeState;
      renderMatrix(document.querySelector('[data-day-grid]'), 'day', activeMode === 'day' ? activeDayWeather.filter(matchesState) : [], activeDayPhases);
      renderMatrix(document.querySelector('[data-night-grid]'), 'night', activeMode === 'night' ? activeNightWeather.filter(matchesState) : [], activeNightPhases);
      observeCards();
      updateFilters();
      if (syncUrl) syncCatalogueUrl({ replace });
      results.classList.remove('is-filtering');
      results.removeAttribute('aria-busy');
    }, 80));
  };

  document.querySelectorAll('.mode-switch button[data-mode]').forEach((button) => button.addEventListener('click', () => {
    if (button.dataset.mode === activeMode) return;
    activeMode = button.dataset.mode;
    renderActiveSubset();
  }));
  document.querySelectorAll('.state-switch button[data-state]').forEach((button) => button.addEventListener('click', () => {
    if (button.dataset.state === activeState) return;
    activeState = button.dataset.state;
    renderActiveSubset();
  }));
  document.querySelector('[data-search]').addEventListener('input', (event) => {
    query = event.target.value.trim().toLowerCase();
    updateFilters();
    syncCatalogueUrl({ replace: true });
  });
  updateControlState();
  document.querySelector('[data-search]').value = query;
  updateFilters();

  document.querySelector('.catalog-category-nav')?.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;
    const target = new URL(link.href, window.location.href);
    if (!target.pathname.endsWith('/library/catalog.html') || target.searchParams.get('production') !== (productionFamily || null)) return;
    event.preventDefault();
    activeMode = allowedModes.includes(target.searchParams.get('mode')) ? target.searchParams.get('mode') : activeMode;
    activeState = allowedStates.includes(target.searchParams.get('state')) ? target.searchParams.get('state') : 'all';
    renderActiveSubset();
  });

  window.addEventListener('popstate', () => {
    const params = new URLSearchParams(window.location.search);
    activeMode = allowedModes.includes(params.get('mode')) ? params.get('mode') : 'day';
    activeState = allowedStates.includes(params.get('state')) ? params.get('state') : 'all';
    query = (params.get('q') || '').trim().toLowerCase();
    document.querySelector('[data-search]').value = query;
    renderActiveSubset({ syncUrl: false });
  });

  const dialog = document.querySelector('[data-preview-dialog]');
  const openDialog = (card) => {
    const config = card._weatherConfig;
    document.querySelector('[data-dialog-scene]').innerHTML = sceneMarkup(config, 999);
    document.querySelector('[data-dialog-mode]').textContent = config.mode === 'day' ? 'DAY SCENE COMBINATION' : 'NIGHT SCENE COMBINATION';
    document.querySelector('[data-dialog-title]').textContent = card.dataset.title;
    document.querySelector('[data-dialog-file]').textContent = `Flat animated SVG · ${config.weather.key} · ${config.phase.key} · wind ${config.weather.wind || 0}`;
    dialog.showModal();
  };
  results.addEventListener('click', (event) => {
    const card = event.target.closest('.variant-card');
    if (card) openDialog(card);
  });
  results.addEventListener('keydown', (event) => {
    const card = event.target.closest('.variant-card');
    if (card && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      openDialog(card);
    }
  });
  document.querySelector('[data-dialog-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });

  window.WEATHER_VARIATION_AUDIT = {
    build: VERSION,
    productionFamily: productionFamily || null,
    productionCanonicalStates: snowIceDay.length + snowIceNight.length,
    productionPotentialCombinations: snowIceDay.length * dayPhases.length + snowIceNight.length * nightPhases.length,
    productionReviewCards: productionFamily ? cards.length : 0,
    total: auditValues.total,
    loaded: cards.length,
    day: auditValues.day,
    night: auditValues.night,
    wind: auditValues.wind,
    dayWeather: dayWeather.length,
    nightWeather: nightWeather.length,
    solarPhases: dayPhases.length,
    moonPhases: moonStates.length,
    nightPeriods: nightTimes.length,
    solarEclipseDuplicateSun: (() => {
      const probe = document.createElement('template');
      probe.innerHTML = sceneMarkup({
        mode: 'day',
        phase: dayPhases.find((phase) => phase.key === 'solar-eclipse'),
        weather: dayWeather.find((weather) => weather.key === 'clear-mild')
      }, 10001);
      return probe.content.querySelectorAll('.wx-solar-eclipse').length === 1
        && probe.content.querySelectorAll('.wx-condition').length === 0;
    })(),
    windSceneUsesWindsock: dayWeather.filter((weather) => weather.category === 'wind').some((weather) => Boolean(weather.condition)),
    vendor: 'Meteocons Flat animated SVG (MIT)'
  };
  document.documentElement.dataset.solarEclipseAudit = window.WEATHER_VARIATION_AUDIT.solarEclipseDuplicateSun ? 'pass' : 'fail';
  document.documentElement.dataset.windSceneAudit = window.WEATHER_VARIATION_AUDIT.windSceneUsesWindsock ? 'fail' : 'pass';
  console.assert(window.WEATHER_VARIATION_AUDIT.solarEclipseDuplicateSun, 'Solar eclipse must render one custom eclipse and no provider sun.');
  console.assert(!window.WEATHER_VARIATION_AUDIT.windSceneUsesWindsock, 'Windsock belongs in the weather data card, not the hero scene.');
})();
