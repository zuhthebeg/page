-- FanTrack 파일럿 2차 보정: 정확한 날짜/공동출연자 반영, 미검증 링크는 검색링크로 대체
-- 적용: wrangler d1 execute page-db --remote --file=seed/fantrack-donghae-fix2.sql
-- 출처: cocy 제공 스크린샷(방송출연 표, 날짜/채널/프로그램명/비고) — 사실관계만 반영, 표 원문 미인용

-- 날짜 정확도 오류 정정 + 공동출연 비고 추가
UPDATE content_units SET
  air_date = '2015-07-15', year = 2015,
  external_link = 'https://www.youtube.com/results?search_query=' || '%ED%99%A9%EA%B8%88%EC%96%B4%EC%9E%A5+%EB%9D%BC%EB%94%94%EC%98%A4%EC%8A%A4%ED%83%80+%EB%8F%99%ED%95%B4',
  updated_at = 1785583265098
WHERE id = 'dh-radiostar';

UPDATE content_units SET
  air_date = '2017-11-04', year = 2017,
  note_public = '은혁·신동·이특·예성·희철과 공동 출연',
  external_link = 'https://www.youtube.com/results?search_query=' || '%EC%95%84%EB%8A%94%ED%98%95%EB%8B%98+%EB%8F%99%ED%95%B4+2017',
  updated_at = 1785583265098
WHERE id = 'dh-knowingbros';

UPDATE content_units SET
  air_date = '2017-11-08', year = 2017,
  note_public = '11/8, 11/15 2회 방송 · 은혁·신동·이특·예성·희철과 공동 출연',
  external_link = 'https://www.youtube.com/results?search_query=' || '%EC%A3%BC%EA%B0%84%EC%95%84%EC%9D%B4%EB%8F%8C+%EB%8F%99%ED%95%B4+2017',
  updated_at = 1785583265098
WHERE id = 'dh-weeklyidol';

UPDATE content_units SET
  air_date = '2012-01-21', year = 2012,
  note_public = '2012.1.21~3.24 총 6회 방송(연애편 상/하, 두쌍커플편 상/중/하)',
  external_link = NULL,
  updated_at = 1785583265098
WHERE id = 'dh-wgm3';

-- 신규: 무한도전 아이돌선수권(스크린샷에서 확인, 기존 시드에 없던 항목)
INSERT OR REPLACE INTO content_units (id, title, title_localized_tw, type, platform, year, air_date, external_link, link_region_note, category, scope, upcoming, source_note, note_public, created_at, updated_at) VALUES
('dh-infchallenge2010', '무한도전 아이돌 선수권대회(상)', '無限挑戰 偶像選秀(上)', 'broadcast', 'MBC', 2010, '2010-07-13',
 'https://www.youtube.com/results?search_query=' || '%EB%AC%B4%ED%95%9C%EB%8F%84%EC%A0%84+%EC%95%84%EC%9D%B4%EB%8F%8C+%EC%84%A0%EC%88%98%EA%B6%8C+%EB%8F%99%ED%95%B4',
 'kr_only', '예능', 'group', 0, 'user-provided-screenshot-2026-08-01', NULL, 1785583265098, 1785583265098);
INSERT OR REPLACE INTO content_celebrity (content_id, celebrity_id, role) VALUES ('dh-infchallenge2010','donghae',NULL);

-- 나머지 날짜 미확정 항목(런닝맨/K팝스타/살림하는남자들/댸니쇼/파워FM/가요광장)은
-- 정확한 방영일 미검증 상태라 검색링크로 대체(억지 특정 링크 삽입 금지)
UPDATE content_units SET external_link = 'https://www.youtube.com/results?search_query=' || '%EB%9F%B0%EB%8B%9D%EB%A7%A8+%EB%8F%99%ED%95%B4' WHERE id = 'dh-runningman';
UPDATE content_units SET external_link = 'https://www.youtube.com/results?search_query=' || 'K%ED%8C%9D%EC%8A%A4%ED%83%80+%EB%8F%99%ED%95%B4+%EC%8B%AC%EC%82%AC%EC%9C%84%EC%9B%90' WHERE id = 'dh-kpopstar';
UPDATE content_units SET external_link = 'https://www.youtube.com/results?search_query=' || '%EC%82%B4%EB%A6%BC%ED%95%98%EB%8A%94%EB%82%A8%EC%9E%90%EB%93%A4+%EB%8F%99%ED%95%B4' WHERE id = 'dh-livemenshousework';
UPDATE content_units SET external_link = 'https://www.youtube.com/@donghaelee' WHERE id = 'dh-danyshow';
UPDATE content_units SET external_link = 'https://www.youtube.com/results?search_query=' || '%EA%B9%80%EC%98%81%EC%B2%A0%EC%9D%98+%ED%8C%8C%EC%9B%8CFM+%EB%8F%99%ED%95%B4' WHERE id = 'dh-powerfm2025';
UPDATE content_units SET external_link = 'https://www.youtube.com/results?search_query=' || '%EC%9D%B4%EC%9D%80%EC%A7%80%EC%9D%98+%EA%B0%80%EC%9A%94%EA%B4%91%EC%9E%A5+%EB%8F%99%ED%95%B4' WHERE id = 'dh-gayogwangjang';
