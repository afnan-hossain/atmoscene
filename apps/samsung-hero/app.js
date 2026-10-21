'use strict';
/* Samsung Weather hero simulator — layer stack rebuilt from the decompiled APK.
   Scene data: data/scenes.json (parsed from assets/agsl_shader_android.json in the APK)
   Land layers: assets/layers/* (original WebP/PNG resources)
   Characters: assets/characters/* (original packed-alpha MP4s, decoded in WebGL) */

const SUNS = ['DAY', 'NIGHT', 'SUNRISE', 'SUNSET', 'WHITE_NIGHT', 'POLAR_NIGHT'];
const SUN_LABEL = { DAY: 'Day', NIGHT: 'Night', SUNRISE: 'Sunrise', SUNSET: 'Sunset', WHITE_NIGHT: 'White night', POLAR_NIGHT: 'Polar night' };
const TIERS = ['LOWEST', 'LOW', 'HIGH'];
const TIER_LABEL = { LOWEST: 'Lowest (weak GPU)', LOW: 'Low', HIGH: 'High' };
const WIND_LABEL = ['Calm', 'Calm+', 'Light', 'Moderate', 'Strong'];
const $ = id => document.getElementById(id);
const els = {};
['code','sun','tier','temp','sunalt','speed','cloud','stars','wind','rain','snow','bolt','sand','fog','forcefx',
 't-sky','t-sun','t-cloud','t-far','t-char','t-near','t-precip','charsize','charx','charrate','farop','nearop',
 'swipe','scroll','zoom','explode'].forEach(id => els[id] = $(id));

let DB = null, resolved = null, resolvedKey = '', currentChar = '', charLoopStart = 0;
const video = $('charVideo');

/* ---------- deterministic particle fields ---------- */
function mulberry(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rnd = mulberry(1337);
const stars = Array.from({ length: 140 }, () => ({ x: rnd(), y: rnd() * 0.55, r: rnd() * 1.4 + 0.3, tw: rnd() * 6.28 }));
const drops = Array.from({ length: 240 }, () => ({ x: rnd(), y: rnd(), l: 0.012 + rnd() * 0.02, s: 0.55 + rnd() * 0.7 }));
const flakes = Array.from({ length: 200 }, () => ({ x: rnd(), y: rnd(), r: 1 + rnd() * 2.4, s: 0.08 + rnd() * 0.22, ph: rnd() * 6.28 }));
const clouds = Array.from({ length: 26 }, () => ({ x: rnd(), y: rnd() * 0.34, s: 0.5 + rnd() * 1.3, v: 0.004 + rnd() * 0.010 }));
const sandGrains = Array.from({ length: 220 }, () => ({ x: rnd(), y: rnd(), s: 0.25 + rnd() * 0.8, l: 0.01 + rnd() * 0.03 }));

/* ---------- scene resolution (mirrors od.b in the APK) ---------- */
function sceneKey(code, sun, tier) { return `${code}_${sun}_${tier}`; }
function resolveScene(code, sun, tier) {
  const tries = [sceneKey(code, sun, tier)];
  for (const s of ['DAY', 'NIGHT', 'SUNRISE', 'SUNSET']) tries.push(sceneKey(code, s, tier));
  for (const t of ['HIGH', 'LOW', 'LOWEST']) for (const s of [sun, 'DAY', 'NIGHT']) tries.push(sceneKey(code, s, t));
  for (const k of tries) if (DB.scenes[k]) return [k, DB.scenes[k]];
  return ['', null];
}
function pickVariant(entry, temp) {
  if (!entry) return null;
  const name = temp > 27 ? (entry.over27 || entry.average || entry.resource)
    : temp < 0 ? (entry.below0 || entry.average || entry.resource)
    : (entry.average || entry.resource);
  return name || null;
}
function layerUrl(name) {
  if (!name) return '';
  const ext = DB.layerFiles[name] || 'webp';
  return `assets/layers/${name}.${ext}`;
}
function familyLabel(scene) {
  const far = scene?.resources?.FARLAND?.average || scene?.resources?.FARLAND?.resource || '';
  const m = far.match(/agsl_\d+_([a-z_]+?)_\d/);
  const fam = m ? m[1].replace(/_/g, ' ') : 'scene';
  return fam.charAt(0).toUpperCase() + fam.slice(1);
}
function conditionLabel(scene) {
  const L = scene?.layers || {};
  if (L.THUNDER_CANVAS) return 'Thunderstorm';
  if (L.SNOW_CANVAS && L.RAIN_CANVAS) return 'Rain & snow';
  if (L.SNOW_CANVAS) return 'Snow';
  if (L.RAIN_CANVAS) return 'Rain';
  if (L.FOG_CANVAS) return 'Foggy';
  const fam = familyLabel(scene).toLowerCase();
  if (fam.includes('sand')) return 'Sandstorm';
  if (fam.includes('wind')) return 'Windy';
  if (fam.includes('cloud')) return 'Cloudy';
  return fam.includes('clear') ? 'Clear' : familyLabel(scene);
}
function hasLayer(name) { return !!resolved?.layers?.[name]; }
function eff(name, sliderVal) { // effect intensity honoring scene table unless forced
  const on = hasLayer(name) || els.forcefx.value === '1';
  return els['t-precip'].value === '1' && on ? sliderVal / 100 : 0;
}

/* ---------- character WebGL (Samsung TransparentVideoView shader, ported) ---------- */
const gl = $('charCanvas').getContext('webgl', { alpha: true, premultipliedAlpha: false });
let glProg, glTex, glReady = false;
function initGL() {
  const vs = `attribute vec2 aPos; varying vec2 vUv;
    void main(){ vUv = vec2(aPos.x*0.5+0.5, 0.5-aPos.y*0.5); gl_Position = vec4(aPos,0.,1.); }`;
  const fs = `precision highp float; varying vec2 vUv; uniform sampler2D uVideo; uniform float uEdge;
    vec4 texImg(vec2 p){ return texture2D(uVideo, p); }
    float lum(vec3 c){ return length(c)/1.7320508; }
    float alphaAt(vec2 xy){
      float ax = xy.x; float ay = 1.0 - xy.y;              // assembled-mask coords (y down)
      float qx = ax < 0.5 ? 0.0 : 1.0; float qy = ay < 0.5 ? 0.0 : 1.0;
      float block = qy < 0.5 ? (qx < 0.5 ? 1.0 : 3.0) : (qx < 0.5 ? 0.0 : 2.0); // TL,TR,BL,BR
      float lx = fract(ax*2.0); float ly = fract(ay*2.0);
      vec2 sp = vec2((block+lx)*0.25, 0.8 + (1.0-ly)*0.2);
      return lum(texImg(sp).rgb);
    }
    void main(){
      vec3 col = texImg(vec2(vUv.x, vUv.y*0.8)).rgb;      // RGB occupies top 80% of frame
      float a = alphaAt(vUv);
      a = clamp(a*(1.0+uEdge), 0.0, 1.0);
      gl_FragColor = vec4(col, a);
    }`;
  function sh(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
  glProg = gl.createProgram();
  gl.attachShader(glProg, sh(gl.VERTEX_SHADER, vs));
  gl.attachShader(glProg, sh(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(glProg); gl.useProgram(glProg);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(glProg, 'aPos');
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  glTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, glTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.uniform1i(gl.getUniformLocation(glProg, 'uVideo'), 0);
  glReady = true;
}
function drawChar() {
  if (!glReady) return;
  gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
  if (els['t-char'].value !== '1' || !currentChar || video.readyState < 2) return;
  gl.bindTexture(gl.TEXTURE_2D, glTex);
  try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video); } catch (e) { return; }
  gl.uniform1f(gl.getUniformLocation(glProg, 'uEdge'), 0.25);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
video.addEventListener('timeupdate', () => {
  if (charLoopStart > 0 && video.duration && video.currentTime > video.duration - 0.06) {
    video.currentTime = charLoopStart; video.play().catch(() => {});
  }
});

/* ---------- 2D shader-layer canvases ---------- */
const skyCtx = $('skyCanvas').getContext('2d'), sunCtx = $('sunCanvas').getContext('2d'),
  cloudCtx = $('cloudCanvas').getContext('2d'), precipCtx = $('precipCanvas').getContext('2d'),
  fogCtx = $('fogCanvas').getContext('2d'), sandCtx = $('sandCanvas').getContext('2d');
let W = 0, H = 0, iTime = 0, lastTs = 0, bolt = null, nextBolt = 2;

function rgb(arr, a = 1) { if (!arr) return `rgba(120,160,220,${a})`; return `rgba(${Math.round(arr[0]*255)},${Math.round(arr[1]*255)},${Math.round(arr[2]*255)},${a})`; }
function resize() {
  const stage = $('stage'), tierScale = [0.35, 0.6, 1][+els.tier.value];
  W = stage.clientWidth; H = stage.clientHeight;
  for (const c of [skyCtx, sunCtx, cloudCtx, precipCtx, fogCtx, sandCtx]) {
    c.canvas.width = Math.max(2, W * tierScale); c.canvas.height = Math.max(2, H * tierScale);
  }
  positionChar();
}
function positionChar() {
  const stage = $('stage'), size = stage.clientWidth * (+els.charsize.value) / 100;
  const wrap = $('charWrap');
  wrap.style.width = size + 'px'; wrap.style.height = size + 'px';
  wrap.style.left = (+els.charx.value) + '%';
  wrap.style.bottom = '23.5%';
}

function drawSky() {
  const { width: w, height: h } = skyCtx.canvas;
  skyCtx.clearRect(0, 0, w, h);
  if (els['t-sky'].value !== '1') return;
  const uni = resolved?.layers?.BACKGROUND_CANVAS?.uniforms || {};
  const g = skyCtx.createLinearGradient(0, 0, 0, h);
  const cols = [uni.skyColor1, uni.skyColor2, uni.skyColor3, uni.skyColor4, uni.skyColor5];
  const pos = [0, uni.skyColorGradientPos1 ?? 0.3, uni.skyColorGradientPos2 ?? 0.45, uni.skyColorGradientPos3 ?? 0.65, 1];
  cols.forEach((c, i) => { if (c) g.addColorStop(Math.min(1, Math.max(0, pos[i])), rgb(c)); });
  skyCtx.fillStyle = g; skyCtx.fillRect(0, 0, w, h);
}
function drawSunStars() {
  const { width: w, height: h } = sunCtx.canvas;
  sunCtx.clearRect(0, 0, w, h);
  if (els['t-sun'].value !== '1') return;
  const sun = SUNS[+els.sun.value], alt = +els.sunalt.value / 100;
  const isNight = sun === 'NIGHT' || sun === 'POLAR_NIGHT';
  if ((isNight || sun === 'SUNSET' || sun === 'SUNRISE') && hasLayer('SUN_AND_STAR_CANVAS') || els.forcefx.value === '1') {
    sunCtx.fillStyle = '#fff';
    for (const s of stars) {
      const a = (isNight ? 0.9 : 0.25) * (+els.stars.value / 100) * (0.6 + 0.4 * Math.sin(iTime * 2 + s.tw));
      if (a <= 0.02) continue;
      sunCtx.globalAlpha = a; sunCtx.beginPath(); sunCtx.arc(s.x * w, s.y * h, s.r, 0, 6.29); sunCtx.fill();
    }
    sunCtx.globalAlpha = 1;
  }
  const x = w * (0.14 + 0.72 * alt), y = h * (0.60 - Math.sin(alt * Math.PI) * 0.46);
  if (isNight) { // moon
    sunCtx.fillStyle = '#eef3ff'; sunCtx.beginPath(); sunCtx.arc(x, y, w * 0.045, 0, 6.29); sunCtx.fill();
    sunCtx.fillStyle = 'rgba(20,30,60,0.85)'; sunCtx.beginPath(); sunCtx.arc(x + w * 0.018, y - w * 0.012, w * 0.04, 0, 6.29); sunCtx.fill();
  } else {
    const halo = sunCtx.createRadialGradient(x, y, 0, x, y, w * 0.30);
    halo.addColorStop(0, 'rgba(255,244,200,0.95)'); halo.addColorStop(0.12, 'rgba(255,230,160,0.55)'); halo.addColorStop(1, 'rgba(255,230,160,0)');
    sunCtx.fillStyle = halo; sunCtx.fillRect(x - w * 0.3, y - w * 0.3, w * 0.6, w * 0.6);
    sunCtx.fillStyle = '#fff6d8'; sunCtx.beginPath(); sunCtx.arc(x, y, w * 0.038, 0, 6.29); sunCtx.fill();
  }
}
function drawClouds(dt) {
  const { width: w, height: h } = cloudCtx.canvas;
  cloudCtx.clearRect(0, 0, w, h);
  const amount = els['t-cloud'].value === '1' && (hasLayer('CLOUD_CANVAS') || els.forcefx.value === '1') ? +els.cloud.value / 100 : 0;
  if (amount <= 0) return;
  const night = ['NIGHT', 'POLAR_NIGHT'].includes(SUNS[+els.sun.value]);
  const n = Math.floor(clouds.length * amount * (0.3 + amount));
  for (let i = 0; i < n; i++) {
    const c = clouds[i];
    c.x += (c.v * (0.4 + +els.wind.value * 0.55) * +els.speed.value * dt * 8);
    if (c.x > 1.25) c.x = -0.25;
    const cx = c.x * w, cy = c.y * h, s = c.s * w * 0.16;
    cloudCtx.fillStyle = night ? 'rgba(52,64,92,0.50)' : 'rgba(255,255,255,0.55)';
    for (const [ox, oy, os] of [[0, 0, 1], [-0.5, 0.12, 0.7], [0.5, 0.12, 0.75], [0.1, -0.16, 0.65]]) {
      cloudCtx.beginPath(); cloudCtx.ellipse(cx + ox * s, cy + oy * s, s * os, s * os * 0.42, 0, 0, 6.29); cloudCtx.fill();
    }
  }
}
function drawPrecip(dt) {
  const { width: w, height: h } = precipCtx.canvas;
  precipCtx.clearRect(0, 0, w, h);
  const rainI = eff('RAIN_CANVAS', +els.rain.value), snowI = eff('SNOW_CANVAS', +els.snow.value);
  const wind = +els.wind.value;
  if (rainI > 0) {
    precipCtx.strokeStyle = 'rgba(210,230,255,0.55)'; precipCtx.lineWidth = Math.max(1, w / 430); precipCtx.beginPath();
    const n = Math.floor(drops.length * rainI);
    for (let i = 0; i < n; i++) {
      const d = drops[i]; d.y += d.s * dt * (0.7 + rainI); d.x += wind * 0.012 * dt;
      if (d.y > 1) { d.y = -0.03; d.x = Math.random(); }
      const x = d.x * w, y = d.y * h;
      precipCtx.moveTo(x, y); precipCtx.lineTo(x - wind * w * 0.006, y + d.l * h);
    }
    precipCtx.stroke();
  }
  if (snowI > 0) {
    precipCtx.fillStyle = 'rgba(255,255,255,0.9)';
    const n = Math.floor(flakes.length * snowI);
    for (let i = 0; i < n; i++) {
      const f = flakes[i]; f.y += f.s * dt * (0.6 + snowI); f.x += Math.sin(iTime + f.ph) * 0.0006 + wind * 0.004 * dt;
      if (f.y > 1) { f.y = -0.02; f.x = Math.random(); }
      precipCtx.beginPath(); precipCtx.arc(f.x * w, f.y * h, f.r * (w / 430), 0, 6.29); precipCtx.fill();
    }
  }
  if (bolt && bolt.ttl > 0) { // lightning bolt drawn on precip canvas, flash on #thunderFlash
    precipCtx.strokeStyle = 'rgba(240,246,255,0.95)'; precipCtx.lineWidth = 2.4; precipCtx.beginPath();
    bolt.pts.forEach(([x, y], i) => i ? precipCtx.lineTo(x * w, y * h) : precipCtx.moveTo(x * w, y * h));
    precipCtx.stroke(); bolt.ttl -= dt;
  }
}
function drawFogSand(dt) {
  const { width: w, height: h } = fogCtx.canvas;
  fogCtx.clearRect(0, 0, w, h); sandCtx.clearRect(0, 0, w, h);
  const fogI = eff('FOG_CANVAS', +els.fog.value);
  if (fogI > 0) {
    for (let i = 0; i < 5; i++) {
      const y = h * (0.45 + i * 0.11) + Math.sin(iTime * 0.4 + i * 1.7) * h * 0.008;
      const g = fogCtx.createLinearGradient(0, y - h * 0.05, 0, y + h * 0.05);
      g.addColorStop(0, 'rgba(225,235,245,0)'); g.addColorStop(0.5, `rgba(225,235,245,${0.20 * fogI})`); g.addColorStop(1, 'rgba(225,235,245,0)');
      fogCtx.fillStyle = g; fogCtx.fillRect(0, y - h * 0.05, w, h * 0.1);
    }
  }
  const fam = familyLabel(resolved).toLowerCase();
  const sandI = els['t-precip'].value === '1' && (fam.includes('sand') || els.forcefx.value === '1') ? +els.sand.value / 100 : 0;
  if (sandI > 0) {
    sandCtx.strokeStyle = `rgba(226,178,110,${0.5 * sandI})`; sandCtx.beginPath();
    const n = Math.floor(sandGrains.length * sandI);
    for (let i = 0; i < n; i++) {
      const g = sandGrains[i]; g.x += g.s * dt * (1 + +els.wind.value); g.y += Math.sin(iTime * 3 + i) * 0.0004;
      if (g.x > 1) { g.x = -0.02; g.y = Math.random(); }
      sandCtx.moveTo(g.x * w, g.y * h); sandCtx.lineTo(g.x * w + g.l * w, g.y * h);
    }
    sandCtx.stroke();
    sandCtx.fillStyle = `rgba(214,164,96,${0.10 * sandI})`; sandCtx.fillRect(0, 0, w, h);
  }
}
function maybeLightning(dt) {
  const on = hasLayer('THUNDER_CANVAS') || els.forcefx.value === '1';
  const freq = els['t-precip'].value === '1' && on ? +els.bolt.value / 100 : 0;
  nextBolt -= dt;
  if (freq > 0 && nextBolt <= 0) {
    const x = 0.15 + Math.random() * 0.7; let pts = [[x, 0.02]]; let cx = x;
    for (let y = 0.12; y < 0.55; y += 0.09) { cx += (Math.random() - 0.5) * 0.07; pts.push([cx, y]); }
    bolt = { pts, ttl: 0.16 };
    $('thunderFlash').style.opacity = 0.28 * freq + 0.08;
    nextBolt = 0.6 + (1 - freq) * 5 + Math.random() * 2;
    setTimeout(() => $('thunderFlash').style.opacity = 0, 90);
  }
}

/* ---------- apply scene + UI ---------- */
function fmtTemp(t) { return Math.round(t); }
function applyScene() {
  const code = +els.code.value, sun = SUNS[+els.sun.value], tier = TIERS[+els.tier.value], temp = +els.temp.value;
  [resolvedKey, resolved] = resolveScene(code, sun, tier);
  const fam = familyLabel(resolved);
  $('sceneKey').textContent = resolvedKey || '—';
  const bg = resolved?.layers?.BACKGROUND_CANVAS;
  $('bgClass').textContent = bg ? `${bg.class} / ${bg.codeId}` : 'fallback gradient';

  const res = resolved?.resources || {};
  const far = pickVariant(res.FARLAND, temp), near = pickVariant(res.NEARLAND, temp), grad = pickVariant(res.NEARLAND_GRADATION, temp);
  const charEntry = res.HUMAN || res.HURRICANE;
  const char = pickVariant(charEntry, temp);
  charLoopStart = charEntry?.loopStartTime ? (charEntry.loopStartTime / 30) : 0;

  const farEl = $('farLand'), nearEl = $('nearLand'), gradEl = $('gradation');
  farEl.src = els['t-far'].value === '1' && far ? layerUrl(far) : '';
  nearEl.src = els['t-near'].value === '1' && near ? layerUrl(near) : '';
  gradEl.src = els['t-near'].value === '1' && grad ? layerUrl(grad) : '';
  farEl.style.opacity = +els.farop.value / 100; nearEl.style.opacity = +els.nearop.value / 100;

  $('charName').textContent = char || 'none in this scene';
  if (char && char !== currentChar) {
    currentChar = char;
    video.src = `assets/characters/${char}.mp4`;
    video.playbackRate = +els.charrate.value;
    video.play().catch(() => {});
  } else if (!char) { currentChar = ''; video.removeAttribute('src'); video.load(); }
  video.playbackRate = +els.charrate.value;

  // enable/disable effect sliders by scene table (faithful mode)
  const force = els.forcefx.value === '1';
  els.rain.disabled = !(hasLayer('RAIN_CANVAS') || force);
  els.snow.disabled = !(hasLayer('SNOW_CANVAS') || force);
  els.bolt.disabled = !(hasLayer('THUNDER_CANVAS') || force);
  els.fog.disabled = !(hasLayer('FOG_CANVAS') || force);
  els.sand.disabled = !(fam.toLowerCase().includes('sand') || force);
  els.cloud.disabled = !(hasLayer('CLOUD_CANVAS') || force);

  // hero UI overlay
  $('uiTemp').textContent = fmtTemp(temp);
  $('uiCond').textContent = conditionLabel(resolved);
  $('uiHigh').textContent = fmtTemp(temp + 1); $('uiLow').textContent = fmtTemp(temp - 16);
  $('uiFeels').textContent = fmtTemp(temp + 1);
  const hours = [['4 PM', 0], ['5 PM', 0], ['6 PM', -1], ['6:52 PM', null], ['7 PM', -4], ['8 PM', -7]];
  $('uiHourly').innerHTML = hours.map(([t, o]) => o === null
    ? `<div>🌇<div class="h-temp">Sunset</div></div>`
    : `<div>${t}<div class="h-temp">${fmtTemp(temp + o)}°</div><div>💧0%</div></div>`).join('');
  $('layerBadge').innerHTML = `☁ ${hasLayer('CLOUD_CANVAS') ? 'cloud ' : ''}${hasLayer('RAIN_CANVAS') ? '🌧 rain ' : ''}${hasLayer('SNOW_CANVAS') ? '❄ snow ' : ''}${hasLayer('THUNDER_CANVAS') ? '⚡ thunder ' : ''}${hasLayer('FOG_CANVAS') ? '🌫 fog ' : ''}${hasLayer('SUN_AND_STAR_CANVAS') ? '✦ sun/star' : ''}` || 'shader sky only';

  $('sceneInfo').textContent =
`sceneKey        : ${resolvedKey}
weatherCode     : ${code}  (${conditionLabel(resolved)})
sunStatus       : ${sun}   deviceTier: ${tier}   temp: ${temp}°C  wind: ${WIND_LABEL[+els.wind.value]}
BACKGROUND      : ${bg ? bg.class + ' → ' + bg.codeId + '  uniforms: ' + Object.keys(bg.uniforms).slice(0, 8).join(', ') + '…' : '—'}
layers          : ${Object.entries(resolved?.layers || {}).map(([k, v]) => `${k}=${v.class}`).join('\n                  ')}
FARLAND         : ${far || '—'}
HUMAN/HURRICANE : ${char || '— (no character in this scene, as in the original)'}${char ? `  loopStart=${charLoopStart.toFixed(2)}s` : ''}
NEARLAND        : ${near || '—'}
GRADATION       : ${grad || '—'}
files           : assets/layers/${far}.webp · assets/characters/${char}.mp4`;
  drawSky();
}
function updateLabels() {
  $('v-code').textContent = els.code.value;
  $('v-sun').textContent = SUN_LABEL[SUNS[+els.sun.value]];
  $('v-tier').textContent = TIER_LABEL[TIERS[+els.tier.value]];
  $('v-temp').textContent = `${els.temp.value}°C → ${+els.temp.value > 27 ? 'over27 outfit' : +els.temp.value < 0 ? 'below0 outfit' : 'average outfit'}`;
  $('v-sunalt').textContent = els.sunalt.value + '%';
  $('v-speed').textContent = (+els.speed.value).toFixed(2) + '×';
  $('v-cloud').textContent = els.cloud.value + '%'; $('v-stars').textContent = els.stars.value + '%';
  $('v-wind').textContent = WIND_LABEL[+els.wind.value];
  $('v-rain').textContent = els.rain.value + '%'; $('v-snow').textContent = els.snow.value + '%';
  $('v-bolt').textContent = els.bolt.value + '%'; $('v-sand').textContent = els.sand.value + '%'; $('v-fog').textContent = els.fog.value + '%';
  $('v-forcefx').textContent = els.forcefx.value === '1' ? 'ON' : 'off';
  for (const t of ['sky', 'sun', 'cloud', 'far', 'char', 'near', 'precip']) $('v-t-' + t).textContent = els['t-' + t].value === '1' ? 'on' : 'off';
  $('v-charsize').textContent = els.charsize.value + '%'; $('v-charx').textContent = els.charx.value + '%';
  $('v-charrate').textContent = (+els.charrate.value).toFixed(2) + '×';
  $('v-farop').textContent = els.farop.value + '%'; $('v-nearop').textContent = els.nearop.value + '%';
  $('v-swipe').textContent = els.swipe.value; $('v-scroll').textContent = els.scroll.value + '%';
  $('v-zoom').textContent = els.zoom.value + '%'; $('v-explode').textContent = els.explode.value === '1' ? 'ON' : 'off';
}
function applyTransforms() {
  const swipe = +els.swipe.value, scroll = +els.scroll.value / 100, zoom = +els.zoom.value / 100;
  const far = $('farLand'), near = $('nearLand'), grad = $('gradation'), wrap = $('charWrap');
  far.style.transform = `translateX(${-swipe * 0.35}px) scale(${zoom})`;
  near.style.transform = `translateX(${-swipe * 0.7}px) translateY(${-scroll * 26}px) scale(${zoom})`;
  grad.style.transform = `translateX(${-swipe * 0.5}px) scale(${zoom})`;
  wrap.style.transform = `translateX(${-swipe * 0.5}px) translateY(${-scroll * 44}px)`;
  wrap.style.opacity = Math.max(0, 1 - scroll * 1.15);
  near.style.opacity = (+els.nearop.value / 100) * Math.max(0.15, 1 - scroll * 0.7);
  document.querySelector('.hero-ui').style.opacity = Math.max(0, 1 - scroll * 1.5);
  document.querySelector('.hourly').style.transform = `translateY(${scroll * 30}px)`;
  $('stage').classList.toggle('exploded', els.explode.value === '1');
}

/* ---------- main loop ---------- */
function loop(ts) {
  const dt = Math.min(0.05, (ts - lastTs) / 1000 || 0.016); lastTs = ts;
  iTime += dt * +els.speed.value;
  drawSunStars(); drawClouds(dt); drawPrecip(dt); drawFogSand(dt); maybeLightning(dt); drawChar();
  requestAnimationFrame(loop);
}

/* ---------- wiring ---------- */
const defaults = {};
Object.values(els).forEach(e => defaults[e.id] = e.value);
function refresh() { updateLabels(); applyScene(); positionChar(); applyTransforms(); }
Object.values(els).forEach(e => e.addEventListener('input', () => {
  if (['code', 'sun', 'tier'].includes(e.id)) resize();
  refresh();
}));
$('btnPlay').addEventListener('click', () => {
  if (video.paused) { video.play().catch(() => {}); $('btnPlay').textContent = '⏸ Pause character'; }
  else { video.pause(); $('btnPlay').textContent = '▶ Play character'; }
});
$('btnRandom').addEventListener('click', () => {
  els.code.value = Math.floor(Math.random() * 30) - 1;
  els.sun.value = Math.floor(Math.random() * 4);
  els.temp.value = Math.floor(Math.random() * 45) - 8;
  resize(); refresh();
});
$('btnReset').addEventListener('click', () => { Object.values(els).forEach(e => e.value = defaults[e.id]); resize(); refresh(); });
new ResizeObserver(() => { resize(); drawSky(); }).observe($('stage'));

fetch('data/scenes.json').then(r => r.json()).then(data => {
  DB = data; initGL(); resize(); refresh();
  requestAnimationFrame(loop);
}).catch(err => { $('sceneInfo').textContent = 'Failed to load data/scenes.json — serve this folder over HTTP (see instructions). ' + err; });
