# Samsung Weather — Hero Scene Library

A web reconstruction of the hero header from Samsung Weather
(`com.sec.android.daemonapp`), reverse-engineered from the APK: all **352
scenes** keyed `"{weatherCode}_{sunStatus}_{deviceTier}"`, the layered
renderer, and the transparent character videos.

> **⚠️ Asset licensing:** the binary artwork (`assets/layers/*`,
> `assets/characters/*`) and the generated `data/scenes.json` are **Samsung
> copyrighted material**. They are **git-ignored in this repo and are not
> covered by Atmoscene's MIT license**. Generate them locally from an APK you
> obtained yourself (below) and do not redistribute them. The code in this
> folder (renderer, library, extractor) is MIT like the rest of Atmoscene.

## Layer stack (back → front)

Mirrors `DetailHqBgView` / `DetailHqBgCharacterPlayerView` and the original
`detail_hq_bg_layout.xml` geometry (`DetailHqBgView` is MATCH_PARENT; layers
are dp-anchored: sky-effect shaders in a 340dp-tall view, far land at
212dp/100dp, gradation at 226dp/258dp, near land 840dp wide at 250dp/80dp,
character 160dp at marginTop 140dp):

1. `BACKGROUND_CANVAS` — Samsung's **original AGSL sky program** (`code_0`)
   with the scene's real uniforms (`skyColor1..5`, gradient positions),
   converted SkSL → GLSL at runtime (`skslToGlsl`)
2. `SUN_AND_STAR_CANVAS` — original sun/moon/star programs (`code_1/2/3/12`)
3. `CLOUD_CANVAS` (`code_4/5`), `THUNDER_CANVAS` (`code_10`)
4. `FARLAND` — distant-land WebP strip (original file)
5. `NEARLAND_GRADATION` — horizon gradation PNG (original file)
6. `HUMAN` / `HURRICANE` — character MP4 with **packed alpha**: RGB in the
   top 80 % of the frame, alpha mask in the bottom 20 % split into four
   quadrant blocks (TL=1, TR=3, BL=0, BR=2). Decoded in WebGL with a port of
   Samsung's `TransparentVideoView` shader — see
   `CHARACTER_FRAGMENT_SHADER` in `js/hero-library.mjs`
7. `NEARLAND` — foreground land WebP strip (original file, in front of the
   character's feet, as in the app)
8. `RAIN_CANVAS` (`code_8`) / `SNOW_CANVAS` (`code_6`) / `FOG_CANVAS`
   (`code_11`) in front

All 13 shader programs (`code_0…code_12`) ship inside the generated
`scenes.json`; Samsung's shaders output premultiplied colors, so layers are
composited with `blendFunc(ONE, ONE_MINUS_SRC_ALPHA)`. Slider controls now
drive the **real shader uniforms** (`cloudCover`, `rainIntensity`,
`snowIntensity`, `fogMixAlpha`, `windStrength`, `uStarsDensity`, and the sun
shader's `from/toAnimationProgress` path). The only non-original bits left
are the app-level lightning flash overlay, the sandstorm tint, and the text
UI — there is no procedural sky/cloud/rain/snow anywhere.

Temperature picks the character outfit variant exactly like the APK:
`> 27 °C → over27`, `< 0 °C → below0`, otherwise `average`.

## Generate the data + assets (local, one-time)

```bash
# Android SDK build-tools (aapt2) on PATH:
aapt2 dump resources samsung-weather.apk > resources_dump.txt

python tools/extract-samsung-hero.py \
  --apk samsung-weather.apk \
  --resources-dump resources_dump.txt \
  --out apps/samsung-hero
# -> scenes=352 layers=41 characters=24

# Samsung's colored weather icons (weather_ic_* vector drawables -> SVG):
python tools/convert-samsung-icons.py
# -> assets/icons/*.svg (35 icons: sunny, clear, rain, snow, thunderstorm,
#    sunrise/sunset, precipitation droplet, ...)
```

## Live weather, location and time simulator

The demo is a working weather app, not just a scene viewer:

- **Real weather** from the free Open-Meteo API (no key), geocoding search
  dropdown and a **GPS button** (`⌖ Use my location`), exactly like the
  Atmoscene homepage. WMO weather codes map to Samsung scene codes and to
  the Samsung icon set; the hero, hourly graph card and daily card
  (Yesterday/Today/… via `past_days=1`) all render the real forecast.
- **No emoji weather icons** — every condition icon is Samsung's own
  `weather_ic_*` artwork, converted from the APK's vector drawables to SVG.
- **Time simulator**: a time-of-day slider (plus timelapse play) drives the
  sun status (sunrise/day/sunset/night), the sun/moon position on Samsung's
  parabolic path, the temperature curve (simulated mode) and the clock —
  drag it to watch the hero relight through a full day.
- The character video loop uses Samsung's `loopStartTime`: frames are only
  uploaded when fresh, the last good texture is kept across the loop seek,
  and the mask is feathered + premultiplied so edges blend smoothly.

## Run the simulator

```bash
npm run dev            # repo server on http://127.0.0.1:8790
# open http://127.0.0.1:8790/samsung-hero/
```

31 sliders below the hero control the scene (weather code, sun status,
device tier, temperature), sky/astronomy, weather effects, per-layer
toggles, character/land, and camera parallax. Effect sliders auto-disable
when the resolved scene's table lacks that canvas, as in the original.

## Use the library in a webapp

```js
import {
  loadSceneLibrary, resolveScene, pickVariant,
  sceneArtwork, skyGradient, conditionLabel,
  CHARACTER_FRAGMENT_SHADER,
} from './js/hero-library.mjs';

const db = await loadSceneLibrary('/samsung-hero/');
const [key, scene] = resolveScene(db, 9, 'DAY', 'HIGH');   // thunderstorm
const art = sceneArtwork(db, scene, 26, '/samsung-hero/');
// art.farLand / art.nearLand / art.gradation  -> original WebP/PNG URLs
// art.character                              -> packed-alpha MP4 URL
// art.loopStartSeconds                       -> loop point for the video
const stops = skyGradient(scene);            // real sky uniforms
const label = conditionLabel(scene);         // "Thunderstorm"
```

`index.html` + `app.js` in this folder are a complete working consumer:
layered canvases, the WebGL character renderer, parallax, and the full
slider deck.

## Data schema

See the header of `js/hero-library.mjs`; `data/scenes.sample.json` shows the
shape with synthetic placeholder data.
