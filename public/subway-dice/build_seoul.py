#!/usr/bin/env python3
# 기존 검증된 data.json(서울) 그래프를 보존한 채 다국어 이름(ko/en/zh) + 노선 id 부여 → data.seoul.json
import json, urllib.request, urllib.parse, sys, os, time
import opencc
S2T = opencc.OpenCC("s2t")

HERE = os.path.dirname(os.path.abspath(__file__))
src = json.load(open(os.path.join(HERE, "data.json"), encoding="utf-8"))

LINE_META = {
 "1호선":("seoul-1","Line 1","1號線"),
 "2호선":("seoul-2","Line 2","2號線"),
 "2호선 성수지선":("seoul-2-seongsu","Line 2 Seongsu Branch","2號線城水支線"),
 "2호선 신정지선":("seoul-2-sinjeong","Line 2 Sinjeong Branch","2號線新亭支線"),
 "3호선":("seoul-3","Line 3","3號線"),
 "4호선":("seoul-4","Line 4","4號線"),
 "5호선":("seoul-5","Line 5","5號線"),
 "5호선 마천지선":("seoul-5-macheon","Line 5 Macheon Branch","5號線馬川支線"),
 "6호선":("seoul-6","Line 6","6號線"),
 "7호선":("seoul-7","Line 7","7號線"),
 "8호선":("seoul-8","Line 8","8號線"),
 "9호선":("seoul-9","Line 9","9號線"),
 "수인분당선":("seoul-suin-bundang","Suin-Bundang Line","水仁盆唐線"),
 "신분당선":("seoul-sinbundang","Sinbundang Line","新盆唐線"),
 "경의중앙선":("seoul-gyeongui-jungang","Gyeongui-Jungang Line","京義中央線"),
 "공항철도":("seoul-airport","Airport Railroad","機場鐵路"),
 "경춘선":("seoul-gyeongchun","Gyeongchun Line","京春線"),
}

# 1) Overpass: 수도권 bbox 내 모든 철도역의 name / name:en / name:zh
bbox = "36.6,126.2,38.05,127.85"  # S,W,N,E (수도권 광역 포함)
q = f'[out:json][timeout:60];(node["railway"~"^(station|halt)$"]({bbox});node["public_transport"="station"]["train"="yes"]({bbox}););out tags;'
req = urllib.request.Request("https://overpass-api.de/api/interpreter",
    data=urllib.parse.urlencode({"data": q}).encode(),
    headers={"User-Agent": "subway-dice-builder/1.0"})
names = {}  # ko_name -> {"en":..,"zh":..}
for attempt in range(3):
    try:
        raw = urllib.request.urlopen(req, timeout=70).read()
        data = json.loads(raw)
        for e in data.get("elements", []):
            t = e.get("tags", {})
            ko = t.get("name:ko") or t.get("name")
            if not ko: continue
            en = t.get("name:en")
            zh = t.get("name:zh-Hant") or (S2T.convert(t["name:zh"]) if t.get("name:zh") else None)
            cur = names.setdefault(ko, {"en": None, "zh": None})
            if en and not cur["en"]: cur["en"] = en
            if zh and not cur["zh"]: cur["zh"] = zh
        break
    except Exception as ex:
        print(f"  overpass retry {attempt+1}: {ex}", file=sys.stderr); time.sleep(5)
print(f"OSM 이름 매핑 수집: {len(names)}개 역명")

# 1b) Wikidata: 한국 철도역 번체(zh-hant) 라벨 보강
def norm(s): return s[:-1] if len(s) > 1 and s.endswith("역") else s
wd_zh = {}
sparql = ('SELECT ?ko ?hant ?hans ?zh WHERE { ?st wdt:P31/wdt:P279* wd:Q55488 . ?st wdt:P17 wd:Q884 . '
          '?st rdfs:label ?ko . FILTER(lang(?ko)="ko") '
          'OPTIONAL { ?st rdfs:label ?hant . FILTER(lang(?hant)="zh-hant") } '
          'OPTIONAL { ?st rdfs:label ?hans . FILTER(lang(?hans)="zh-hans") } '
          'OPTIONAL { ?st rdfs:label ?zh . FILTER(lang(?zh)="zh") } }')
wb = None
for attempt in range(4):
    try:
        wreq = urllib.request.Request("https://query.wikidata.org/sparql?" +
            urllib.parse.urlencode({"query": sparql, "format": "json"}),
            headers={"User-Agent": "subway-dice-builder/1.0 (cocy game)", "Accept": "application/sparql-results+json"})
        wb = json.loads(urllib.request.urlopen(wreq, timeout=60).read())["results"]["bindings"]
        break
    except urllib.error.HTTPError as he:
        if he.code == 429 and attempt < 3:
            print(f"  wikidata 429 → 65s 대기 후 재시도({attempt+1})", file=sys.stderr); time.sleep(65)
        else:
            print(f"  wikidata 실패(무시): {he}", file=sys.stderr); break
    except Exception as ex:
        print(f"  wikidata 실패(무시): {ex}", file=sys.stderr); break
if wb is None: wb = []
if True:
    for r in wb:
        v = (r["hant"]["value"] if "hant" in r else
             S2T.convert(r["hans"]["value"]) if "hans" in r else
             S2T.convert(r["zh"]["value"]) if "zh" in r else None)
        if v: wd_zh.setdefault(norm(r["ko"]["value"]), v)
    print(f"Wikidata 번체 보강: {len(wd_zh)}개")
# OSM zh도 정규화 키로 인덱싱
osm_zh = {norm(k): v["zh"] for k, v in names.items() if v.get("zh")}

# 2) 변환
def st_name(ko):
    m = names.get(ko, {})
    nk = norm(ko)
    en = m.get("en") or ko
    # zh: OSM(직접) > Wikidata 번체 > OSM(정규화) > 영문 폴백
    zh = m.get("zh") or wd_zh.get(nk) or osm_zh.get(nk) or en
    return {"ko": ko, "en": en, "zh": zh}

out = {"city": "seoul", "labels": {"ko": "서울", "en": "Seoul", "zh": "首爾"}, "lines": [], "stations": {}}
name2id = {ln["name"]: LINE_META[ln["name"]][0] for ln in src["lines"]}

for ln in src["lines"]:
    lid, en, zh = LINE_META[ln["name"]]
    out["lines"].append({"id": lid, "name": {"ko": ln["name"], "en": en, "zh": zh},
                         "color": ln.get("color", "#5b9bff"), "loop": bool(ln.get("loop")),
                         "stations": list(ln["stations"])})
for ko, s in src["stations"].items():
    out["stations"][ko] = {"name": st_name(ko), "lat": s["lat"], "lng": s["lng"],
                           "lines": [name2id[n] for n in s["lines"]]}

# 3) 검증
errs = 0; miss_en = miss_zh = 0
sset = set(out["stations"])
lids = {l["id"] for l in out["lines"]}
for l in out["lines"]:
    for k in l["stations"]:
        if k not in sset: print(f"  XREF: line {l['id']} -> missing station {k}"); errs += 1
for k, s in out["stations"].items():
    for lid in s["lines"]:
        if lid not in lids: print(f"  XREF: station {k} -> missing line {lid}"); errs += 1
    if s["name"]["en"] == k: miss_en += 1
    if s["name"]["zh"] == s["name"]["en"]: miss_zh += 1

json.dump(out, open(os.path.join(HERE, "data.seoul.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(f"노선 {len(out['lines'])} / 역 {len(out['stations'])} | 상호참조 오류 {errs}")
print(f"en 미매칭(한글폴백) {miss_en} / zh 미매칭 {miss_zh}")
for spot in ["강남", "서울역", "신도림"]:
    if spot in out["stations"]:
        print(f"  {spot}: {out['stations'][spot]['name']} lines={out['stations'][spot]['lines']}")
print("WROTE data.seoul.json", os.path.getsize(os.path.join(HERE, "data.seoul.json")), "bytes")
