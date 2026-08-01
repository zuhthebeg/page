-- FanTrack: SUPER JUNIOR 그룹 콘텐츠 (정규앨범 + SUPER SHOW 투어) — 2026-08-01
-- 출처: 영문 위키백과 Super Junior discography / Super Show 각 문서 (병렬 리서치 후 교차확인)
-- 원칙: 확인 못 한 항목은 넣지 않는다. 리패키지/일본반/서브유닛 릴리스는 제외.
-- 번역값이 없는 필드는 NULL로 두고 로케일 폴백에 맡긴다(허위 번역 금지).

-- 1) 정규 앨범 1~12집 (13집 Super Junior25는 dh-sj-super25로 이미 존재 → 재사용)
INSERT OR IGNORE INTO content_units
  (id, title, title_localized_en, type, platform, year, air_date, category, scope, upcoming, created_at, updated_at) VALUES
  ('sj-alb-01','SuperJunior05 (Twins)', NULL,       'album','SUPER JUNIOR',2005,'2005-12-05','discography','group',0,unixepoch()*1000,unixepoch()*1000),
  ('sj-alb-02','Don''t Don',            NULL,       'album','SUPER JUNIOR',2007,'2007-09-20','discography','group',0,unixepoch()*1000,unixepoch()*1000),
  ('sj-alb-03','Sorry, Sorry',          NULL,       'album','SUPER JUNIOR',2009,'2009-03-12','discography','group',0,unixepoch()*1000,unixepoch()*1000),
  ('sj-alb-04','미인아',                'Bonamana', 'album','SUPER JUNIOR',2010,'2010-05-13','discography','group',0,unixepoch()*1000,unixepoch()*1000),
  ('sj-alb-05','Mr. Simple',            NULL,       'album','SUPER JUNIOR',2011,'2011-08-03','discography','group',0,unixepoch()*1000,unixepoch()*1000),
  ('sj-alb-06','Sexy, Free & Single',   NULL,       'album','SUPER JUNIOR',2012,'2012-07-04','discography','group',0,unixepoch()*1000,unixepoch()*1000),
  ('sj-alb-07','Mamacita',              NULL,       'album','SUPER JUNIOR',2014,'2014-09-01','discography','group',0,unixepoch()*1000,unixepoch()*1000),
  ('sj-alb-08','Devil',                 NULL,       'album','SUPER JUNIOR',2015,'2015-07-16','discography','group',0,unixepoch()*1000,unixepoch()*1000),
  ('sj-alb-09','Play',                  NULL,       'album','SUPER JUNIOR',2017,'2017-11-06','discography','group',0,unixepoch()*1000,unixepoch()*1000),
  ('sj-alb-10','Time Slip',             NULL,       'album','SUPER JUNIOR',2019,'2019-10-14','discography','group',0,unixepoch()*1000,unixepoch()*1000),
  ('sj-alb-11','The Renaissance',       NULL,       'album','SUPER JUNIOR',2021,'2021-03-16','discography','group',0,unixepoch()*1000,unixepoch()*1000),
  ('sj-alb-12','The Road',              NULL,       'album','SUPER JUNIOR',2023,'2023-01-06','discography','group',0,unixepoch()*1000,unixepoch()*1000);

-- 13집: 기존 행에 발매일 보강
UPDATE content_units SET air_date = '2025-07-08', category = 'discography', scope = 'group' WHERE id = 'dh-sj-super25';

-- 2) SUPER SHOW 투어. note는 공연 횟수 같은 수치 사실만.
INSERT OR IGNORE INTO content_units
  (id, title, type, platform, platform_en, platform_tw, year, air_date, category, scope, upcoming,
   note_public, note_public_en, note_public_tw, created_at, updated_at) VALUES
  ('sj-ss1','SUPER SHOW',                    'concert','콘서트','Concert','演唱會',2008,'2008-02-22','tour','group',0,'10회 공연','10 shows','共10場',unixepoch()*1000,unixepoch()*1000),
  ('sj-ss2','SUPER SHOW 2',                  'concert','콘서트','Concert','演唱會',2009,'2009-07-17','tour','group',0,'15회 공연','15 shows','共15場',unixepoch()*1000,unixepoch()*1000),
  ('sj-ss3','SUPER SHOW 3',                  'concert','콘서트','Concert','演唱會',2010,'2010-08-14','tour','group',0,'13개 도시 20회 공연','20 shows in 13 cities','13座城市共20場',unixepoch()*1000,unixepoch()*1000),
  ('sj-ss4','SUPER SHOW 4',                  'concert','콘서트','Concert','演唱會',2011,'2011-11-19','tour','group',0,'첫 월드투어 · 24회 공연','First world tour · 24 shows','首次世界巡演 · 共24場',unixepoch()*1000,unixepoch()*1000),
  ('sj-ss5','SUPER SHOW 5',                  'concert','콘서트','Concert','演唱會',2013,'2013-03-23','tour','group',0,'28회 공연','28 shows','共28場',unixepoch()*1000,unixepoch()*1000),
  ('sj-ss7','SUPER SHOW 7',                  'concert','콘서트','Concert','演唱會',2017,'2017-12-15','tour','group',0,'21회 공연','21 shows','共21場',unixepoch()*1000,unixepoch()*1000),
  ('sj-ss8','SUPER SHOW 8: Infinite Time',   'concert','콘서트','Concert','演唱會',2019,'2019-10-12','tour','group',0,'16회 공연','16 shows','共16場',unixepoch()*1000,unixepoch()*1000),
  ('sj-ss9','SUPER SHOW 9: Road',            'concert','콘서트','Concert','演唱會',2022,'2022-07-15','tour','group',0,'25회 공연','25 shows','共25場',unixepoch()*1000,unixepoch()*1000),
  ('sj-ss-spinoff','SUPER SHOW SPIN-OFF: Halftime','concert','콘서트','Concert','演唱會',2024,'2024-06-22','tour','group',0,NULL,NULL,NULL,unixepoch()*1000,unixepoch()*1000),
  ('sj-ss10','SUPER SHOW 10',                'concert','콘서트','Concert','演唱會',2025,'2025-08-22','tour','group',0,'데뷔 20주년 투어 · 33회 공연','20th anniversary tour · 33 shows','出道20週年巡演 · 共33場',unixepoch()*1000,unixepoch()*1000);

-- SUPER SHOW 6: 기존 동해 행(dh-ss6)을 그룹 투어 정본으로 승격. 투어 시작은 2014-09-19.
UPDATE content_units SET
  year = 2014, air_date = '2014-09-19', category = 'tour', scope = 'group',
  platform_en = 'Concert', platform_tw = '演唱會',
  note_public = '13개 도시 22회 공연', note_public_en = '22 shows in 13 cities', note_public_tw = '13座城市共22場'
WHERE id = 'dh-ss6';

-- 3) 그룹 프로필에 연결
INSERT OR IGNORE INTO content_celebrity (content_id, celebrity_id, role)
SELECT id, 'superjunior', NULL FROM content_units WHERE id LIKE 'sj-alb-%' OR id LIKE 'sj-ss%';
