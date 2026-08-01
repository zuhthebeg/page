// _staging/data.busan.json의 환승 키 불일치('역' 접미사)를 병합 복구 → public/subway-dice/data.busan.json
const fs=require("fs");
const d=JSON.parse(fs.readFileSync(__dirname+"/data.busan.json","utf8"));

// 1) 정규화: 끝 '역' 제거한 형태를 canonical 후보로. 단, 정규화형이 이미 키로 존재하면 그쪽으로 흡수.
const norm=s=>s.length>1&&s.endsWith("역")?s.slice(0,-1):s;
// canonical 선택: 같은 norm을 갖는 키들 중 '역' 없는 짧은 쪽
const groups={};
for(const k of Object.keys(d.stations)){ (groups[norm(k)]=groups[norm(k)]||[]).push(k); }
const canon={}; // oldKey -> canonicalKey
for(const n in groups){ const ks=groups[n]; const c=ks.slice().sort((a,b)=>a.length-b.length)[0]; ks.forEach(k=>canon[k]=c); }

// 2) stations 병합
const stations={};
for(const k of Object.keys(d.stations)){ const c=canon[k]; const s=d.stations[k];
  if(!stations[c]){ stations[c]={name:s.name,lat:s.lat,lng:s.lng,lines:[]}; }
  // 이름은 canonical 키와 동일한 원본 우선
  if(k===c) stations[c].name=s.name;
}
// 3) lines[].stations 키 치환 + 연속 중복 제거
d.lines.forEach(l=>{ const seq=[]; l.stations.forEach(k=>{const c=canon[k]||k; if(seq[seq.length-1]!==c)seq.push(c);}); l.stations=seq; });
// 4) station.lines 재계산 (lines가 authoritative)
d.lines.forEach(l=>l.stations.forEach(k=>{ if(stations[k] && !stations[k].lines.includes(l.id))stations[k].lines.push(l.id); }));
d.stations=stations;

// 5) 검증
const ids=new Set(d.lines.map(l=>l.id)); let xref=0,nameMiss=0;
for(const k in d.stations){const s=d.stations[k]; for(const id of s.lines)if(!ids.has(id))xref++; if(!s.name||!s.name.ko||!s.name.en||!s.name.zh)nameMiss++;}
for(const l of d.lines)for(const k of l.stations)if(!d.stations[k])xref++;
const transfers=Object.entries(d.stations).filter(([k,s])=>s.lines.length>=2);
const known=["서면","연산","수영","덕천","미남","동래","교대","사상","대저","거제","부전","미남","수영"];
console.log("노선",d.lines.length,"역",Object.keys(d.stations).length,"| 상호참조오류",xref,"| name결손",nameMiss);
console.log("환승역",transfers.length,":",transfers.map(([k,s])=>k+"("+s.lines.length+")").join(" "));
console.log("known 환승역 점검:");
[...new Set(known)].forEach(k=>{const s=d.stations[k]; console.log("  ",k,s?s.lines:"<없음>");});

fs.writeFileSync(__dirname+"/../public/subway-dice/data.busan.json", JSON.stringify(d), "utf8");
console.log("WROTE public/subway-dice/data.busan.json", fs.statSync(__dirname+"/../public/subway-dice/data.busan.json").size,"B");
