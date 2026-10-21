#!/usr/bin/env python3
"""Extract the Samsung Weather hero scene library from an APK you own.

Reads assets/agsl_shader_android.json (352-scene table) from the APK plus a
resource dump, and writes the simulator's data/assets into an output folder:

    <out>/data/scenes.json
    <out>/assets/layers/<name>.<webp|png>      (FARLAND / NEARLAND / gradation)
    <out>/assets/characters/<name>.mp4         (packed-alpha character videos)

The extracted binaries are Samsung copyrighted assets. This repo git-ignores
them; generate them locally and do not redistribute. See
apps/samsung-hero/README.md.

Usage:
    # 1. dump the APK's resource table (Android SDK build-tools):
    aapt2 dump resources samsung-weather.apk > resources_dump.txt

    # 2. extract:
    python tools/extract-samsung-hero.py \
        --apk samsung-weather.apk \
        --resources-dump resources_dump.txt \
        --out apps/samsung-hero
"""
import argparse
import json
import os
import re
import zipfile


def parse_resource_map(dump_path):
    resmap = {}
    current = None
    with open(dump_path, encoding='utf-8', errors='ignore') as fh:
        for ln in fh:
            m = re.match(r'\s*resource\s+0x[0-9a-f]+\s+(\S+/\S+)', ln)
            if m:
                current = m.group(1)
                continue
            m = re.search(r'\(file\)\s+(res/\S+)', ln)
            if m and current and current not in resmap:
                resmap[current] = m.group(1)
    return resmap


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--apk', required=True, help='Samsung Weather APK (com.sec.android.daemonapp)')
    ap.add_argument('--resources-dump', required=True, help='output of `aapt2 dump resources <apk>`')
    ap.add_argument('--out', default='apps/samsung-hero', help='output folder (default: apps/samsung-hero)')
    args = ap.parse_args()

    os.makedirs(f'{args.out}/assets/layers', exist_ok=True)
    os.makedirs(f'{args.out}/assets/characters', exist_ok=True)
    os.makedirs(f'{args.out}/data', exist_ok=True)

    resmap = parse_resource_map(args.resources_dump)
    z = zipfile.ZipFile(args.apk)
    scene_data = json.loads(z.read('assets/agsl_shader_android.json'))

    def res_file(name, kinds):
        for kind in kinds:
            f = resmap.get(f'{kind}/{name}')
            if f:
                return f
        return None

    def class_uniforms(class_name):
        try:
            obj = json.loads(z.read(f'assets/resource/{class_name}.json'))
        except KeyError:
            return None
        uniforms = {u.get('name'): u.get('value') for u in obj.get('uniforms', [])}
        return {'codeId': obj.get('codeId'), 'uniforms': uniforms}

    scenes, used_layers, used_chars = {}, {}, {}
    for key, scene in scene_data['sceneHash'].items():
        out = {'resources': {}, 'layers': {}}
        for slot, rv in scene.get('resourcesHash', {}).items():
            entry = {}
            for variant in ('resource', 'average', 'over27', 'below0'):
                name = rv.get(variant)
                if not name:
                    continue
                entry[variant] = name
                if slot in ('HUMAN', 'HURRICANE'):
                    f = res_file(name, ['raw'])
                    if f and name not in used_chars:
                        used_chars[name] = f
                else:
                    f = res_file(name, ['drawable'])
                    if f and name not in used_layers:
                        used_layers[name] = f
            if rv.get('loopStartTime') is not None:
                entry['loopStartTime'] = rv['loopStartTime']
            out['resources'][slot] = entry
        for slot, class_name in scene.get('layersHash', {}).items():
            info = class_uniforms(class_name)
            out['layers'][slot] = {'class': class_name, **(info or {})}
        scenes[key] = out

    for name, f in used_layers.items():
        ext = f.rsplit('.', 1)[-1]
        with open(f'{args.out}/assets/layers/{name}.{ext}', 'wb') as fh:
            fh.write(z.read(f))
    for name, f in used_chars.items():
        with open(f'{args.out}/assets/characters/{name}.mp4', 'wb') as fh:
            fh.write(z.read(f))

    # Original AGSL (SkSL) shader programs: 13 shared code_N files powering
    # every canvas layer (sky, sun/stars, cloud, rain, snow, thunder, fog).
    shader_codes = {}
    for i in range(13):
        try:
            shader_codes[f'code_{i}'] = json.loads(z.read(f'assets/resource/code_{i}.json'))
        except KeyError:
            pass

    with open(f'{args.out}/data/scenes.json', 'w', encoding='utf-8') as fh:
        json.dump({'scenes': scenes,
                   'layerFiles': {k: v.rsplit('.', 1)[-1] for k, v in used_layers.items()},
                   'characterNames': sorted(used_chars),
                   'shaderCodes': shader_codes}, fh)

    print(f'scenes={len(scenes)} layers={len(used_layers)} characters={len(used_chars)}')
    print(f'wrote {args.out}/data/scenes.json + assets (git-ignored, do not commit)')


if __name__ == '__main__':
    main()
