#!/usr/bin/env node
/**
 * FanTrack 프로필 페이지 생성기
 *   node scripts/fantrack-gen.js
 *
 * public/fantrack/c/donghae/ 를 템플릿으로 삼아 ROSTER의 각 slug 디렉터리를 만든다.
 * 페이지 로직은 전부 API + i18n.js에서 오므로, 슬러그/메타태그만 치환하면 된다.
 * 이미 있는 디렉터리는 index.html만 갱신(직접 손댄 커스텀 파일을 덮지 않도록 manifest/sw는 없을 때만 생성).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'public', 'fantrack', 'c');
const TPL = path.join(ROOT, 'donghae');

// slug, 한국어 표시명, 그룹 표기(없으면 null)
const ROSTER = [
  ['superjunior', '슈퍼주니어', null],
  ['superjunior-de', '슈퍼주니어-D&E', 'SUPER JUNIOR'],
  ['superjunior-kry', '슈퍼주니어-K.R.Y.', 'SUPER JUNIOR'],
  ['superjunior-83z', '슈퍼주니어-83z', 'SUPER JUNIOR'],
  ['leeteuk', '이특', 'SUPER JUNIOR'],
  ['heechul', '희철', 'SUPER JUNIOR'],
  ['yesung', '예성', 'SUPER JUNIOR'],
  ['shindong', '신동', 'SUPER JUNIOR'],
  ['eunhyuk', '은혁', 'SUPER JUNIOR'],
  ['siwon', '시원', 'SUPER JUNIOR'],
  ['ryeowook', '려욱', 'SUPER JUNIOR'],
  ['kyuhyun', '규현', 'SUPER JUNIOR'],
];

const tplHtml = fs.readFileSync(path.join(TPL, 'index.html'), 'utf8');
const tplSw = fs.readFileSync(path.join(TPL, 'sw.js'), 'utf8');
const tplIcon = fs.readFileSync(path.join(TPL, 'icon.svg'), 'utf8');

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

for (const [slug, nameKo, groupName] of ROSTER) {
  const dir = path.join(ROOT, slug);
  fs.mkdirSync(dir, { recursive: true });

  const label = groupName ? `${nameKo}(${groupName})` : nameKo;
  const desc = groupName
    ? `${groupName} ${nameKo} 출연정보 모아보기 — 방송·유튜브·OTT. FanTrack.`
    : `${nameKo} 출연정보 모아보기 — 방송·유튜브·OTT. FanTrack.`;

  let html = tplHtml
    .replace(/const SLUG = 'donghae';/, `const SLUG = '${slug}';`)
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(label)} — FanTrack</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">`)
    .replace(/\/fantrack\/c\/donghae/g, `/fantrack/c/${slug}`);

  fs.writeFileSync(path.join(dir, 'index.html'), html);

  const manifest = {
    name: `${label} — FanTrack`,
    short_name: `${nameKo} FanTrack`,
    description: desc.replace(' FanTrack.', '').trim(),
    id: `/fantrack/c/${slug}/`,
    start_url: `/fantrack/c/${slug}/`,
    scope: `/fantrack/c/${slug}/`,
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#141221',
    theme_color: '#141221',
    lang: 'ko',
    categories: ['entertainment'],
    icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
  };
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

  fs.writeFileSync(
    path.join(dir, 'sw.js'),
    tplSw.replace(/fantrack-donghae-v2/, `fantrack-${slug}-v2`).replace(/\/fantrack\/c\/donghae\//g, `/fantrack/c/${slug}/`)
  );

  if (!fs.existsSync(path.join(dir, 'icon.svg'))) fs.writeFileSync(path.join(dir, 'icon.svg'), tplIcon);

  console.log('generated', slug);
}
