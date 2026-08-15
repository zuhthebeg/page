#!/usr/bin/env node
/**
 * voicematch → FanTrack 단방향 동기화 SQL 생성기
 *   node scripts/fantrack-sync-voicematch.js            # 미등록분 SQL을 seed/에 출력
 *   node scripts/fantrack-sync-voicematch.js --dry      # 목록만 보고 파일은 안 만든다
 *
 * 왜: voicematch 가수 추가 요청은 유저가 직접 이름을 쳐서 남긴 수요 신호다.
 *     그 신호가 FanTrack 로스터로 안 넘어가서 8월 신규가 거의 통째로 누락돼 있었다.
 *     2026-08-01에 278팀을 한 번 수동 임포트한 전례(seed/fantrack-voicematch-import.sql)를 그대로 이어간다.
 *
 * 정책(전례와 동일):
 *   - 국내 풀만 넣는다. singers.json의 intl(해외)·jp(J-POP) 플래그가 붙은 가수는 제외.
 *   - 이름 en/tw는 voicematch i18n.js의 EN_NAMES/TW_NAMES 재사용(이미 수동 검증된 값).
 *   - 출연정보(content)는 넣지 않는다. 프로필만 깔고 콘텐츠는 나중에 검증해서 채운다.
 *   - INSERT OR IGNORE — 이미 있는 id는 건너뛴다.
 *   - sort_order는 비워둔다(NULL). fantrack-gen은 상위 60건만 사전렌더하므로
 *     콘텐츠 없는 신규가 크롤러용 프리렌더를 밀어내지 않는다.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const VM = '/mnt/c/Users/user/games/voicematch';
const API = 'https://page.cocy.io/api/fantrack/celebrities';
const OUT = path.join(__dirname, '..', 'seed', 'fantrack-voicematch-sync.sql');
const dry = process.argv.includes('--dry');

const singers = JSON.parse(fs.readFileSync(path.join(VM, 'singers.json'), 'utf8'));
const catalog = JSON.parse(fs.readFileSync(path.join(VM, 'catalog.json'), 'utf8')).artists;
const addedBySlug = Object.fromEntries(catalog.map((a) => [a.slug, a.added]));

// i18n.js는 브라우저용이라 그대로 require할 수 없다. 샌드박스에서 실행해 이름표만 꺼낸다.
const ctx = { window: {}, navigator: { language: 'ko' }, localStorage: { getItem: () => null, setItem: () => {} },
  location: { search: '', pathname: '/' }, document: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(VM, 'i18n.js'), 'utf8')
  + ';globalThis.__EN=EN_NAMES;globalThis.__TW=TW_NAMES;', ctx);
const EN = ctx.__EN, TW = ctx.__TW;

const KIND = { '그룹': 'group', '밴드': 'group', '솔로': 'person', '듀오': 'group' };
const q = (v) => (v == null || v === '' ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);

(async () => {
  const res = await fetch(API);
  const have = new Set((await res.json()).celebrities.map((c) => c.id));

  const missing = singers
    .filter((s) => !s.intl && !s.jp && !have.has(s.slug))
    .sort((a, b) => (addedBySlug[a.slug] || '').localeCompare(addedBySlug[b.slug] || ''));

  console.log(`FanTrack 등재 ${have.size}명 / voicematch 국내풀 ${singers.filter((s) => !s.intl && !s.jp).length}팀`);
  console.log(`미등록 ${missing.length}팀`);
  for (const s of missing) {
    console.log(`  ${addedBySlug[s.slug] || '-'}  ${s.slug.padEnd(16)} ${s.name}  (${EN[s.slug] || '-'} / ${TW[s.slug] || '-'})`);
  }
  if (!missing.length || dry) return;

  const rows = missing.map((s) =>
    `  (${q(s.slug)},${q(s.name)},${q(EN[s.slug] || s.name)},${q(TW[s.slug])},NULL,` +
    `${q(KIND[s.kind] || 'person')},NULL,unixepoch()*1000,unixepoch()*1000)`).join(',\n');

  fs.writeFileSync(OUT,
    `-- voicematch → FanTrack 동기화 (자동 생성: scripts/fantrack-sync-voicematch.js)\n` +
    `-- 대상 ${missing.length}팀. 프로필만 생성하고 출연정보는 넣지 않는다.\n` +
    `INSERT OR IGNORE INTO celebrities\n` +
    `  (id, name_ko, name_en, name_tw, group_name, kind, sort_order, created_at, updated_at) VALUES\n` +
    rows + ';\n');
  console.log(`\n생성: ${OUT}`);
  console.log(`적용: npx wrangler d1 execute page-db --remote --file=seed/fantrack-voicematch-sync.sql`);
})();
