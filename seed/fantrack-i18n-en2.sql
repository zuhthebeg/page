-- FanTrack i18n 2단계: 비고/플랫폼/소속사도 로케일별 컬럼 분리 (2026-08-01)
-- 이유: 제목만 번역하면 카드 안에서 '영문 제목 + 한글 플랫폼/비고'로 여전히 언어가 섞임.

ALTER TABLE content_units ADD COLUMN note_public_en TEXT;
ALTER TABLE content_units ADD COLUMN note_public_tw TEXT;
ALTER TABLE content_units ADD COLUMN platform_en TEXT;
ALTER TABLE content_units ADD COLUMN platform_tw TEXT;
ALTER TABLE celebrities ADD COLUMN agency_en TEXT;
ALTER TABLE celebrities ADD COLUMN agency_tw TEXT;

-- 비고
UPDATE content_units SET
  note_public_en = 'With Eunhyuk, Shindong, Leeteuk, Yesung, Heechul',
  note_public_tw = '與銀赫、神童、利特、藝聲、希澈共同出演'
WHERE id = 'dh-knowingbros';

UPDATE content_units SET
  note_public_en = 'Aired Nov 8 & Nov 15 (2 episodes) · With Eunhyuk, Shindong, Leeteuk, Yesung, Heechul',
  note_public_tw = '11/8、11/15 共2集 · 與銀赫、神童、利特、藝聲、希澈共同出演'
WHERE id = 'dh-weeklyidol';

UPDATE content_units SET
  note_public_en = 'Aired Jan 21 – Mar 24, 2012 (6 episodes)',
  note_public_tw = '2012.1.21~3.24 共6集'
WHERE id = 'dh-wgm3';

-- 플랫폼
UPDATE content_units SET platform_en = 'KBS Cool FM',        platform_tw = 'KBS Cool FM'      WHERE platform = 'KBS CoolFM';
UPDATE content_units SET platform_en = 'SBS Power FM',       platform_tw = 'SBS Power FM'     WHERE platform = 'SBS 파워FM';
UPDATE content_units SET platform_en = 'Concert',            platform_tw = '演唱會'            WHERE platform = '콘서트';
UPDATE content_units SET platform_en = 'MBC Every1 / YouTube', platform_tw = 'MBC Every1 / YouTube' WHERE platform = 'MBC 에브리원/YouTube';

-- 소속사
UPDATE celebrities SET
  agency_en = 'ODD Entertainment / SM Entertainment',
  agency_tw = 'ODD Entertainment / SM娛樂'
WHERE id = 'donghae';

-- 후속: 슈퍼TV 번체값이 한글('슈퍼TV')이라 tw 화면에 한글이 남음 → 영문 원제로 통일
UPDATE content_units SET title_localized_tw = 'Super TV' WHERE id = 'dh-supertv';
