-- FanTrack: SUPER JUNIOR 유닛 콘텐츠 (D&E / K.R.Y. / 83z) — 2026-08-01
-- 출처: en/ko/ja 위키백과 교차확인. 확인 못 한 항목(공연 횟수, D&E 2017~2018 월간싱글 등)은 넣지 않음.
-- 번체 제목은 검증 못 해서 비워둠 → tw 로케일은 영문으로 폴백된다.

-- ─────────────────────────────────────────────────────────────
-- 0) 기존 D&E 4건 정정. 전부 제목/연도가 틀렸었다.
--    'D&E ' 접두어는 공식 제목이 아니라 우리가 붙인 것이었음.
-- ─────────────────────────────────────────────────────────────

-- TIMELESS는 D&E 릴리스가 아니라 SUPER JUNIOR 정규 9집 Time_Slip의 리패키지(2020-01-28).
UPDATE content_units SET
  title = 'Timeless', title_localized_en = NULL, platform = 'SUPER JUNIOR',
  year = 2020, air_date = '2020-01-28', category = 'discography', scope = 'group',
  note_public = '정규 9집 Time_Slip 리패키지', note_public_en = 'Repackage of the 9th studio album Time_Slip'
WHERE id = 'dh-de-timeless';
DELETE FROM content_celebrity WHERE content_id = 'dh-de-timeless' AND celebrity_id IN ('superjunior-de','eunhyuk','donghae');
INSERT OR IGNORE INTO content_celebrity (content_id, celebrity_id, role) VALUES ('dh-de-timeless','superjunior',NULL);

-- 'Bout You: 2015 → 2018-08-16 한국 2번째 EP
UPDATE content_units SET title = '''Bout You', year = 2018, air_date = '2018-08-16',
  category = 'discography', note_public = '한국 2번째 EP', note_public_en = '2nd Korean EP'
WHERE id = 'dh-de-boutyou';

-- Danger: 2018 → 2019-04-15 한국 3번째 EP
UPDATE content_units SET title = 'Danger', year = 2019, air_date = '2019-04-15',
  category = 'discography', note_public = '한국 3번째 EP · 디지털/MV는 4/14', note_public_en = '3rd Korean EP · digital & MV on Apr 14'
WHERE id = 'dh-de-danger';

-- Style: 2017 → 2018-08-08 일본 정규
UPDATE content_units SET title = 'Style', year = 2018, air_date = '2018-08-08',
  category = 'discography', note_public = '일본 정규 앨범', note_public_en = 'Japanese studio album'
WHERE id = 'dh-de-style';

-- ─────────────────────────────────────────────────────────────
-- 1) D&E 릴리스
-- ─────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO content_units
  (id, title, title_localized_en, type, platform, year, air_date, category, scope, upcoming,
   note_public, note_public_en, created_at, updated_at) VALUES
  ('de-oppaoppa-kr','떴다 오빠','Oppa, Oppa','album','SUPER JUNIOR-D&E',2011,'2011-12-16','discography','group',0,'한국 디지털 싱글','Korean digital single',unixepoch()*1000,unixepoch()*1000),
  ('de-oppaoppa-jp','Oppa, Oppa',NULL,'album','SUPER JUNIOR-D&E',2012,'2012-04-04','discography','group',0,'일본 싱글','Japanese single',unixepoch()*1000,unixepoch()*1000),
  ('de-iwannadance','I Wanna Dance',NULL,'album','SUPER JUNIOR-D&E',2013,'2013-06-19','discography','group',0,'일본 싱글','Japanese single',unixepoch()*1000,unixepoch()*1000),
  ('de-stillyou','아직도 난','Still You','album','SUPER JUNIOR-D&E',2013,'2013-12-18','discography','group',0,'한국 디지털 싱글','Korean digital single',unixepoch()*1000,unixepoch()*1000),
  ('de-rideme','Ride Me',NULL,'album','SUPER JUNIOR-D&E',2014,'2014-02-26','discography','group',0,'일본 정규 앨범','Japanese studio album',unixepoch()*1000,unixepoch()*1000),
  ('de-skeleton','Skeleton',NULL,'album','SUPER JUNIOR-D&E',2014,'2014-08-06','discography','group',0,'일본 싱글','Japanese single',unixepoch()*1000,unixepoch()*1000),
  ('de-beatgoeson','The Beat Goes On',NULL,'album','SUPER JUNIOR-D&E',2015,'2015-03-06','discography','group',0,'한국 1번째 미니앨범 · 실물반 3/9','1st Korean mini album · physical Mar 9',unixepoch()*1000,unixepoch()*1000),
  ('de-present','Present',NULL,'album','SUPER JUNIOR-D&E',2015,'2015-04-01','discography','group',0,'일본 미니앨범','Japanese mini album',unixepoch()*1000,unixepoch()*1000),
  ('de-letsgetiton','Let''s Get It On',NULL,'album','SUPER JUNIOR-D&E',2015,'2015-09-30','discography','group',0,'일본 싱글','Japanese single',unixepoch()*1000,unixepoch()*1000),
  ('de-badblood','Bad Blood',NULL,'album','SUPER JUNIOR-D&E',2020,'2020-09-03','discography','group',0,'한국 4번째 EP','4th Korean EP',unixepoch()*1000,unixepoch()*1000),
  ('de-wings','Wings',NULL,'album','SUPER JUNIOR-D&E',2020,'2020-11-25','discography','group',0,'일본 싱글','Japanese single',unixepoch()*1000,unixepoch()*1000),
  ('de-countdown','Countdown',NULL,'album','SUPER JUNIOR-D&E',2021,'2021-11-02','discography','group',0,'한국 정규 1집','1st Korean studio album',unixepoch()*1000,unixepoch()*1000),
  ('de-606','606',NULL,'album','SUPER JUNIOR-D&E',2024,'2024-03-26','discography','group',0,'한국 EP','Korean EP',unixepoch()*1000,unixepoch()*1000),
  ('de-youandme','You&Me',NULL,'album','SUPER JUNIOR-D&E',2024,'2024-07-31','discography','group',0,'일본 미니앨범','Japanese mini album',unixepoch()*1000,unixepoch()*1000),
  ('de-inevitable','Inevitable',NULL,'album','SUPER JUNIOR-D&E',2024,'2024-09-25','discography','group',0,'한국 6번째 EP · 리패키지 2024-11-26','6th Korean EP · repackage Nov 26, 2024',unixepoch()*1000,unixepoch()*1000);

-- 2) D&E 투어 (공연 횟수는 출처에 없어서 넣지 않음)
INSERT OR IGNORE INTO content_units
  (id, title, type, platform, platform_en, platform_tw, year, air_date, category, scope, upcoming,
   note_public, note_public_en, created_at, updated_at) VALUES
  ('de-tour-jp1','Super Junior D&E The 1st Japan Tour 2014','concert','콘서트','Concert','演唱會',2014,NULL,'tour','group',0,'2014.3~5 일본','Mar–May 2014, Japan',unixepoch()*1000,unixepoch()*1000),
  ('de-tour-jp2','Super Junior D&E The 2nd Japan Tour','concert','콘서트','Concert','演唱會',2015,NULL,'tour','group',0,'2015.4 사이타마·오사카·나고야·후쿠오카','Apr 2015 · Saitama, Osaka, Nagoya, Fukuoka',unixepoch()*1000,unixepoch()*1000),
  ('de-tour-present','Super Junior D&E Asia Tour 2015 -Present-','concert','콘서트','Concert','演唱會',2015,NULL,'tour','group',0,'타이베이·홍콩·상하이·방콕','Taipei, Hong Kong, Shanghai, Bangkok',unixepoch()*1000,unixepoch()*1000),
  ('de-tour-style','Super Junior-D&E Japan Tour 2018 ~Style~','concert','콘서트','Concert','演唱會',2018,NULL,'tour','group',0,'2018.9~11','Sep–Nov 2018',unixepoch()*1000,unixepoch()*1000),
  ('de-tour-thede','The D&E','concert','콘서트','Concert','演唱會',2019,'2019-04-13','tour','group',0,'서울 4/13~14 · 이후 쿠알라룸푸르·방콕·타이베이·홍콩·도쿄','Seoul Apr 13–14, then Kuala Lumpur, Bangkok, Taipei, Hong Kong, Tokyo',unixepoch()*1000,unixepoch()*1000),
  ('de-tour-delight','D&E World Tour Fancon "DElight Party"','concert','콘서트','Concert','演唱會',2023,NULL,'tour','group',0,'2023.6~12 아시아·오세아니아·북미·중동','Jun–Dec 2023 · Asia, Oceania, North America, Middle East',unixepoch()*1000,unixepoch()*1000),
  ('de-tour-departure','Departure Japan Tour','concert','콘서트','Concert','演唱會',2024,NULL,'tour','group',0,'2024.4~6','Apr–Jun 2024',unixepoch()*1000,unixepoch()*1000),
  ('de-tour-eclipse','Eclipse World Tour','concert','콘서트','Concert','演唱會',2024,NULL,'tour','group',0,'2024.9~2025.1','Sep 2024 – Jan 2025',unixepoch()*1000,unixepoch()*1000);

-- ─────────────────────────────────────────────────────────────
-- 3) K.R.Y.
-- ─────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO content_units
  (id, title, title_localized_en, type, platform, platform_en, platform_tw, year, air_date, category, scope, upcoming,
   note_public, note_public_en, created_at, updated_at) VALUES
  ('kry-promiseyou','Promise You',NULL,'album','SUPER JUNIOR-K.R.Y.',NULL,NULL,2013,'2013-01-23','discography','group',0,'일본 싱글','Japanese single',unixepoch()*1000,unixepoch()*1000),
  ('kry-joinhands','Join Hands',NULL,'album','SUPER JUNIOR-K.R.Y.',NULL,NULL,2015,'2015-08-05','discography','group',0,'일본 싱글','Japanese single',unixepoch()*1000,unixepoch()*1000),
  ('kry-whenwewereus','푸르게 빛나던 우리의 계절','When We Were Us','album','SUPER JUNIOR-K.R.Y.',NULL,NULL,2020,'2020-06-08','discography','group',0,'한국 1번째 EP · 2006년 데뷔 이후 첫 앨범','1st Korean EP · first release since their 2006 debut',unixepoch()*1000,unixepoch()*1000),
  ('kry-traveler','Traveler',NULL,'album','SUPER JUNIOR-K.R.Y.',NULL,NULL,2020,NULL,'discography','group',0,'일본 싱글','Japanese single',unixepoch()*1000,unixepoch()*1000),
  ('kry-con1','Super Junior-K.R.Y. The 1st Concert',NULL,'concert','콘서트','Concert','演唱會',2010,NULL,'tour','group',0,'2010~2011 · 일본 도쿄·고베·후쿠오카','2010–2011 · Japan legs in Tokyo, Kobe, Fukuoka',unixepoch()*1000,unixepoch()*1000),
  ('kry-winter2012','Super Junior-K.R.Y. Special Winter Concert 2012',NULL,'concert','콘서트','Concert','演唱會',2012,NULL,'tour','group',0,'2012~2013 · 요코하마·고베·도쿄(부도칸)','2012–2013 · Yokohama, Kobe, Tokyo (Nippon Budokan)',unixepoch()*1000,unixepoch()*1000),
  ('kry-jp2015','Super Junior-K.R.Y. Japan Tour 2015 ~phonograph~',NULL,'concert','콘서트','Concert','演唱會',2015,NULL,'tour','group',0,'2015.6~7 · 요코하마·고베·후쿠오카·나고야','Jun–Jul 2015 · Yokohama, Kobe, Fukuoka, Nagoya',unixepoch()*1000,unixepoch()*1000),
  ('kry-asia2015','Super Junior-K.R.Y. Asia Tour ~phonograph~',NULL,'concert','콘서트','Concert','演唱會',2015,NULL,'tour','group',0,'2015~2016','2015–2016',unixepoch()*1000,unixepoch()*1000),
  ('kry-beyondlive','푸르게 빛나는 우리의 계절 (The Moment With Us)','The Moment With Us','concert','Beyond LIVE','Beyond LIVE','Beyond LIVE',2020,NULL,'tour','group',0,'온라인 콘서트','Online concert',unixepoch()*1000,unixepoch()*1000);

-- ─────────────────────────────────────────────────────────────
-- 4) 83z
-- ─────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO content_units
  (id, title, title_localized_en, type, platform, platform_en, platform_tw, year, air_date, category, scope, upcoming,
   note_public, note_public_en, created_at, updated_at) VALUES
  ('83z-promise','너를 위한 약속','Promise','album','SUPER JUNIOR-83z',NULL,NULL,2026,'2026-07-13','discography','group',0,'데뷔 미니앨범 · 6곡','Debut mini album · 6 tracks',unixepoch()*1000,unixepoch()*1000),
  ('83z-fancon','2026 SUPER JUNIOR-83z FANCON TOUR [1983]',NULL,'concert','콘서트','Concert','演唱會',2026,'2026-07-24','tour','group',0,'서울 7/24~26 · 이후 도쿄·방콕·홍콩·쿠알라룸푸르·마카오·가오슝·싱가포르·타이베이(~11월)','Seoul Jul 24–26, then Tokyo, Bangkok, Hong Kong, Kuala Lumpur, Macau, Kaohsiung, Singapore, Taipei through Nov 2026',unixepoch()*1000,unixepoch()*1000);

-- ─────────────────────────────────────────────────────────────
-- 5) 유닛/멤버 연결
-- ─────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO content_celebrity (content_id, celebrity_id, role)
SELECT id, 'superjunior-de', NULL FROM content_units WHERE id LIKE 'de-%';
INSERT OR IGNORE INTO content_celebrity (content_id, celebrity_id, role)
SELECT id, 'donghae', NULL FROM content_units WHERE id LIKE 'de-%';
INSERT OR IGNORE INTO content_celebrity (content_id, celebrity_id, role)
SELECT id, 'eunhyuk', NULL FROM content_units WHERE id LIKE 'de-%';

INSERT OR IGNORE INTO content_celebrity (content_id, celebrity_id, role)
SELECT id, 'superjunior-kry', NULL FROM content_units WHERE id LIKE 'kry-%';
INSERT OR IGNORE INTO content_celebrity (content_id, celebrity_id, role)
SELECT id, 'kyuhyun', NULL FROM content_units WHERE id LIKE 'kry-%';
INSERT OR IGNORE INTO content_celebrity (content_id, celebrity_id, role)
SELECT id, 'ryeowook', NULL FROM content_units WHERE id LIKE 'kry-%';
INSERT OR IGNORE INTO content_celebrity (content_id, celebrity_id, role)
SELECT id, 'yesung', NULL FROM content_units WHERE id LIKE 'kry-%';

INSERT OR IGNORE INTO content_celebrity (content_id, celebrity_id, role)
SELECT id, 'superjunior-83z', NULL FROM content_units WHERE id LIKE '83z-%';
INSERT OR IGNORE INTO content_celebrity (content_id, celebrity_id, role)
SELECT id, 'leeteuk', NULL FROM content_units WHERE id LIKE '83z-%';
INSERT OR IGNORE INTO content_celebrity (content_id, celebrity_id, role)
SELECT id, 'heechul', NULL FROM content_units WHERE id LIKE '83z-%';
