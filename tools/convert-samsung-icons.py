"""Convert Samsung's binary vector drawables (weather_ic_*) to SVG.

Usage (from the APK you own, same inputs as extract-samsung-hero.py):
    set AAPT2=<path to aapt2>            (or have aapt2 on PATH)
    set SAMSUNG_APK=samsung-weather.apk  (optional, this is the default)
    python tools/convert-samsung-icons.py
Output SVGs land in apps/samsung-hero/assets/icons/ (git-ignored).
"""
import json
import os
import re
import subprocess
import zipfile

AAPT2 = os.environ.get('AAPT2', 'aapt2')  # Android SDK build-tools aapt2 (PATH or env override)
OUT = os.path.join(os.environ.get('SAMSUNG_HERO_OUT', 'apps/samsung-hero'), 'assets', 'icons')
os.makedirs(OUT, exist_ok=True)

manifest = json.load(open(f'{OUT}/manifest.json'))  # short name -> apk res file name (xml)


def dump_tree(apk_path):
    out = subprocess.run([AAPT2, 'dump', 'xmltree', os.environ.get('SAMSUNG_APK', 'samsung-weather.apk'), '--file', apk_path],
                         capture_output=True, text=True, encoding='utf-8', errors='ignore').stdout
    root = {'tag': 'root', 'attrs': {}, 'children': []}
    stack = [(-1, root)]
    for ln in out.splitlines():
        stripped = ln.strip()
        indent = len(ln) - len(ln.lstrip())
        if stripped.startswith('E: '):
            tag = stripped[3:].split(' ')[0]
            node = {'tag': tag, 'attrs': {}, 'children': []}
            while stack and stack[-1][0] >= indent:
                stack.pop()
            stack[-1][1]['children'].append(node)
            stack.append((indent, node))
        elif stripped.startswith('A: '):
            m = re.match(r'A: \S+:(\w+)\(0x[0-9a-f]+\)=(.*)$', stripped)
            if m and stack:
                name, val = m.groups()
                qm = re.match(r'"(.*)"(?: \(Raw:.*)?$', val)
                stack[-1][1]['attrs'][name] = qm.group(1) if qm else val
    return root


def color(v):
    """#AARRGGBB -> (#RRGGBB, opacity) ; other refs pass through."""
    if not v:
        return None, None
    m = re.fullmatch(r'#([0-9a-fA-F]{8})', v)
    if m:
        h = m.group(1)
        return '#' + h[2:], int(h[:2], 16) / 255
    m = re.fullmatch(r'#([0-9a-fA-F]{6})', v)
    if m:
        return v, 1
    return v, 1


def num(v, default=0):
    try:
        return float(v)
    except (TypeError, ValueError):
        return default


def fmt(x):
    return f'{x:.3f}'.rstrip('0').rstrip('.') if isinstance(x, float) else str(x)


clip_counter = [0]


def node_to_svg(node):
    tag, a = node['tag'], node['attrs']
    if tag == 'path':
        fill, fo = color(a.get('fillColor'))
        stroke, so = color(a.get('strokeColor'))
        parts = [f'd="{a.get("pathData", "")}"']
        grad = next((c for c in node['children'] if c['tag'] == 'gradient'), None)
        defs = ''
        if grad is not None:
            clip_counter[0] += 1
            gid = f'g{clip_counter[0]}'
            ga = grad['attrs']
            items = []
            for it in grad['children']:
                if it['tag'] != 'item':
                    continue
                c, _ = color(it['attrs'].get('color'))
                items.append(f'<stop offset="{fmt(num(it["attrs"].get("offset")))}" stop-color="{c}"/>')
            gt = ga.get('type', 'linear')
            if gt == 'radial':
                defs = (f'<radialGradient id="{gid}" cx="{fmt(num(ga.get("centerX"), .5))}" cy="{fmt(num(ga.get("centerY"), .5))}" '
                        f'r="{fmt(num(ga.get("gradientRadius"), .5))}">{"".join(items)}</radialGradient>')
            else:
                defs = (f'<linearGradient id="{gid}" x1="{fmt(num(ga.get("startX")))}" y1="{fmt(num(ga.get("startY")))}" '
                        f'x2="{fmt(num(ga.get("endX")))}" y2="{fmt(num(ga.get("endY")))}">{"".join(items)}</linearGradient>')
            parts.append(f'fill="url(#{gid})"')
        elif fill:
            parts.append(f'fill="{fill}"')
            op = (fo if fo is not None else 1) * num(a.get('fillAlpha'), 1)
            if op < 1:
                parts.append(f'fill-opacity="{fmt(round(op, 3))}"')
        else:
            parts.append('fill="none"')
        if stroke and stroke != '#000000':
            parts.append(f'stroke="{stroke}"')
            sop = (so if so is not None else 1) * num(a.get('strokeAlpha'), 1)
            if sop < 1:
                parts.append(f'stroke-opacity="{fmt(round(sop, 3))}"')
            parts.append(f'stroke-width="{fmt(num(a.get("strokeWidth"), 1))}"')
            cap = {'0': 'butt', '1': 'round', '2': 'square'}.get(str(a.get('strokeLineCap', '0')), 'butt')
            join = {'0': 'miter', '1': 'round', '2': 'bevel'}.get(str(a.get('strokeLineJoin', '0')), 'miter')
            parts.append(f'stroke-linecap="{cap}" stroke-linejoin="{join}"')
        if str(a.get('fillType')) == '1':
            parts.append('fill-rule="evenodd"')
        return defs, f'<path {" ".join(parts)}/>'
    if tag == 'group':
        tr = []
        if a.get('translateX') or a.get('translateY'):
            tr.append(f'translate({fmt(num(a.get("translateX")))} {fmt(num(a.get("translateY")))})')
        if a.get('rotation'):
            tr.append(f'rotate({fmt(num(a.get("rotation")))} {fmt(num(a.get("pivotX")))} {fmt(num(a.get("pivotY")))})')
        if a.get('scaleX') or a.get('scaleY'):
            tr.append(f'scale({fmt(num(a.get("scaleX"), 1))} {fmt(num(a.get("scaleY"), 1))})')
        inner, defs = render_children(node)
        t = f' transform="{" ".join(tr)}"' if tr else ''
        return defs, f'<g{t}>{inner}</g>'
    if tag == 'clip-path':
        clip_counter[0] += 1
        cid = f'c{clip_counter[0]}'
        return f'<clipPath id="{cid}"><path d="{a.get("pathData", "")}"/></clipPath>', ''
    inner, defs = render_children(node)
    return defs, inner


def render_children(node):
    out, defs = [], []
    clip_id = None
    for child in node['children']:
        d, s = node_to_svg(child)
        if child['tag'] == 'clip-path':
            defs.append(d)
            clip_id = f'c{clip_counter[0]}'
            continue
        if d:
            defs.append(d)
        if s:
            out.append(s)
    body = ''.join(out)
    if clip_id:
        body = f'<g clip-path="url(#{clip_id})">{body}</g>'
    return body, ''.join(defs)


z = zipfile.ZipFile(os.environ.get('SAMSUNG_APK', 'samsung-weather.apk'))
new_manifest = {}
for short, fname in sorted(manifest.items()):
    apk_path = None
    # manifest values currently are "name.ext" local copies; recover apk path from dump mapping instead
    new_manifest[short] = f'{short}.svg'

# recover apk paths from resources_dump mapping
txt = open('resources_dump.txt', encoding='utf-8', errors='ignore').read()
resmap, current = {}, None
for ln in txt.splitlines():
    m = re.match(r'\s*resource\s+0x[0-9a-f]+\s+(\S+/\S+)', ln)
    if m:
        current = m.group(1)
        continue
    m = re.search(r'\(file\)\s+(res/\S+)', ln)
    if m and current:
        resmap.setdefault(current, m.group(1))
        current = None

targets = {}
for name, f in resmap.items():
    if name.startswith('drawable/weather_ic_') and '_whitebg' not in name:
        targets[name.split('/', 1)[1].replace('weather_ic_', '')] = f
for extra in ('ic_weather_sunrise', 'ic_weather_sunset', 'ic_weather_moonrise', 'ic_weather_moonset', 'ic_rainprobability_01'):
    if f'drawable/{extra}' in resmap:
        targets[extra] = resmap[f'drawable/{extra}']

for short, apk_path in sorted(targets.items()):
    root = dump_tree(apk_path)
    vec = next((c for c in root['children'] if c['tag'] == 'vector'), None)
    if vec is None:
        print('NO VECTOR', short, apk_path)
        continue
    vw = fmt(num(vec['attrs'].get('viewportWidth'), 70)) or '70'
    vh = fmt(num(vec['attrs'].get('viewportHeight'), 70)) or '70'
    clip_counter[0] = 0
    body, defs = render_children(vec)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {vw} {vh}" '
           f'width="70" height="70" role="img" aria-label="{short}">{defs}{body}</svg>')
    with open(f'{OUT}/{short}.svg', 'w', encoding='utf-8') as fh:
        fh.write(svg)
    # drop the binary axml copy extracted earlier
    stale = f'{OUT}/{short}.xml'
    if os.path.exists(stale):
        os.remove(stale)
    print(short, apk_path, len(svg))

json.dump({k: f'{k}.svg' for k in sorted(targets)}, open(f'{OUT}/manifest.json', 'w'), indent=1)
print('converted', len(targets))
