#!/usr/bin/env python3
"""ELC site audit — run before shipping a build. python3 tools/audit.py"""
import re,glob,os,subprocess,sys
pages=sorted(glob.glob('*.html'))+sorted(glob.glob('games/*/index.html'))
games=sorted(glob.glob('games/*/index.html'))
def rd(p): return open(p,encoding='utf-8',errors='replace').read()
HIGH=[];MED=[];LOW=[]
def add(b,p,m): b.append(f"{p}: {m}")
for p in pages:
    s=rd(p)
    if 'name="viewport"' not in s: add(HIGH,p,'no <meta viewport>')
    if not re.search(r'<html[^>]*\blang=',s): add(LOW,p,'<html> missing lang')
    if '<title' not in s: add(MED,p,'no <title>')
    if 'name="description"' not in s: add(LOW,p,'no meta description')
    if re.search(r'@media',s) is None and 'minmax(' not in s and 'auto-fill' not in s and 'auto-fit' not in s:
        add(HIGH,p,'no responsive system (no @media and no fluid grid)')
    # genuine fixed widths (exclude max-/min-width, %, vw)
    for m in re.finditer(r'(?<!max-)(?<!min-)\bwidth:\s*(\d{3,})px',s):
        ctx=s[max(0,m.start()-160):m.start()+220]
        if int(m.group(1))>=460 and 'pointer-events:none' not in ctx: add(MED,p,f'hard width:{m.group(1)}px (overflow risk)')
    # real duplicate ids (ignore template-literal ids)
    ids=[i for i in re.findall(r'\bid="([^"{}$]+)"',s)]
    dup=sorted(set(i for i in ids if ids.count(i)>1))
    if dup: add(HIGH,p,'duplicate id: '+', '.join(dup))
    # buttons that are non-semantic divs with onclick (a11y/keyboard)
    if re.search(r'<div[^>]*\bonclick=',s): add(LOW,p,'clickable <div onclick> (use <button> for a11y)')
    # inline JS validity
    for blk in re.findall(r'<script>(.*?)</script>',s,re.S):
        if blk.strip() and 'src=' not in blk[:30]:
            open('/tmp/c.js','w').write(blk)
            if subprocess.run(['node','--check','/tmp/c.js'],capture_output=True).returncode:
                add(HIGH,p,'inline JS syntax error')
    # broken internal links
    for h in re.findall(r'href="(/[^"#?]+\.html)',s):
        if not os.path.exists(h.lstrip('/')): add(MED,p,f'link to missing {h}')
# game consistency
need={'back link':'class="back"','fireworks layer':'id="fx"','result card':'result','progress hook':'progress.js'}
for g in games:
    s=rd(g)
    for label,token in need.items():
        if token not in s: add(MED,g,f'missing {label}')
print("== HIGH ==");[print(' -',x) for x in HIGH] or print('  none')
print("== MEDIUM =="); [print(' -',x) for x in MED] or print('  none')
print("== LOW =="); [print(' -',x) for x in LOW] or print('  none')
print(f"\nTOT: HIGH={len(HIGH)} MED={len(MED)} LOW={len(LOW)}")
sys.exit(1 if HIGH else 0)
