-- FanTrack i18n: 영문 제목 컬럼 추가 + 동해 콘텐츠 영문/번체 표기 정리 (2026-08-01)
-- 원칙: 로케일별로 한 언어만 표시(혼용 금지). 공식 영문 제목 우선, 없으면 로마자.
-- 번체는 대만 통용 표기만. 중국 대륙 리메이크 제목/한글+한자 혼용 금지.

ALTER TABLE content_units ADD COLUMN title_localized_en TEXT;

-- 영문 제목 (공식 영문 타이틀 기준)
UPDATE content_units SET title_localized_en = 'Lee Eun-ji''s Gayo Gwangjang' WHERE id = 'dh-gayogwangjang';
UPDATE content_units SET title_localized_en = 'Kim Young-chul''s Power FM'   WHERE id = 'dh-powerfm2025';
UPDATE content_units SET title_localized_en = 'Mr. House Husband'            WHERE id = 'dh-livemenshousework';
UPDATE content_units SET title_localized_en = 'Danny Show'                   WHERE id = 'dh-danyshow';
UPDATE content_units SET title_localized_en = 'Super TV'                     WHERE id = 'dh-supertv';
UPDATE content_units SET title_localized_en = 'Knowing Bros'                 WHERE id = 'dh-knowingbros';
UPDATE content_units SET title_localized_en = 'Weekly Idol'                  WHERE id = 'dh-weeklyidol';
UPDATE content_units SET title_localized_en = 'Radio Star'                   WHERE id = 'dh-radiostar';
UPDATE content_units SET title_localized_en = 'We Got Married Season 3'      WHERE id = 'dh-wgm3';
UPDATE content_units SET title_localized_en = 'K-pop Star'                   WHERE id = 'dh-kpopstar';
UPDATE content_units SET title_localized_en = 'Running Man'                  WHERE id = 'dh-runningman';
UPDATE content_units SET title_localized_en = 'Infinite Challenge: Idol Athletics Championship (Part 1)' WHERE id = 'dh-infchallenge2010';
-- 원제가 이미 영문인 항목은 원제 그대로 사용(별도 값 없음): 앨범/콘서트/Super Junior25 등

-- 번체 표기 오류 정정
-- 런닝맨: 奔跑吧兄弟는 중국 대륙 리메이크 제목 → 대만은 원제 Running Man 통용
UPDATE content_units SET title_localized_tw = 'Running Man' WHERE id = 'dh-runningman';
-- K팝 스타: 대만도 영문 원제 통용
UPDATE content_units SET title_localized_tw = 'K-POP STAR' WHERE id = 'dh-kpopstar';
-- 댸니쇼: '댸니秀'는 한글+한자 혼용 → 로마자로 통일
UPDATE content_units SET title_localized_tw = 'Danny Show' WHERE id = 'dh-danyshow';
-- 무한도전 아이돌 선수권대회: 선수권대회는 육상 운동회 → 偶像運動會
UPDATE content_units SET title_localized_tw = '無限挑戰 偶像運動會(上)' WHERE id = 'dh-infchallenge2010';
