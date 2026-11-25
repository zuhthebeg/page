#!/usr/bin/env node
// Usage: node scripts/gen-seo.cjs [public-directory]
// Use the deploy-generated public feed.json (with the D1 visibility filter).
const fs = require('node:fs');
const path = require('node:path');

const dir = path.resolve(process.argv[2] || path.join(__dirname, '../public'));
const origin = 'https://page.cocy.io';
const { items } = JSON.parse(fs.readFileSync(path.join(dir, 'feed.json'), 'utf8'));
if (!Array.isArray(items)) throw new Error('feed.json: items must be an array');

// Reviewed static entries outside gen-feed's first-level public report listing.
const manual = [
  ['', '2026-07-08', 'page.cocy.io 홈', '서비스 소개와 페이지 만들기 시작.'],
  ['guide/mobile-invitation', '2026-06-11', '모바일 청첩장 만들기 가이드', '모바일 청첩장을 무료로 만드는 법과 체크리스트.'],
  ['cocy', '2026-06-10'],
];
const locales = new Map([
  ['onepiece-ending', ['en', 'ja']], ['tzuyang-tokyo', ['en', 'ja', 'tw']],
  ['aggro', ['en', 'tw']], ['footprints', ['en', 'tw']],
]);
const personal = new Set(['momo', 'ipcoder', 'oshiyeon', 'xm3-aircon', 'kongi']);
const personalVertical = /^(?:memorial|proposal|wedding|private|family)$/i;
const excludedPrefix = /^(?:admin|edit|api|new|family|funny|marryme|login|auth)(?:-|$)|(?:^|-)wedding(?:-|$)|-[\da-f]{6,}$/i;
const validPath = /^(?:[a-z\d]+(?:-[a-z\d]+)*)(?:\/[a-z\d]+(?:-[a-z\d]+)*)*$/;

// Cloudflare Pages _headers rules can carry a noindex directive too.
const noindex = /(?:^|[\s,;:])(?:noindex|none)(?=$|[\s,;])/i;
const escapeRE = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const headerRules = [];
let rule;
const headers = path.join(dir, '_headers');
if (fs.existsSync(headers)) {
  for (const l of fs.readFileSync(headers, 'utf8').split(/\r?\n/)) {
    if (/^(\/|https:\/\/)/.test(l)) rule = l.trim();
    else if (rule && /^\s+X-Robots-Tag\s*:/i.test(l) && noindex.test(l.trim().split(/:(.*)/s)[1])) {
      const route = rule.replace(new RegExp(`^${escapeRE(origin)}`), '');
      const pattern = route.split(/(\*|:[\w-]+)/).map(p => p === '*' ? '.*' : p.startsWith(':') ? '[^/]+' : escapeRE(p)).join('');
      headerRules.push(new RegExp(`^${pattern}$`));
    }
  }
}
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)]
  .map(([, k, a, b, c]) => [k.toLowerCase(), a ?? b ?? c]));
const route = slug => slug ? `/${slug}/` : '/';
const eligible = slug => {
  if (slug !== '' && (!validPath.test(slug) || slug.split('/').some(s => excludedPrefix.test(s) || personal.has(s)))) return false;
  const urlPath = route(slug);
  if (headerRules.some(r => [urlPath, `${urlPath}index.html`, urlPath.slice(0, -1)].some(p => r.test(p)))) return false;
  const file = path.join(dir, slug, 'index.html');
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return false;
  const head = fs.readFileSync(file, 'utf8').split(/<\/head\s*>/i, 1)[0];
  return ![...head.matchAll(/<meta\b[^>]*>/gi)].some(([tag]) => {
    const a = attributes(tag);
    return /^(?:robots|\w*bot(?:-news)?)$/i.test(a.name || '') && noindex.test(a.content || '');
  });
};

const entries = new Map();
const skipped = [];
for (const item of items) {
  const { slug, title, desc, date, vertical } = item;
  if (typeof slug !== 'string' || !slug || personalVertical.test(vertical || '') || !eligible(slug)) {
    skipped.push(slug); continue;
  }
  if (entries.has(slug)) throw new Error(`feed.json: duplicate slug ${slug}`);
  entries.set(slug, { lastmod: /^\d{4}-\d\d-\d\d(?:T|$)/.test(date) ? date.slice(0, 10) : '', title, desc, vertical });
}
const urls = new Map();
for (const [slug, lastmod] of manual) if (eligible(slug)) urls.set(slug, lastmod);
for (const [slug, { lastmod }] of entries) {
  urls.set(slug, lastmod);
  for (const locale of locales.get(slug) || []) {
    const localized = `${slug}/${locale}`;
    if (eligible(localized)) urls.set(localized, '');
  }
}

// urlPath is restricted to lowercase ASCII slug segments, so no XML escaping is needed.
const xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
for (const [slug, date] of urls) {
  xml.push('  <url>', `    <loc>${origin}${route(slug)}</loc>`);
  if (date) xml.push(`    <lastmod>${date}</lastmod>`);
  xml.push('  </url>');
}
xml.push('</urlset>', '');

const oneLine = s => String(s || '').replace(/\s+/g, ' ').trim();
const mdLabel = s => oneLine(s).replace(/[\\\[\]]/g, '\\$&').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const link = (slug, title, desc) => `- [${mdLabel(title)}](${origin}${route(slug)})${oneLine(desc) ? `: ${oneLine(desc)}` : ''}`;
const llms = [
  '# page.cocy.io', '',
  '> 청첩장·메뉴판·포트폴리오 등 목적에 맞춘 단 하나의 웹페이지를 LLM이 직접 만들어 주는 서비스. 뻔한 템플릿이 아니라 사용자의 사연·정보를 바탕으로 디자인·문구·구조를 새로 생성하고, page.cocy.io/<주소>로 바로 서빙·편집한다.', '',
  '## 서비스', ...manual.filter(([slug, , title]) => !slug && title && urls.has(slug)).map(([slug, , title, desc]) => link(slug, title, desc)), '',
  '## 활용 예', '- 청첩장(결혼식 안내·오시는 길·갤러리)', '- 돌잔치·생일 초대장', '- 식당 메뉴판', '- 개인 포트폴리오·프로필', '',
  '## 가이드', ...manual.filter(([slug, , title]) => slug && title && urls.has(slug)).map(([slug, , title, desc]) => link(slug, title, desc)), '',
  '## 분석 보고서',
];
const tools = [];
for (const [slug, { title, desc, vertical }] of entries) {
  (vertical && vertical !== 'report' ? tools : llms).push(link(slug, title || slug, desc));
}
if (tools.length) llms.push('', '## 도구·기타 페이지', ...tools);
llms.push('');
fs.writeFileSync(path.join(dir, 'sitemap.xml'), xml.join('\n'));
fs.writeFileSync(path.join(dir, 'llms.txt'), llms.join('\n'));
console.log(`SEO: ${urls.size} sitemap URLs, ${entries.size} public feed pages, ${skipped.length} excluded: ${skipped.join(' ')}`);
