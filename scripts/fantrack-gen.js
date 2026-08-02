#!/usr/bin/env node
/**
 * FanTrack 프로필 페이지 생성기 (정적 사전렌더)
 *   node scripts/fantrack-gen.js
 *   node scripts/fantrack-gen.js roster.json      # 로컬 명단 사용
 *
 * 왜 사전렌더인가:
 *   이전 생성기는 빈 껍데기만 만들고 콘텐츠를 클라이언트 fetch로 채웠다.
 *   그 결과 크롤러가 받는 HTML 본문이 비어 있어 검색·AI 인용에 전혀 잡히지 않았다.
 *   콘텐츠는 배치 실행 시점에만 바뀌는 사실상 static 데이터라 SSR이 필요 없다.
 *   → 생성 시점에 목록·JSON-LD까지 HTML에 박고, 표(votes) 같은 동적 값만 클라이언트가 갱신한다.
 *
 * 언어별 경로:
 *   /fantrack/c/{slug}/        = 한국어(기준 콘텐츠)
 *   /fantrack/c/{slug}/{lang}/ = en / tw / es
 *   크롤러는 ?lang= 쿼리를 별도 문서로 보지 않으므로 경로형이 정본이다.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..', 'public', 'fantrack', 'c');
const TPL = path.join(ROOT, 'donghae');
const SITE = 'https://page.cocy.io';
const API = SITE + '/api/fantrack/celebrities';
const LANGS = ['ko', 'en', 'tw', 'es'];
const HREFLANG = { ko: 'ko', en: 'en', tw: 'zh-Hant', es: 'es' };
// 사전렌더는 상위 N건만 — 크롤러에 충분하고 HTML이 비대해지지 않는다.
const PRERENDER_MAX = 60;

const tplHtml = fs.readFileSync(path.join(TPL, 'index.html'), 'utf8');
const tplSw = fs.readFileSync(path.join(TPL, 'sw.js'), 'utf8');
const tplIcon = fs.readFileSync(path.join(TPL, 'icon.svg'), 'utf8');
const i18nSrc = fs.readFileSync(path.join(__dirname, '..', 'public', 'fantrack', 'i18n.js'), 'utf8');

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** i18n.js를 언어별로 한 번씩 평가해 T/pick/celebName을 그대로 재사용한다(번역 로직 이중 구현 금지). */
function loadI18n(lang) {
  const sandbox = {
    window: {},
    location: { search: '?lang=' + lang, pathname: '/fantrack/c/x/' },
    navigator: { language: lang },
    localStorage: { getItem: () => null, setItem: () => {} },
    document: { querySelectorAll: () => [] },
    URLSearchParams,
    console,
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(i18nSrc, sandbox);
  return sandbox.window.FT_I18N;
}

const I18N = Object.fromEntries(LANGS.map((l) => [l, loadI18n(l)]));

async function loadRoster() {
  const arg = process.argv[2];
  if (arg) {
    const j = JSON.parse(fs.readFileSync(arg, 'utf8'));
    return j.celebrities || j;
  }
  const res = await fetch(API);
  if (!res.ok) throw new Error('roster fetch failed: ' + res.status);
  return (await res.json()).celebrities || [];
}

async function loadDetail(slug) {
  const res = await fetch(SITE + '/api/fantrack/celebrity/' + slug);
  if (!res.ok) return null;
  return res.json();
}

const TYPE_ICON = { broadcast: '📺', radio: '📻', youtube: '▶️', ott: '🎬', film: '🎞️', cf: '📣', album: '💿', concert: '🎤' };
const SCHEMA_TYPE = { album: 'MusicAlbum', youtube: 'MusicRecording', concert: 'MusicEvent', film: 'Movie', ott: 'TVSeries', broadcast: 'TVSeries', radio: 'RadioSeries', cf: 'CreativeWork' };

function ytSearch(celebName, title) {
  const q = [celebName, title].filter(Boolean).join(' ');
  return q.trim() ? 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q) : null;
}

function sortContent(list) {
  return [...list].sort((a, b) => (b.year || 0) - (a.year || 0));
}

/** 크롤러가 읽을 목록. 클라이언트 JS가 로드되면 같은 컨테이너를 인터랙티브 버전으로 교체한다. */
function prerenderList(detail, lang) {
  const { T, pick, celebName } = I18N[lang];
  const who = celebName(detail.celebrity);
  return sortContent(detail.content || []).slice(0, PRERENDER_MAX).map((c) => {
    const title = pick(c, 'title') || c.title;
    const href = c.external_link || ytSearch(detail.celebrity.name_en || who, c.title);
    const meta = [T.types[c.type] || c.type, c.year ? c.year + (T.yearSuffix || '') : '', pick(c, 'platform')].filter(Boolean).join(' · ');
    const inner = `<span class="type">${TYPE_ICON[c.type] || '❓'}</span>`
      + `<span class="body"><div class="title">${esc(title)}</div><div class="meta">${esc(meta)}</div></span>`;
    return `<div class="card">${href ? `<a href="${esc(href)}" target="_blank" rel="noreferrer">${inner}</a>` : inner}</div>`;
  }).join('\n');
}

function jsonLd(detail, lang) {
  const c = detail.celebrity;
  const { celebName, pick } = I18N[lang];
  const url = SITE + '/fantrack/c/' + c.id + (lang === 'ko' ? '/' : '/' + lang + '/');
  const works = sortContent(detail.content || []).slice(0, PRERENDER_MAX).map((x) => {
    const o = { '@type': SCHEMA_TYPE[x.type] || 'CreativeWork', name: pick(x, 'title') || x.title };
    if (x.year) o.datePublished = String(x.year);
    if (x.external_link) o.url = x.external_link;
    return o;
  });
  const node = {
    '@context': 'https://schema.org',
    '@type': c.kind === 'group' ? 'MusicGroup' : 'Person',
    name: celebName(c),
    alternateName: [c.name_ko, c.name_en, c.name_tw].filter((v, i, a) => v && a.indexOf(v) === i),
    url,
    inLanguage: HREFLANG[lang],
  };
  if (c.kind !== 'group') node.jobTitle = 'Singer';
  if (c.agency) node.affiliation = { '@type': 'Organization', name: c.agency };
  if (c.debut_date) node.foundingDate = c.debut_date;
  if (c.official_sns_url) node.sameAs = [c.official_sns_url];
  if (works.length) node.subjectOf = works;
  return '<script type="application/ld+json">' + JSON.stringify(node) + '</script>';
}

function head(detail, lang) {
  const c = detail.celebrity;
  const { T, celebName } = I18N[lang];
  const name = celebName(c);
  const n = (detail.content || []).length;
  const desc = {
    ko: `${name} 출연·활동 정보 ${n}건 — 방송·앨범·콘서트를 한 곳에서. FanTrack`,
    en: `${n} works by ${name} — TV shows, albums and concerts in one place. FanTrack`,
    tw: `${name} 的出演與作品 ${n} 筆 — 節目、專輯、演唱會一次看完。FanTrack`,
    es: `${n} trabajos de ${name} — programas, álbumes y conciertos en un solo lugar. FanTrack`,
  }[lang];
  const alts = LANGS.map((l) =>
    `<link rel="alternate" hreflang="${HREFLANG[l]}" href="${SITE}/fantrack/c/${c.id}${l === 'ko' ? '/' : '/' + l + '/'}">`).join('\n');
  const url = SITE + '/fantrack/c/' + c.id + (lang === 'ko' ? '/' : '/' + lang + '/');
  return { name, desc, alts, url, title: `${name} — FanTrack` };
}

async function main() {
  const roster = await loadRoster();
  let n = 0, skipped = 0;
  for (const row of roster) {
    const slug = row.id;
    const detail = await loadDetail(slug);
    if (!detail || !detail.celebrity) { skipped++; continue; }

    for (const lang of LANGS) {
      const h = head(detail, lang);
      const sub = lang === 'ko' ? '' : lang + '/';
      const dir = path.join(ROOT, slug, sub);
      fs.mkdirSync(dir, { recursive: true });

      let html = tplHtml
        .replace(/const SLUG = 'donghae';/, `const SLUG = '${slug}';`)
        .replace(/<title>[^<]*<\/title>/, `<title>${esc(h.title)}</title>`)
        .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(h.desc)}">`)
        .replace(/\/fantrack\/c\/donghae/g, `/fantrack/c/${slug}`)
        .replace(/<html lang="[^"]*"/, `<html lang="${HREFLANG[lang]}"`)
        .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${h.url}">`);

      // 언어 하위 디렉터리에서도 자산이 깨지지 않게 절대경로로
      html = html.replace(/(src|href)="\.\.\/\.\.\/([^"]+)"/g, '$1="/fantrack/$2"')
                 .replace(/(src|href)="(manifest\.json|icon\.svg|sw\.js)"/g, `$1="/fantrack/c/${slug}/${sub}$2"`);

      // 사전렌더 목록 + JSON-LD + hreflang 주입
      html = html.replace(/(<div id="contentList"[^>]*>)([\s\S]*?)(<\/div>)/,
        (m, open, _mid, close) => open + '\n' + prerenderList(detail, lang) + '\n' + close);
      html = html.replace('</head>', h.alts + '\n' + jsonLd(detail, lang) + '\n</head>');

      fs.writeFileSync(path.join(dir, 'index.html'), html);

      const manifest = {
        name: h.title, short_name: h.name, description: h.desc,
        id: h.url.replace(SITE, ''), start_url: h.url.replace(SITE, ''), scope: h.url.replace(SITE, ''),
        display: 'standalone', orientation: 'portrait',
        background_color: '#141221', theme_color: '#141221',
        lang: HREFLANG[lang], categories: ['entertainment'],
        icons: [{ src: '/fantrack/c/' + slug + '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      };
      fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
      fs.writeFileSync(path.join(dir, 'sw.js'),
        tplSw.replace(/fantrack-donghae-v2/, `fantrack-${slug}-${lang}-v3`)
             .replace(/\/fantrack\/c\/donghae\//g, `/fantrack/c/${slug}/${sub}`));
    }

    const iconPath = path.join(ROOT, slug, 'icon.svg');
    if (!fs.existsSync(iconPath)) fs.writeFileSync(iconPath, tplIcon);
    n++;
    if (n % 50 === 0) console.log('  ...', n);
  }
  console.log('generated', n, 'profiles ×', LANGS.length, 'langs =', n * LANGS.length, 'pages | skipped', skipped);
}

main().catch((e) => { console.error(e); process.exit(1); });
