-- FanTrack: SUPER JUNIOR 본체 + 유닛 + 멤버 프로필 (2026-08-01)
-- 원칙: 확인된 사실만. 소속사/생일 등 미검증 항목은 NULL로 두고 나중에 채운다.
-- 번체 표기는 zh.wikipedia 문서명 기준으로 교차검증함.

-- 프로필 종류 구분 (index 페이지 그룹핑용)
ALTER TABLE celebrities ADD COLUMN kind TEXT;               -- group | unit | person
ALTER TABLE celebrities ADD COLUMN sort_order INTEGER;      -- 목록 노출 순서

UPDATE celebrities SET kind = 'person', sort_order = 60 WHERE id = 'donghae';

INSERT OR IGNORE INTO celebrities (id, name_ko, name_en, name_tw, group_name, kind, sort_order, created_at, updated_at) VALUES
  ('superjunior',      '슈퍼주니어', 'SUPER JUNIOR',           'Super Junior',           NULL,           'group',  1,  unixepoch()*1000, unixepoch()*1000),
  ('superjunior-de',   '슈퍼주니어-D&E', 'SUPER JUNIOR-D&E',   'Super Junior-D&E',       'SUPER JUNIOR', 'unit',   10, unixepoch()*1000, unixepoch()*1000),
  ('superjunior-kry',  '슈퍼주니어-K.R.Y.', 'SUPER JUNIOR-K.R.Y.', 'Super Junior-K.R.Y.', 'SUPER JUNIOR', 'unit',  11, unixepoch()*1000, unixepoch()*1000),
  ('superjunior-83z',  '슈퍼주니어-83z', 'SUPER JUNIOR-83z',   'Super Junior-83z',       'SUPER JUNIOR', 'unit',   12, unixepoch()*1000, unixepoch()*1000),
  ('leeteuk',   '이특', 'Leeteuk',   '利特',   'SUPER JUNIOR', 'person', 51, unixepoch()*1000, unixepoch()*1000),
  ('heechul',   '희철', 'Heechul',   '金希澈', 'SUPER JUNIOR', 'person', 52, unixepoch()*1000, unixepoch()*1000),
  ('yesung',    '예성', 'Yesung',    '藝聲',   'SUPER JUNIOR', 'person', 53, unixepoch()*1000, unixepoch()*1000),
  ('shindong',  '신동', 'Shindong',  '神童',   'SUPER JUNIOR', 'person', 54, unixepoch()*1000, unixepoch()*1000),
  ('eunhyuk',   '은혁', 'Eunhyuk',   '銀赫',   'SUPER JUNIOR', 'person', 55, unixepoch()*1000, unixepoch()*1000),
  ('siwon',     '시원', 'Siwon',     '崔始源', 'SUPER JUNIOR', 'person', 56, unixepoch()*1000, unixepoch()*1000),
  ('ryeowook',  '려욱', 'Ryeowook',  '厲旭',   'SUPER JUNIOR', 'person', 57, unixepoch()*1000, unixepoch()*1000),
  ('kyuhyun',   '규현', 'Kyuhyun',   '圭賢',   'SUPER JUNIOR', 'person', 58, unixepoch()*1000, unixepoch()*1000);

UPDATE celebrities SET kind='group' WHERE id='superjunior';

-- 기존 콘텐츠 연결 (이미 DB에 있는 사실만 재사용, 새 출연정보를 만들지 않는다)
-- D&E 앨범 4종 → D&E 유닛 + 은혁
INSERT OR IGNORE INTO content_celebrity (content_id, celebrity_id, role) VALUES
  ('dh-de-timeless',  'superjunior-de', NULL),
  ('dh-de-danger',    'superjunior-de', NULL),
  ('dh-de-style',     'superjunior-de', NULL),
  ('dh-de-boutyou',   'superjunior-de', NULL),
  ('dh-de-timeless',  'eunhyuk', NULL),
  ('dh-de-danger',    'eunhyuk', NULL),
  ('dh-de-style',     'eunhyuk', NULL),
  ('dh-de-boutyou',   'eunhyuk', NULL);

-- Super Junior25 앨범 / SUPER SHOW 6 → 그룹
INSERT OR IGNORE INTO content_celebrity (content_id, celebrity_id, role) VALUES
  ('dh-sj-super25', 'superjunior', NULL),
  ('dh-ss6',        'superjunior', NULL);

-- 아는 형님·주간 아이돌은 note_public에 기록된 공동출연자 그대로 연결
INSERT OR IGNORE INTO content_celebrity (content_id, celebrity_id, role) VALUES
  ('dh-knowingbros', 'eunhyuk',  'guest'),
  ('dh-knowingbros', 'shindong', 'guest'),
  ('dh-knowingbros', 'leeteuk',  'guest'),
  ('dh-knowingbros', 'yesung',   'guest'),
  ('dh-knowingbros', 'heechul',  'guest'),
  ('dh-weeklyidol',  'eunhyuk',  'guest'),
  ('dh-weeklyidol',  'shindong', 'guest'),
  ('dh-weeklyidol',  'leeteuk',  'guest'),
  ('dh-weeklyidol',  'yesung',   'guest'),
  ('dh-weeklyidol',  'heechul',  'guest');
