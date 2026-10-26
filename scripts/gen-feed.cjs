#!/usr/bin/env node
// feed.json 생성 — 메인(/) 최신순 목록의 원본.
// 대상 = git HEAD에 커밋된 public/<slug>/index.html (배포되는 것과 동일). 미커밋 페이지는 안 나온다.
// 날짜 = git 최초 추가 커밋, 제목/설명 = 각 페이지 <title>/meta description.
// 제외: 시스템 디렉터리, noindex 페이지(meta 또는 _headers), D1 sites.listed=0, EXCLUDE.
// 사용: node scripts/gen-feed.cjs [--out <path>] [--no-d1]   (기본 out = public/feed.json)
// 배포는 scripts/deploy.sh 가 이걸 자동 실행한다.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const OUT = path.resolve(arg('--out') || path.join(ROOT, 'public', 'feed.json'));
const SYSTEM = new Set(['admin', 'edit', 'new', 'shots', 'showcase', 'assets']);
const EXCLUDE = new Set([]); // 수동 숨김 슬러그

const sh = (cmd) => execSync(cmd, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20 });
const show = (p) => sh(`git show "HEAD:${p}"`);

// HEAD에 있는 페이지
const slugs = sh('git ls-tree -r --name-only HEAD public')
  .split('\n').map((l) => (l.match(/^public\/([^/]+)\/index\.html$/) || [])[1]).filter(Boolean);

// slug → 최초 추가 시각 (git log는 최신→과거 순이므로 마지막 값이 최초)
const added = {};
let cur = null;
for (const line of sh('git log --diff-filter=A --name-only --format=@%aI HEAD -- "public/*/index.html"').split('\n')) {
  if (line.startsWith('@')) cur = line.slice(1);
  else if (line.trim()) {
    const m = line.match(/^public\/([^/]+)\/index\.html$/);
    if (m) added[m[1]] = cur;
  }
}

// D1: 비공개 슬러그 + vertical
const d1 = {};
if (!process.argv.includes('--no-d1')) {
  try {
    const out = sh('npx wrangler d1 execute page-db --remote --json --command "SELECT slug, listed, vertical FROM sites"');
    for (const r of JSON.parse(out)[0].results) d1[r.slug] = r;
  } catch (e) {
    console.error('D1 조회 실패 — 비공개 필터 없이 진행 불가. 강제하려면 --no-d1');
    process.exit(1);
  }
}

let headers = '';
try { headers = show('public/_headers'); } catch {}
const noindexHdr = new Set([...headers.matchAll(/^\/([^/\s]+)\/\*\s*\n\s*X-Robots-Tag:[^\n]*noindex/gm)].map((m) => m[1]));

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
const cleanTitle = (t) => t
  .replace(/\s*[|·—–-]\s*(page\.cocy\.io|cocy(\s*실험실)?)\s*$/i, '')
  .replace(/^page\.cocy\.io\s*[|·—–-]\s*/i, '').trim();

const items = [];
const skipped = [];
for (const slug of slugs) {
  if (SYSTEM.has(slug) || slug.startsWith('_')) continue;
  const html = show(`public/${slug}/index.html`);
  const why =
    EXCLUDE.has(slug) ? 'exclude' :
    noindexHdr.has(slug) || /<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html) ? 'noindex' :
    d1[slug] && !d1[slug].listed ? 'unlisted' : null;
  if (why) { skipped.push(`${slug}(${why})`); continue; }
  const title = cleanTitle(decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || slug));
  const desc = decode((html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i) || [])[1] || '');
  items.push({ slug, title: title || slug, desc, date: added[slug] || null, vertical: (d1[slug] && d1[slug].vertical) || null });
}
items.sort((a, b) => ((a.date || '') < (b.date || '') ? 1 : -1));

fs.writeFileSync(OUT, JSON.stringify({ generated: new Date().toISOString(), items }) + '\n');
console.log(`${path.relative(ROOT, OUT)}: ${items.length}개, 제외 ${skipped.length}개: ${skipped.join(' ')}`);
