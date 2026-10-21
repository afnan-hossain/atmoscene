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

Mirrors `DetailHqBgView` / `DetailHqBgCharacterPlayerView` in the app:

1. `BACKGROUND_CANVAS` — AGSL sky shader; the simulator drives a gradient
   from the scene's real uniforms (`skyColor1..5`, gradient positions)
2. `SUN_AND_STAR_CANVAS` — sun/moon + stars (`sunAltitudePercent`)
3. `CLOUD_CANVAS`, `THUNDER_CANVAS` (+ lightning), sandstorm
4. `FARLAND` — distant-land WebP strip (original file)
5. `NEARLAND_GRADATION` — horizon gradation PNG (original file)
6. `HUMAN` / `HURRICANE` — character MP4 with **packed alpha**: RGB in the
   top 80 % of the frame, alpha mask in the bottom 20 % split into four
   quadrant blocks (TL=1, TR=3, BL=0, BR=2). Decoded in WebGL with a port of
   Samsung's `TransparentVideoView` shader — see
   `CHARACTER_FRAGMENT_SHADER` in `js/hero-library.mjs`
7. `NEARLAND` — foreground land WebP strip (original file)
8. `RAIN_CANVAS` / `SNOW_CANVAS` / `FOG_CANVAS` in front

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
```

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
