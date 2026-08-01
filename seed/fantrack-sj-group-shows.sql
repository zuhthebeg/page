-- FanTrack: SUPER JUNIOR 그룹 단위 방송/웹/라디오 — 2026-08-01
-- 출처: en/ko 위키백과, mydramalist, cine21 (병렬 리서치 후 확인). 확인 못 한 프로그램은 넣지 않음.
-- 번체 제목은 검증 못 해서 비워둠(허위 번역 금지) — tw 로케일은 영문 제목으로 폴백된다.

INSERT OR IGNORE INTO content_units
  (id, title, title_localized_en, type, platform, platform_en, platform_tw, year, category, scope, upcoming,
   note_public, note_public_en, created_at, updated_at) VALUES
  ('sj-fullhouse','슈퍼주니어의 풀하우스','Super Junior Full House','broadcast','SBS','SBS','SBS',2006,'variety','group',0,
   '2006.5.27~8.26 · 14부작','Aired May 27 – Aug 26, 2006 · 14 episodes',unixepoch()*1000,unixepoch()*1000),
  ('sj-mystery6','미스터리 추적 6','Mystery Chase 6','broadcast','Mnet','Mnet','Mnet',2006,'variety','group',0,
   '2006.3.30~5.4 · 강원래와 공동 출연','Aired Mar 30 – May 4, 2006 · with Kang Won-rae',unixepoch()*1000,unixepoch()*1000),
  ('sj-humanbody','인체탐험대','Explorers of the Human Body','broadcast','SBS','SBS','SBS',2007,'variety','group',0,
   '<일요일이 좋다> 코너 · 2007.11.11~2008.2.3 · 13부작 · 신동엽과 공동 출연','Segment of Good Sunday · Nov 11, 2007 – Feb 3, 2008 · 13 episodes · with Shin Dong-yup',unixepoch()*1000,unixepoch()*1000),
  ('sj-foresight','슈퍼주니어의 선견지명','Super Junior''s Foresight','broadcast','MBC every1','MBC every1','MBC every1',2010,'variety','group',0,
   '2010.12.8~2011.3.30 · 이특·은혁·규현 진행','Dec 8, 2010 – Mar 30, 2011 · hosted by Leeteuk, Eunhyuk, Kyuhyun',unixepoch()*1000,unixepoch()*1000),
  ('sj-onefineday','슈퍼주니어 어느 멋진 날','Super Junior''s One Fine Day','broadcast','MBC','MBC','MBC',2014,'variety','group',0,
   '4부작 · 이특·은혁·동해 스위스 여행','4 episodes · Leeteuk, Eunhyuk, Donghae in Switzerland',unixepoch()*1000,unixepoch()*1000),
  ('sj-returns','슈주 리턴즈','SJ Returns','youtube','네이버 TV','Naver TV','Naver TV',2017,'variety','group',0,
   '시즌 4까지 제작(~2021) · JTBC2 방영','4 seasons through 2021 · also aired on JTBC2',unixepoch()*1000,unixepoch()*1000),
  ('sj-ktr','슈퍼주니어의 키스 더 라디오','Super Junior''s Kiss the Radio','radio','KBS Cool FM','KBS Cool FM','KBS Cool FM',2006,'radio','group',0,
   '2006.8.21~2016.10 · 이특·은혁(2006~2011) → 성민·려욱(2011~2013) → 려욱','Aug 21, 2006 – Oct 2016 · Leeteuk & Eunhyuk (2006–2011), Sungmin & Ryeowook (2011–2013), then Ryeowook',unixepoch()*1000,unixepoch()*1000);

-- 슈퍼TV: 기존 행(dh-supertv)이 2020/YouTube로 잘못 들어가 있었다 → 확인된 사실(2018, XtvN/tvN, 2시즌)로 정정
UPDATE content_units SET
  title = '슈퍼TV', title_localized_en = 'Super Junior''s Super TV', title_localized_tw = 'Super TV',
  type = 'broadcast', platform = 'XtvN / tvN', platform_en = 'XtvN / tvN', platform_tw = 'XtvN / tvN',
  year = 2018, category = 'variety', scope = 'group',
  note_public = '2시즌 · 시즌1 이특·희철·예성·신동·은혁·동해 / 시즌2 시원 합류, 시즌2 11화부터 려욱 합류',
  note_public_en = '2 seasons · S1 cast Leeteuk, Heechul, Yesung, Shindong, Eunhyuk, Donghae; Siwon joined in S2, Ryeowook from S2 ep11',
  note_public_tw = NULL
WHERE id = 'dh-supertv';

-- 그룹 연결
INSERT OR IGNORE INTO content_celebrity (content_id, celebrity_id, role)
SELECT id, 'superjunior', NULL FROM content_units
 WHERE id IN ('sj-fullhouse','sj-mystery6','sj-humanbody','sj-foresight','sj-onefineday','sj-returns','sj-ktr','dh-supertv');

-- 출처에 이름이 명시된 멤버만 개별 연결
INSERT OR IGNORE INTO content_celebrity (content_id, celebrity_id, role) VALUES
  ('sj-foresight','leeteuk','host'), ('sj-foresight','eunhyuk','host'), ('sj-foresight','kyuhyun','host'),
  ('sj-onefineday','leeteuk','cast'), ('sj-onefineday','eunhyuk','cast'), ('sj-onefineday','donghae','cast'),
  ('sj-ktr','leeteuk','DJ'), ('sj-ktr','eunhyuk','DJ'), ('sj-ktr','ryeowook','DJ'),
  ('dh-supertv','leeteuk','cast'), ('dh-supertv','heechul','cast'), ('dh-supertv','yesung','cast'),
  ('dh-supertv','shindong','cast'), ('dh-supertv','eunhyuk','cast'), ('dh-supertv','siwon','cast'),
  ('dh-supertv','ryeowook','cast');
