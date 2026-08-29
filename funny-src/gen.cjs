#!/usr/bin/env node
// funny board generator — reads funny-src/posts/*.json, emits public/funny/ static pages.
// usage: node funny-src/gen.cjs
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'posts');
const OUT = path.join(__dirname, '..', 'public', 'funny');
const SITE = 'https://page.cocy.io';

const RECS = [
  { emoji: '🎤', label: '내 목소리, 어떤 가수랑 닮았을까', url: 'https://game.cocy.io/voicematch/' },
  { emoji: '🐶', label: '나는 무슨 동물상일까 (AI 분석)', url: 'https://game.cocy.io/animalface/' },
  { emoji: '🧬', label: '게임 하나로 보는 성격 분석', url: 'https://game.cocy.io/playdna/' },
  { emoji: '🎮', label: '심심풀이 무료 게임 모음', url: 'https://game.cocy.io/' },
  { emoji: '🗺️', label: '구글 타임라인으로 내 여행지도 그리기', url: 'https://page.cocy.io/footprints/' },
  { emoji: '🔥', label: '이 글 어그로 수치 측정기', url: 'https://page.cocy.io/aggro/' },
];

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// md-lite: paragraphs, **bold**, "> " quote, "---" hr
function render(body) {
  return body.trim().split(/\n\s*\n/).map(block => {
    const b = block.trim();
    if (b === '---') return '<hr>';
    const inline = t => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    if (b.split('\n').every(l => l.startsWith('> ')))
      return '<blockquote>' + b.split('\n').map(l => inline(l.slice(2))).join('<br>') + '</blockquote>';
    return '<p>' + b.split('\n').map(inline).join('<br>') + '</p>';
  }).join('\n');
}

function hashPick(slug, n) {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const pool = [...RECS.keys()];
  const out = [];
  while (out.length < n && pool.length) out.push(pool.splice(h++ % pool.length, 1)[0]);
  return out.map(i => RECS[i]);
}

const GTM_HEAD = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MV8KQGJF');</script>
<!-- End Google Tag Manager -->
<!-- AdSense: managed via GTM auto-ads (ca-pub-6634731722045607) -->`;
const GTM_BODY = `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MV8KQGJF"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`;

const CSS = `/funny/funny.css?v=1`;

function head({ title, desc, url, ogImage, jsonld }) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
${GTM_HEAD}
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
${ogImage ? `<meta property="og:image" content="${ogImage}">` : ''}
<meta name="twitter:card" content="summary">
<link rel="icon" type="image/svg+xml" href="/funny/icon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jua&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${CSS}">
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ''}
</head>
<body>
${GTM_BODY}`;
}

function mediaHtml(m) {
  if (!m) return '';
  return m.map(x => {
    if (x.type === 'video')
      return `<figure><video controls playsinline preload="metadata" src="${x.file}"></video>${x.caption ? `<figcaption>${esc(x.caption)}</figcaption>` : ''}</figure>`;
    return `<figure><img src="${x.file}" alt="${esc(x.caption || '')}" loading="lazy">${x.caption ? `<figcaption>${esc(x.caption)}</figcaption>` : ''}</figure>`;
  }).join('\n');
}

function recModule(slug, others) {
  const recs = hashPick(slug, 3);
  return `<aside class="rec">
<h3>심심하면 이것도</h3>
<ul>
${recs.map(r => `<li><a href="${r.url}">${r.emoji} ${esc(r.label)}</a></li>`).join('\n')}
</ul>
${others.length ? `<h3>다른 웃긴 글</h3>
<ul>
${others.map(o => `<li><a href="/funny/${o.slug}/">😂 ${esc(o.title)}</a></li>`).join('\n')}
</ul>` : ''}
</aside>`;
}

// --- load posts ---
const posts = fs.readdirSync(SRC).filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8')))
  .sort((a, b) => b.date.localeCompare(a.date));

fs.mkdirSync(OUT, { recursive: true });

// --- post pages ---
for (const p of posts) {
  const url = `${SITE}/funny/${p.slug}/`;
  const others = posts.filter(o => o.slug !== p.slug).slice(0, 2);
  const jsonld = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: p.title, datePublished: p.date, inLanguage: 'ko',
    author: { '@type': 'Organization', name: 'cocy.io' },
    mainEntityOfPage: url,
  };
  const html = `${head({ title: `${p.title} — 지구반응`, desc: p.teaser, url, ogImage: p.ogImage ? SITE + p.ogImage : null, jsonld })}
<div class="wrap">
<header class="top"><a class="home" href="/funny/">🌏 지구반응</a></header>
<article>
<h1>${esc(p.title)}</h1>
<div class="meta"><span>${p.date}</span>${(p.tags || []).map(t => `<span class="tag">#${esc(t)}</span>`).join('')}</div>
${mediaHtml(p.media)}
<div class="body">${render(p.body)}</div>
<div class="src">원문: <a href="${p.source.url}" rel="nofollow noopener" target="_blank">${esc(p.source.label)}</a><br>번역·정리: <a href="/funny/">page.cocy.io/funny</a></div>
</article>
${recModule(p.slug, others)}
<footer class="foot"><a href="/funny/">← 목록으로</a> · <a href="https://page.cocy.io/">page.cocy.io</a></footer>
</div>
</body>
</html>`;
  fs.mkdirSync(path.join(OUT, p.slug), { recursive: true });
  fs.writeFileSync(path.join(OUT, p.slug, 'index.html'), html);
}

// --- index ---
{
  const url = `${SITE}/funny/`;
  const jsonld = {
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: '지구반응 — 해외 반응 번역 저장소', url, inLanguage: 'ko',
  };
  const html = `${head({ title: '지구반응 — 해외 반응 번역 저장소', desc: '레딧·유튜브 등 해외 커뮤니티의 반응과 화제를 한국어로 번역해 모아두는 곳. 모든 글에 원문 출처를 표기합니다.', url, jsonld })}
<div class="wrap">
<header class="hero"><h1>🌏 지구반응</h1><p>세계가 지금 뭐에 반응하는지, 한국어로 옮겨 담는 곳</p></header>
<main class="list">
${posts.map(p => `<a class="card" href="/funny/${p.slug}/">
<h2>${esc(p.title)}</h2>
<p>${esc(p.teaser)}</p>
<div class="meta"><span>${p.date}</span><span class="srcname">${esc(p.source.label.split(' — ')[0])}</span>${p.media && p.media.length ? '<span class="tag">' + (p.media[0].type === 'video' ? '🎬 영상' : '🖼 짤') + '</span>' : ''}</div>
</a>`).join('\n')}
</main>
<aside class="rec">
<h3>심심하면 이것도</h3>
<ul>
${RECS.slice(0, 4).map(r => `<li><a href="${r.url}">${r.emoji} ${esc(r.label)}</a></li>`).join('\n')}
</ul>
</aside>
<footer class="foot">번역·정리 <a href="https://page.cocy.io/">page.cocy.io</a> · 모든 글에 원문 출처를 표기합니다</footer>
</div>
</body>
</html>`;
  fs.writeFileSync(path.join(OUT, 'index.html'), html);
}

console.log(`generated ${posts.length} posts + index → public/funny/`);
