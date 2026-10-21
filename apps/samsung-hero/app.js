'use strict';
/* Samsung Weather hero simulator — now running Samsung's own AGSL shaders.
   Scene data: data/scenes.json (parsed from assets/agsl_shader_android.json,
   including the original assets/resource/code_N.json SkSL programs).
   Land layers: assets/layers/* (original WebP/PNG resources)
   Characters: assets/characters/* (original packed-alpha MP4s, decoded in WebGL)
   Geometry: detail_hq_bg_layout.xml dimens on a 360x340dp hero canvas. */

const SUNS = ['DAY', 'NIGHT', 'SUNRISE', 'SUNSET', 'WHITE_NIGHT', 'POLAR_NIGHT'];
const SUN_LABEL = { DAY: 'Day', NIGHT: 'Night', SUNRISE: 'Sunrise', SUNSET: 'Sunset', WHITE_NIGHT: 'White night', POLAR_NIGHT: 'Polar night' };
const TIERS = ['LOWEST', 'LOW', 'HIGH'];
const TIER_LABEL = { LOWEST: 'Lowest (weak GPU)', LOW: 'Low', HIGH: 'High' };
const WIND_LABEL = ['Calm', 'Calm+', 'Light', 'Moderate', 'Strong'];
const BACK_SLOTS = ['BACKGROUND_CANVAS', 'SUN_AND_STAR_CANVAS', 'CLOUD_CANVAS', 'THUNDER_CANVAS'];
const FRONT_SLOTS = ['RAIN_CANVAS', 'SNOW_CANVAS', 'FOG_CANVAS'];
const $ = id => document.getElementById(id);
const els = {};
['code','sun','tier','temp','time','tspeed','sunalt','speed','cloud','stars','wind','rain','snow','bolt','sand','fog','forcefx',
 't-sky','t-sun','t-cloud','t-far','t-char','t-near','t-precip','charsize','charx','charrate','farop','nearop',
 'swipe','scroll','zoom','explode'].forEach(id => els[id] = $(id));

let DB = null, resolved = null, resolvedKey = '', currentChar = '', charLoopStart = 0;
let iTime = 0, lastTs = 0, nextFlash = 2;
const video = $('charVideo');
const shaderErrors = [];

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
function donorLayer(slot) { // for Force-effects: borrow Samsung's own class from another scene
  for (const s of Object.values(DB?.scenes || {})) if (s.layers?.[slot]) return s.layers[slot];
  return null;
}
function layerFor(slot) {
  if (resolved?.layers?.[slot]) return resolved.layers[slot];
  return els.forcefx.value === '1' ? donorLayer(slot) : null;
}

/* ---------- SkSL (AGSL) -> WebGL GLSL conversion ---------- */
function skslToGlsl(src) {
  let s = src
    .replace(/\bfloat2x2\b/g, 'mat2').replace(/\bfloat3x3\b/g, 'mat3').replace(/\bfloat4x4\b/g, 'mat4')
    .replace(/\bfloat2\b/g, 'vec2').replace(/\bfloat3\b/g, 'vec3').replace(/\bfloat4\b/g, 'vec4')
    .replace(/\bhalf2\b/g, 'vec2').replace(/\bhalf3\b/g, 'vec3').replace(/\bhalf4\b/g, 'vec4').replace(/\bhalf\b/g, 'float')
    .replace(/(\bvec4\s+)main\s*\(/g, '$1skMain(');
  // AGSL fragCoord is top-left origin; gl_FragCoord is bottom-left, and layers
  // may render in a viewport sub-rect, so convert via the full canvas height.
  return `precision highp float;\nuniform float uCanvasH;\n${s}\nvoid main(){ gl_FragColor = skMain(vec2(gl_FragCoord.x, uCanvasH - gl_FragCoord.y)); }\n`;
}
const VS = `attribute vec2 aPos; void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;

class ShaderStack {
  constructor(canvas) {
    this.gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
    this.programs = new Map();
    const gl = this.gl;
    if (!gl) return;
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    this.buf = buf;
    gl.enable(gl.BLEND);
    // Samsung's AGSL shaders return premultiplied colors ("AGSL 합성 규칙" in code_1),
    // so composite exactly like the Android canvas: src + dst * (1 - srcAlpha).
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  }
  program(codeId) {
    if (this.programs.has(codeId)) return this.programs.get(codeId);
    const gl = this.gl, src = DB.shaderCodes?.[codeId];
    let entry = null;
    if (src) {
      const compile = (type, code) => {
        const sh = gl.createShader(type); gl.shaderSource(sh, code); gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
          const log = gl.getShaderInfoLog(sh);
          if (!shaderErrors.find(e => e.codeId === codeId)) shaderErrors.push({ codeId, log });
          return null;
        }
        return sh;
      };
      const vs = compile(gl.VERTEX_SHADER, VS);
      const fs = compile(gl.FRAGMENT_SHADER, skslToGlsl(src));
      if (vs && fs) {
        const prog = gl.createProgram();
        gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
        if (gl.getProgramParameter(prog, gl.LINK_STATUS)) {
          const uniforms = [];
          const n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
          for (let i = 0; i < n; i++) {
            const info = gl.getActiveUniform(prog, i);
            uniforms.push({ name: info.name.replace(/\[0\]$/, ''), type: info.type, size: info.size, loc: gl.getUniformLocation(prog, info.name) });
          }
          entry = { prog, uniforms };
        }
      }
    }
    this.programs.set(codeId, entry);
    return entry;
  }
  drawLayer(layer, overrides) {
    const gl = this.gl; if (!gl || !layer) return;
    const entry = this.program(layer.codeId); if (!entry) return;
    gl.useProgram(entry.prog);
    const loc = gl.getAttribLocation(entry.prog, 'aPos');
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const values = { ...(layer.uniforms || {}), ...overrides };
    values.iTime = iTime;
    values.uCanvasH = gl.canvas.height;
    values.iResolution = [gl.canvas.width, this.layerH || gl.canvas.height];
    for (const u of entry.uniforms) {
      let v = values[u.name];
      if (v === undefined) v = (u.name === 'iStartAnimationProgress' || u.name === 'iSlowdownAnimationProgress') ? 0.5 : 0;
      const F = gl.FLOAT, I = gl.INT;
      try {
        if (u.type === F) gl.uniform1f(u.loc, +v);
        else if (u.type === gl.FLOAT_VEC2) gl.uniform2f(u.loc, v[0] || 0, v[1] || 0);
        else if (u.type === gl.FLOAT_VEC3) gl.uniform3f(u.loc, v[0] || 0, v[1] || 0, v[2] || 0);
        else if (u.type === gl.FLOAT_VEC4) gl.uniform4f(u.loc, v[0] || 0, v[1] || 0, v[2] || 0, v[3] || 0);
        else if (u.type === I || u.type === gl.BOOL) gl.uniform1i(u.loc, Math.round(+v));
        else if (u.type === gl.INT_VEC2) gl.uniform2i(u.loc, v[0] || 0, v[1] || 0);
        else if (u.type === gl.INT_VEC3) gl.uniform3i(u.loc, v[0] || 0, v[1] || 0, v[2] || 0);
      } catch (e) { /* mismatched uniform shape: leave default */ }
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  draw(slots, overridesBySlot, enabled, heightFracBySlot = {}) {
    const gl = this.gl; if (!gl) return;
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    for (const slot of slots) {
      if (!enabled[slot]) continue;
      const layer = layerFor(slot);
      if (!layer) continue;
      // Samsung runs sky-effect shaders in a 340dp-tall view at the top of the
      // full-screen hero; emulate with a per-layer viewport (iResolution then
      // matches that view, exactly like AGSLShaderView).
      const frac = heightFracBySlot[slot] ?? 1;
      const W = gl.canvas.width, H = gl.canvas.height, lh = Math.round(H * frac);
      gl.viewport(0, H - lh, W, lh);
      this.layerH = lh;
      this.drawLayer(layer, overridesBySlot[slot] || {});
    }
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  }
}
const backStack = new ShaderStack($('glBack'));
const frontStack = new ShaderStack($('glFront'));

function lerp(a, b, t) { return a + (b - a) * t; }
function uniformOverrides() {
  const wind = +els.wind.value, sunU = resolved?.layers?.SUN_AND_STAR_CANVAS?.uniforms || {};
  const sunOv = {};
  // positionT = mix(fromAnimationProgress, toAnimationProgress, iStartAnimationProgress)
  // in Samsung's shader; pinning from=to drives the sun/moon along its parabolic
  // minPosition->maxPosition path without collapsing the direction vector.
  sunOv.fromAnimationProgress = +els.sunalt.value / 100;
  sunOv.toAnimationProgress = +els.sunalt.value / 100;
  if (sunU.uStarsDensity !== undefined) sunOv.uStarsDensity = sunU.uStarsDensity * (+els.stars.value) / 70;
  const cloudBase = resolved?.layers?.CLOUD_CANVAS?.uniforms || {};
  return {
    SUN_AND_STAR_CANVAS: sunOv,
    CLOUD_CANVAS: {
      ...(cloudBase.cloudCover !== undefined ? { cloudCover: +els.cloud.value / 100 } : {}),
      ...(cloudBase.cloudSpeed !== undefined ? { cloudSpeed: cloudBase.cloudSpeed * (0.4 + wind * 0.45) } : {}),
    },
    RAIN_CANVAS: { rainIntensityScale: null },
    SNOW_CANVAS: {}, FOG_CANVAS: {}, THUNDER_CANVAS: {}, BACKGROUND_CANVAS: {},
    _rain: { rainIntensityMul: +els.rain.value / 70, windStrength: (wind - 1) * 0.7 },
    _snow: { snowIntensityMul: +els.snow.value / 70, snowWindStrength: (wind - 1) * 0.35 },
    _fog: { fogMixAlpha: +els.fog.value / 100 },
  };
}
function scaledOverrides(slot, base) {
  const ov = uniformOverrides();
  if (slot === 'RAIN_CANVAS') {
    const b = base || {};
    return { ...(b.rainIntensity !== undefined ? { rainIntensity: b.rainIntensity * ov._rain.rainIntensityMul } : {}), windStrength: ov._rain.windStrength };
  }
  if (slot === 'SNOW_CANVAS') {
    const b = base || {};
    return { ...(b.snowIntensity !== undefined ? { snowIntensity: b.snowIntensity * ov._snow.snowIntensityMul } : {}), snowWindStrength: ov._snow.snowWindStrength };
  }
  if (slot === 'FOG_CANVAS') return { fogMixAlpha: ov._fog.fogMixAlpha };
  return ov[slot] || {};
}

/* ---------- character WebGL (Samsung TransparentVideoView shader, ported) ---------- */
const glc = $('charCanvas').getContext('webgl', { alpha: true, premultipliedAlpha: true });
let charProg, charTex, charReady = false;
function initCharGL() {
  const vs = `attribute vec2 aPos; varying vec2 vUv;
    void main(){ vUv = vec2(aPos.x*0.5+0.5, 0.5-aPos.y*0.5); gl_Position = vec4(aPos,0.,1.); }`;
  const fs = `precision highp float; varying vec2 vUv; uniform sampler2D uVideo; uniform float uEdge;
    vec4 texImg(vec2 p){ return texture2D(uVideo, p); }
    float lum(vec3 c){ return length(c)/1.7320508; }
    float alphaAt(vec2 xy){
      float ax = xy.x; float ay = 1.0 - xy.y;
      float qx = ax < 0.5 ? 0.0 : 1.0; float qy = ay < 0.5 ? 0.0 : 1.0;
      float block = qy < 0.5 ? (qx < 0.5 ? 1.0 : 3.0) : (qx < 0.5 ? 0.0 : 2.0);
      float lx = fract(ax*2.0); float ly = fract(ay*2.0);
      vec2 sp = vec2((block+lx)*0.25, 0.8 + (1.0-ly)*0.2);
      return lum(texImg(sp).rgb);
    }
    void main(){
      vec3 col = texImg(vec2(vUv.x, vUv.y*0.8)).rgb;
      float raw = alphaAt(vUv);
      // Feather the mask edge (the packed mask is binary-ish; a hard clamp
      // fringes against the scene). Premultiplied output blends smoothly.
      float a = clamp(smoothstep(0.05, 0.55, raw) * (0.35 + 0.65 * raw) * (1.0+uEdge), 0.0, 1.0);
      gl_FragColor = vec4(col * a, a);
    }`;
  function sh(type, src) { const s = glc.createShader(type); glc.shaderSource(s, src); glc.compileShader(s); return s; }
  charProg = glc.createProgram();
  glc.attachShader(charProg, sh(glc.VERTEX_SHADER, vs));
  glc.attachShader(charProg, sh(glc.FRAGMENT_SHADER, fs));
  glc.linkProgram(charProg); glc.useProgram(charProg);
  const buf = glc.createBuffer();
  glc.bindBuffer(glc.ARRAY_BUFFER, buf);
  glc.bufferData(glc.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), glc.STATIC_DRAW);
  const loc = glc.getAttribLocation(charProg, 'aPos');
  glc.enableVertexAttribArray(loc); glc.vertexAttribPointer(loc, 2, glc.FLOAT, false, 0, 0);
  charTex = glc.createTexture();
  glc.bindTexture(glc.TEXTURE_2D, charTex);
  glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_WRAP_S, glc.CLAMP_TO_EDGE);
  glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_WRAP_T, glc.CLAMP_TO_EDGE);
  glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_MIN_FILTER, glc.LINEAR);
  glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_MAG_FILTER, glc.LINEAR);
  glc.uniform1i(glc.getUniformLocation(charProg, 'uVideo'), 0);
  charReady = true;
}
let charTextureLive = false, lastUploadedFrame = -1, loopSeeking = false;
function drawChar() {
  if (!charReady) return;
  glc.clearColor(0, 0, 0, 0); glc.clear(glc.COLOR_BUFFER_BIT);
  if (els['t-char'].value !== '1' || !currentChar) return;
  glc.bindTexture(glc.TEXTURE_2D, charTex);
  // Upload only fresh, fully-decoded frames; between frames (and during the
  // loop seek) keep drawing the last good texture instead of blanking out.
  if (video.readyState >= 2 && video.videoWidth > 0 && video.currentTime !== lastUploadedFrame) {
    try {
      glc.texImage2D(glc.TEXTURE_2D, 0, glc.RGBA, glc.RGBA, glc.UNSIGNED_BYTE, video);
      lastUploadedFrame = video.currentTime; charTextureLive = true;
    } catch (e) { /* keep previous texture */ }
  }
  if (!charTextureLive) return;
  glc.uniform1f(glc.getUniformLocation(charProg, 'uEdge'), 0.08);
  glc.drawArrays(glc.TRIANGLE_STRIP, 0, 4);
}
function seekToLoopPoint() {
  if (!video.duration || loopSeeking) return;
  loopSeeking = true;
  try { video.currentTime = charLoopStart; } catch (e) { loopSeeking = false; }
  video.play().catch(() => {});
}
video.addEventListener('seeked', () => { loopSeeking = false; });
video.addEventListener('timeupdate', () => {
  // Seek a little before the true end so the loop segment (Samsung encodes
  // loopStartTime for exactly this) wraps without an end-of-stream stall.
  if (charLoopStart > 0 && video.duration && video.currentTime > video.duration - 0.22) seekToLoopPoint();
});
video.addEventListener('ended', seekToLoopPoint);

/* ---------- sizing / layout ---------- */
function resize() {
  const stage = $('stage'), scale = [0.5, 0.75, 1][+els.tier.value];
  for (const stack of [backStack, frontStack]) {
    if (!stack.gl) continue;
    stack.gl.canvas.width = Math.max(2, Math.round(stage.clientWidth * scale));
    stack.gl.canvas.height = Math.max(2, Math.round(stage.clientHeight * scale));
    stack.gl.viewport(0, 0, stack.gl.canvas.width, stack.gl.canvas.height);
  }
  positionChar();
}
function positionChar() {
  const stage = $('stage'), size = stage.clientHeight * (+els.charsize.value) / 100;
  const wrap = $('charWrap');
  wrap.style.width = size + 'px'; wrap.style.height = size + 'px';
  wrap.style.left = (+els.charx.value) + '%';
  // Feet planted on the near-land strip (its top edge sits at 58% of the
  // landscape stage); the character stands behind the foreground grass.
  wrap.style.top = (stage.clientHeight * 0.76 - size) + 'px';
  wrap.style.bottom = 'auto';
}

/* ---------- apply scene + UI ---------- */
function fmtTemp(t) { return Math.round(t); }
/* ---- time-of-day model ---- */
const SUNRISE = 6.6, SUNSET = 18.87; // 6:52 PM sunset, as on the phone
function sunStatusForHour(h) {
  if (h >= SUNRISE - 1 && h < SUNRISE + 0.6) return 'SUNRISE';
  if (h >= SUNRISE + 0.6 && h < SUNSET - 0.7) return 'DAY';
  if (h >= SUNSET - 0.7 && h < SUNSET + 0.9) return 'SUNSET';
  return 'NIGHT';
}
function sunProgressForHour(h, status) {
  if (status === 'DAY' || status === 'SUNRISE' || status === 'SUNSET') return Math.min(1, Math.max(0, (h - SUNRISE) / (SUNSET - SUNRISE)));
  const nightLen = 24 - (SUNSET - SUNRISE);
  const since = h >= SUNSET ? h - SUNSET : h + (24 - SUNSET);
  return Math.min(1, Math.max(0, since / nightLen));
}
function effectiveTemp() { // diurnal curve around the temperature slider (±3.5°C, peak 15:00); live mode uses the real reading
  if (WX) return Math.round(+els.temp.value);
  const h = +els.time.value;
  return Math.round(+els.temp.value + 3.5 * Math.sin((h - 9) / 24 * Math.PI * 2));
}
function fmtHour(h) {
  h = ((h % 24) + 24) % 24;
  const hh = Math.floor(h), mm = Math.round((h - hh) * 60) % 60;
  const ap = hh >= 12 ? 'PM' : 'AM', h12 = hh % 12 === 0 ? 12 : hh % 12;
  return { label: `${h12} ${ap}`, full: `${h12}:${String(mm).padStart(2, '0')} ${ap}` };
}
/* Samsung's own weather_ic_* icons (vector drawables from the APK, converted
   to SVG in assets/icons/). No emoji weather icons anywhere. */
function iconImg(name, cls = '') {
  return `<img class="wx-icon ${cls}" src="assets/icons/${name}.svg" alt="${name.replace(/_/g, ' ')}" loading="lazy">`;
}
function condIcon(cond, isNight) {
  const c = cond.toLowerCase();
  if (c.includes('thunder')) return 'thunderstorm';
  if (c.includes('snow') && c.includes('rain')) return 'rain_and_snow';
  if (c.includes('snow')) return 'snow';
  if (c.includes('rain')) return 'rain';
  if (c.includes('fog')) return 'fog';
  if (c.includes('sand')) return 'sand_storm';
  if (c.includes('cloud')) return isNight ? 'mostly_cloudy_night' : 'partly_cloud';
  if (c.includes('wind')) return 'wind';
  return isNight ? 'clear' : 'sunny';
}

/* ---------- live weather (Open-Meteo, free / no key — same as Atmoscene) ---------- */
let WX = null; // parsed real forecast for the chosen location
let LOC = { name: 'Gainesville', admin: 'Florida', lat: 29.6516, lon: -82.3248 };
function wmoToScene(wmo, isDay) {
  if (wmo === 0) return 0;                                  // clear / sunny
  if (wmo === 1) return 1;                                  // mainly clear
  if (wmo === 2) return 1;                                  // partly cloudy
  if (wmo === 3) return 2;                                  // overcast
  if (wmo === 45 || wmo === 48) return 3;                   // fog
  if ([51, 53, 55, 80].includes(wmo)) return 4;             // drizzle / showers
  if ([61, 81].includes(wmo)) return 5;
  if ([63].includes(wmo)) return 21;
  if ([65, 82].includes(wmo)) return 6;                    // heavy rain
  if ([56, 57, 66, 67].includes(wmo)) return 15;           // freezing / rain+snow mix
  if (wmo === 71) return 10;
  if (wmo === 73) return 11;
  if ([75, 86].includes(wmo)) return 13;
  if ([77, 85].includes(wmo)) return 10;
  if (wmo === 95) return 9;                                // thunderstorm
  if ([96, 99].includes(wmo)) return 20;                   // thunder + hail/rain
  return 2;
}
function wmoToIcon(wmo, isDay) {
  if (wmo === 0) return isDay ? 'sunny' : 'clear';
  if (wmo === 1) return isDay ? 'mostly_sunny' : 'mostly_clear';
  if (wmo === 2) return isDay ? 'partly_cloud' : 'partly_cloud_night';
  if (wmo === 3) return 'cloudy';
  if (wmo === 45 || wmo === 48) return 'fog';
  if ([51, 53, 55, 80].includes(wmo)) return 'shower';
  if ([61, 81].includes(wmo)) return 'rain';
  if (wmo === 63) return 'rain';
  if ([65, 82].includes(wmo)) return 'heavy_rain';
  if ([56, 57, 66, 67].includes(wmo)) return 'rain_and_sleet';
  if (wmo === 71) return 'light_snow';
  if (wmo === 73) return 'snow';
  if ([75, 86].includes(wmo)) return 'heavy_snow';
  if ([77, 85].includes(wmo)) return 'light_snow';
  if (wmo === 95) return 'thunderstorm';
  if ([96, 99].includes(wmo)) return 'rain_and_thunder';
  return 'cloudy';
}
function wmoLabel(wmo) {
  return ({ 0: 'Clear', 1: 'Mostly sunny', 2: 'Partly cloudy', 3: 'Cloudy', 45: 'Foggy', 48: 'Foggy',
    51: 'Drizzle', 53: 'Drizzle', 55: 'Drizzle', 56: 'Freezing drizzle', 57: 'Freezing drizzle',
    61: 'Rain', 63: 'Rain', 65: 'Heavy rain', 66: 'Freezing rain', 67: 'Freezing rain',
    71: 'Snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains', 80: 'Showers', 81: 'Showers', 82: 'Heavy showers',
    85: 'Snow showers', 86: 'Snow showers', 95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm' })[wmo] || '—';
}
async function fetchWeather(lat, lon, label) {
  $('wxStatus').textContent = `Live weather: loading ${label}…`;
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon +
    '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day' +
    '&hourly=temperature_2m,precipitation_probability,weather_code,is_day' +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max' +
    '&past_days=1&forecast_days=5&timezone=auto';
  const r = await fetch(url);
  if (!r.ok) throw new Error('forecast ' + r.status);
  const d = await r.json();
  WX = d;
  const cur = d.current;
  const wmo = cur.weather_code, isDay = cur.is_day === 1;
  // drive the simulator from the real sky
  els.code.value = wmoToScene(wmo, isDay);
  els.temp.value = Math.max(-12, Math.min(42, Math.round(cur.temperature_2m)));
  const localHour = +cur.time.slice(11, 13) + (+cur.time.slice(14, 16)) / 60;
  els.time.value = localHour;
  els.wind.value = Math.max(0, Math.min(4, Math.round(cur.wind_speed_10m / 12)));
  syncTimeToScene();
  const overrideStatus = isDay ? (SUNS[+els.sun.value] === 'NIGHT' ? 'DAY' : SUNS[+els.sun.value]) : 'NIGHT';
  els.sun.value = SUNS.indexOf(overrideStatus);
  $('uiLocation').textContent = label;
  $('wxStatus').textContent = `Live weather: ${label} · ${Math.round(cur.temperature_2m)}° ${wmoLabel(wmo)} · wind ${Math.round(cur.wind_speed_10m)} km/h · Open-Meteo`;
  refresh();
}
function renderCards(cond) {
  const now = +els.time.value, base = effectiveTemp();
  // hourly: real Open-Meteo hours when available, else the simulated curve
  const slots = [];
  if (WX?.hourly?.time?.length) {
    const times = WX.hourly.time;
    let idx = times.findIndex(t => t.slice(0, 13) >= WX.current.time.slice(0, 13));
    if (idx < 0) idx = 0;
    const sunsetToday = WX.daily?.sunset?.[1] || '';
    const sunsetH = sunsetToday ? +sunsetToday.slice(11, 13) + (+sunsetToday.slice(14, 16)) / 60 : SUNSET;
    for (let i = 0; i < 7 && idx + i < times.length; i++) {
      const t = times[idx + i], h = +t.slice(11, 13);
      if (i > 0 && h === Math.ceil(sunsetH) && sunsetH % 1 !== 0) slots.push({ sunset: true, label: fmtHour(sunsetH).full.replace(':0', ':') });
      slots.push({
        h, icon: wmoToIcon(WX.hourly.weather_code[idx + i], WX.hourly.is_day[idx + i] === 1),
        t: Math.round(WX.hourly.temperature_2m[idx + i]),
        precip: WX.hourly.precipitation_probability?.[idx + i] ?? 0,
      });
    }
  } else {
    const startH = Math.floor(now);
    for (let i = 0; i < 7; i++) {
      const h = (startH + i) % 24;
      if (i > 0 && startH + i - 1 < SUNSET && startH + i >= SUNSET) slots.push({ sunset: true });
      const night = h < SUNRISE || h >= SUNSET;
      const t = Math.round(base + 3.5 * Math.sin((h - 9) / 24 * Math.PI * 2) - 3.5 * Math.sin((now - 9) / 24 * Math.PI * 2));
      slots.push({ h, icon: condIcon(cond, night), night, t, precip: Math.max(0, Math.min(90, Math.round((cond.toLowerCase().includes('rain') || cond.toLowerCase().includes('thunder')) ? 30 + i * 6 : (cond.toLowerCase().includes('snow') ? 24 : i % 3)))) });
    }
  }
  const temps = slots.filter(s => !s.sunset).map(s => s.t);
  const tMin = Math.min(...temps), tMax = Math.max(...temps);
  const X = i => 6 + i * (88 / (slots.length - 1));
  const Y = t => 78 - ((t - tMin) / Math.max(1, tMax - tMin)) * 34;
  const pts = slots.map((s, i) => s.sunset ? null : [X(i), Y(s.t)]).filter(Boolean);
  const line = pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ');
  $('hourlyCard').innerHTML = `
    <div class="h-cols">${slots.map((s, i) => s.sunset
      ? `<div class="h-col sunset"><span>${s.label || '6:52 PM'}</span><span class="h-ico">${iconImg('ic_weather_sunset')}</span><span class="h-pre">Sunset</span></div>`
      : `<div class="h-col"><span>${fmtHour(s.h).label}</span><span class="h-ico">${iconImg(s.icon || condIcon(cond, s.night))}</span><span class="h-pre">${iconImg('ic_rainprobability_01', 'drop')}${s.precip}%</span></div>`).join('')}
    </div>
    <svg class="h-graph" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline points="${line}" fill="none" stroke="#ffd94d" stroke-width="1.6" vector-effect="non-scaling-stroke"/>
      ${pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="1.8" fill="#fff" stroke="#ffd94d" stroke-width="1"/>`).join('')}
    </svg>
    <div class="h-temps">${slots.map((s, i) => `<span style="left:${X(i)}%">${s.sunset ? '' : s.t + '°'}</span>`).join('')}</div>`;
  // daily: real Open-Meteo days (incl. Yesterday via past_days=1), Samsung list style
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let rows;
  if (WX?.daily?.time?.length) {
    rows = WX.daily.time.map((dateStr, i) => {
      const dt = new Date(dateStr + 'T12:00:00');
      const name = i === 0 ? 'Yesterday' : i === 1 ? 'Today' : wd[dt.getDay()];
      return {
        name, hi: Math.round(WX.daily.temperature_2m_max[i]), lo: Math.round(WX.daily.temperature_2m_min[i]),
        precip: WX.daily.precipitation_probability_max?.[i] ?? 0,
        dayIcon: wmoToIcon(WX.daily.weather_code[i], true), nightIcon: wmoToIcon(WX.daily.weather_code[i], false),
      };
    });
  } else {
    const days = ['Yesterday', 'Today'];
    const today = new Date().getDay();
    for (let i = 1; i <= 3; i++) days.push(wd[(today + i) % 7]);
    rows = days.map((d, i) => ({
      name: d, hi: base + 1 - i, lo: base - 16 + i * 2,
      precip: Math.max(0, (cond.toLowerCase().includes('rain') || cond.toLowerCase().includes('thunder')) ? 20 + i * 8 : i * 3 - 2),
      dayIcon: condIcon(cond, false), nightIcon: condIcon(cond, true),
    }));
  }
  $('dailyRows').innerHTML = rows.map(r => `<div class="d-row${r.name === 'Today' ? ' today' : ''}">
      <span class="d-name">${r.name}</span>
      <span class="d-pre">${r.precip > 0 ? iconImg('ic_rainprobability_01', 'drop') + r.precip + '%' : ''}</span>
      <span class="d-ico">${iconImg(r.dayIcon)} ${iconImg(r.nightIcon)}</span>
      <span class="d-temps"><b>${r.hi}°</b> <i>${r.lo}°</i></span></div>`).join('');
}

function applyScene() {
  const code = +els.code.value, sun = SUNS[+els.sun.value], tier = TIERS[+els.tier.value], temp = effectiveTemp();
  [resolvedKey, resolved] = resolveScene(code, sun, tier);
  const fam = familyLabel(resolved);
  $('sceneKey').textContent = resolvedKey || '—';
  const bg = resolved?.layers?.BACKGROUND_CANVAS;
  $('bgClass').textContent = bg ? `${bg.class} / ${bg.codeId}` : '—';

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
    charTextureLive = false; lastUploadedFrame = -1;
    video.loop = false; // looping is handled manually at Samsung's loopStartTime
    video.src = `assets/characters/${char}.mp4`;
    video.playbackRate = +els.charrate.value;
    video.play().catch(() => {});
  } else if (!char) { currentChar = ''; video.removeAttribute('src'); video.load(); }
  video.playbackRate = +els.charrate.value;

  const force = els.forcefx.value === '1';
  els.rain.disabled = !(hasLayer('RAIN_CANVAS') || force);
  els.snow.disabled = !(hasLayer('SNOW_CANVAS') || force);
  els.bolt.disabled = !(hasLayer('THUNDER_CANVAS') || force);
  els.fog.disabled = !(hasLayer('FOG_CANVAS') || force);
  els.sand.disabled = !(fam.toLowerCase().includes('sand') || force);
  els.cloud.disabled = !(hasLayer('CLOUD_CANVAS') || force);

  $('uiTemp').textContent = fmtTemp(temp);
  $('uiCond').textContent = conditionLabel(resolved);
  $('uiClock').textContent = fmtHour(+els.time.value).full;
  $('uiHigh').textContent = fmtTemp(+els.temp.value + 1); $('uiLow').textContent = fmtTemp(+els.temp.value - 16);
  $('uiFeels').textContent = fmtTemp(temp + 1);
  renderCards(conditionLabel(resolved));
  $('layerBadge').innerHTML = [hasLayer('BACKGROUND_CANVAS') && 'sky', hasLayer('SUN_AND_STAR_CANVAS') && 'sun/star', hasLayer('CLOUD_CANVAS') && 'cloud', hasLayer('RAIN_CANVAS') && 'rain', hasLayer('SNOW_CANVAS') && 'snow', hasLayer('THUNDER_CANVAS') && 'thunder', hasLayer('FOG_CANVAS') && 'fog'].filter(Boolean).join(' · ') || 'shader sky only';

  $('sceneInfo').textContent =
`sceneKey        : ${resolvedKey}
weatherCode     : ${code}  (${conditionLabel(resolved)})
sunStatus       : ${sun}   deviceTier: ${tier}   temp: ${temp}°C  wind: ${WIND_LABEL[+els.wind.value]}
layers (class → shader program, Samsung's original SkSL):
${Object.entries(resolved?.layers || {}).map(([k, v]) => `  ${k.padEnd(20)} ${v.class} → ${v.codeId}`).join('\n') || '  —'}
FARLAND         : ${far || '—'}
HUMAN/HURRICANE : ${char || '— (no character in this scene, as in the original)'}${char ? `  loopStart=${charLoopStart.toFixed(2)}s` : ''}
NEARLAND        : ${near || '—'}
GRADATION       : ${grad || '—'}
files           : assets/layers/${far}.${DB.layerFiles[far] || 'webp'} · assets/characters/${char}.mp4${shaderErrors.length ? `\nshader compile issues: ${shaderErrors.map(e => e.codeId).join(', ')} (see console)` : ''}`;
}
function updateLabels() {
  $('v-code').textContent = els.code.value;
  $('v-sun').textContent = SUN_LABEL[SUNS[+els.sun.value]];
  $('v-tier').textContent = TIER_LABEL[TIERS[+els.tier.value]];
  $('v-temp').textContent = `${els.temp.value}°C → ${+els.temp.value > 27 ? 'over27 outfit' : +els.temp.value < 0 ? 'below0 outfit' : 'average outfit'}`;
  $('v-time').textContent = fmtHour(+els.time.value).full + ' · ' + SUN_LABEL[sunStatusForHour(+els.time.value)];
  $('v-tspeed').textContent = (+els.tspeed.value).toFixed(2) + ' h/s';
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
  const hc = $('hourlyCard'); if (hc) hc.style.transform = `translateY(${scroll * 30}px)`;
  $('stage').classList.toggle('exploded', els.explode.value === '1');
  const fam = familyLabel(resolved).toLowerCase();
  const sandOn = els['t-precip'].value === '1' && (fam.includes('sand') || els.forcefx.value === '1');
  $('sandTint').style.background = `rgba(216,164,92,${sandOn ? (+els.sand.value / 100) * 0.30 : 0})`;
}

/* ---------- main loop ---------- */
function maybeFlash(dt) {
  const on = hasLayer('THUNDER_CANVAS') || els.forcefx.value === '1';
  const freq = els['t-precip'].value === '1' && on ? +els.bolt.value / 100 : 0;
  nextFlash -= dt;
  if (freq > 0 && nextFlash <= 0) {
    $('thunderFlash').style.opacity = 0.25 * freq + 0.06;
    nextFlash = 0.8 + (1 - freq) * 5 + Math.random() * 2;
    setTimeout(() => $('thunderFlash').style.opacity = 0, 90);
  }
}
function loop(ts) {
  const dt = Math.min(0.05, (ts - lastTs) / 1000 || 0.016); lastTs = ts;
  iTime += dt * +els.speed.value;
  if (timePlaying && DB) {
    els.time.value = (+els.time.value + dt * +els.tspeed.value) % 24;
    syncTimeToScene(); refresh();
  }
  if (resolved) {
    const ov = uniformOverrides();
    const backOv = {}, frontOv = {};
    for (const slot of BACK_SLOTS) backOv[slot] = scaledOverrides(slot, resolved?.layers?.[slot]?.uniforms);
    for (const slot of FRONT_SLOTS) frontOv[slot] = scaledOverrides(slot, resolved?.layers?.[slot]?.uniforms);
    const SKY_FX = 0.62; // sky-effect shader view: top band of the stage (340dp of the 600dp portrait hero; horizon band in landscape)
    backStack.draw(BACK_SLOTS, backOv, {
      BACKGROUND_CANVAS: els['t-sky'].value === '1', SUN_AND_STAR_CANVAS: els['t-sun'].value === '1',
      CLOUD_CANVAS: els['t-cloud'].value === '1', THUNDER_CANVAS: els['t-precip'].value === '1',
    }, { SUN_AND_STAR_CANVAS: SKY_FX, CLOUD_CANVAS: SKY_FX, THUNDER_CANVAS: SKY_FX });
    frontStack.draw(FRONT_SLOTS, frontOv, {
      RAIN_CANVAS: els['t-precip'].value === '1', SNOW_CANVAS: els['t-precip'].value === '1', FOG_CANVAS: els['t-precip'].value === '1',
    }, { FOG_CANVAS: SKY_FX });
  }
  maybeFlash(dt);
  drawChar();
  requestAnimationFrame(loop);
}

/* ---------- wiring ---------- */
const defaults = {};
Object.values(els).forEach(e => defaults[e.id] = e.value);
function refresh() { updateLabels(); applyScene(); positionChar(); applyTransforms(); }
function syncTimeToScene() {
  const h = +els.time.value, status = sunStatusForHour(h);
  els.sun.value = SUNS.indexOf(status);
  els.sunalt.value = Math.round(sunProgressForHour(h, status) * 100);
}
let timePlaying = false;
$('btnTime').addEventListener('click', () => {
  timePlaying = !timePlaying;
  $('btnTime').textContent = timePlaying ? '⏸ Pause timelapse' : '▶ Play timelapse';
});
Object.values(els).forEach(e => e.addEventListener('input', () => {
  if (e === els.time) syncTimeToScene();
  refresh(); if (e === els.tier) resize();
}));
$('btnPlay').addEventListener('click', () => {
  if (video.paused) { video.play().catch(() => {}); $('btnPlay').textContent = '⏸ Pause character'; }
  else { video.pause(); $('btnPlay').textContent = '▶ Play character'; }
});
$('btnRandom').addEventListener('click', () => {
  const keys = Object.keys(DB.scenes);
  const k = keys[Math.floor(Math.random() * keys.length)];
  const [c, s, t] = k.split('_');
  els.code.value = c; els.sun.value = Math.max(0, SUNS.indexOf(s)); els.tier.value = TIERS.indexOf(t);
  refresh();
});
$('btnReset').addEventListener('click', () => { Object.values(els).forEach(e => e.value = defaults[e.id]); refresh(); resize(); });
window.addEventListener('resize', resize);

/* ---------- location search + GPS (Open-Meteo geocoding, as on Atmoscene) ---------- */
let locTimer = null;
$('locSearch').addEventListener('input', () => {
  clearTimeout(locTimer);
  const q = $('locSearch').value.trim();
  const box = $('locResults');
  if (q.length < 2) { box.innerHTML = ''; box.style.display = 'none'; return; }
  locTimer = setTimeout(async () => {
    try {
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en&format=json`);
      const d = await r.json();
      const results = d.results || [];
      box.innerHTML = results.map((p, i) => `<button data-i="${i}">${p.name}${p.admin1 ? ' · ' + p.admin1 : ''}${p.country ? ' · ' + p.country : ''}</button>`).join('');
      box.style.display = results.length ? 'block' : 'none';
      box.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
        const p = results[+b.dataset.i];
        LOC = { name: p.name, admin: p.admin1 || '', lat: p.latitude, lon: p.longitude };
        $('locSearch').value = p.name;
        box.style.display = 'none';
        fetchWeather(p.latitude, p.longitude, p.name).catch(e => $('wxStatus').textContent = 'Live weather failed: ' + e.message);
      }));
    } catch (e) { /* offline: keep simulated weather */ }
  }, 250);
});
document.addEventListener('click', e => { if (!$('locResults').contains(e.target) && e.target !== $('locSearch')) $('locResults').style.display = 'none'; });
$('btnGps').addEventListener('click', () => {
  if (!navigator.geolocation) { $('wxStatus').textContent = 'Geolocation not supported in this browser.'; return; }
  $('wxStatus').textContent = 'Locating…';
  navigator.geolocation.getCurrentPosition(async pos => {
    const { latitude, longitude } = pos.coords;
    let label = 'My location';
    try {
      const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
      const d = await r.json();
      label = d.city || d.locality || label;
    } catch (e) { /* keep generic label */ }
    LOC = { name: label, admin: '', lat: latitude, lon: longitude };
    fetchWeather(latitude, longitude, label).catch(e => $('wxStatus').textContent = 'Live weather failed: ' + e.message);
  }, err => { $('wxStatus').textContent = 'Location permission denied — search a city instead.'; }, { timeout: 10000 });
});

fetch('data/scenes.json').then(r => r.json()).then(db => {
  DB = db;
  initCharGL();
  syncTimeToScene();
  resize(); refresh();
  requestAnimationFrame(loop);
  fetchWeather(LOC.lat, LOC.lon, LOC.name).catch(e => { $('wxStatus').textContent = 'Offline — simulated weather (Open-Meteo unreachable)'; });
}).catch(err => {
  $('sceneInfo').textContent = 'Failed to load data/scenes.json — serve this folder over HTTP (e.g. python -m http.server). ' + err;
});
