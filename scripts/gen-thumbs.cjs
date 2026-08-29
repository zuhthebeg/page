#!/usr/bin/env node
// 쇼케이스 썸네일 생성기 — /api/sites의 published+listed 페이지를 모바일 뷰포트로 캡처
// usage: node scripts/gen-thumbs.cjs [slug ...]   (인자 없으면 전체)
// output: public/assets/shots/<slug>.webp (390px, ffmpeg 실패 시 .png)
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'public', 'shots');
const BASE = 'https://page.cocy.io';

(async () => {
  const { chromium } = require('playwright');
  fs.mkdirSync(OUT, { recursive: true });
  const only = process.argv.slice(2);
  const res = await fetch(BASE + '/api/sites');
  let sites = (await res.json()).sites || [];
  if (only.length) sites = sites.filter(s => only.includes(s.slug));

  const b = await chromium.launch();
  const ok = [], fail = [];
  for (const s of sites) {
    const p = await b.newPage({ viewport: { width: 390, height: 620 }, deviceScaleFactor: 2 });
    try {
      await p.goto(`${BASE}/${s.slug}`, { waitUntil: 'load', timeout: 25000 });
      await p.waitForTimeout(2500);
      const png = path.join(OUT, s.slug + '.png');
      await p.screenshot({ path: png });
      try {
        execSync(`ffmpeg -v error -y -i "${png}" -vf scale=390:-1 -quality 82 "${path.join(OUT, s.slug + '.webp')}"`);
        fs.unlinkSync(png);
      } catch { /* webp 실패 시 png 유지 */ }
      ok.push(s.slug);
    } catch (e) {
      fail.push(s.slug + ': ' + String(e).slice(0, 80));
    }
    await p.close();
  }
  await b.close();
  console.log('ok:', ok.length, ok.join(','));
  if (fail.length) console.log('FAIL:', fail.join(' | '));
})();
