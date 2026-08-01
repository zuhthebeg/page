-- FanTrack 파일럿 시드: 동해(SUPER JUNIOR)
-- 적용: wrangler d1 execute page-db --remote --file=seed/fantrack-donghae.sql
-- 참고: 프로필/출연정보는 공개적으로 알려진 사실관계만 기재(제목/연도/플랫폼), 서술문 인용 없음.

INSERT OR REPLACE INTO celebrities
  (id, name_ko, name_en, name_tw, group_name, agency, birthdate, mbti, blood_type, sns, youtube_channel_id, official_sns_url, created_at, updated_at)
VALUES (
  'donghae', '동해', 'Donghae', '東海', 'SUPER JUNIOR', '오드 엔터테인먼트 / SM엔터테인먼트',
  '1986-10-15', 'ENFJ', 'A',
  '{"instagram":"https://www.instagram.com/donghae/","x":"https://x.com/donghae861015","youtube":"https://www.youtube.com/@DonghaeYT"}',
  NULL, 'https://www.instagram.com/donghae/',
  1785581652857, 1785581652857
);

INSERT OR REPLACE INTO content_units (id, title, title_localized_tw, type, platform, year, air_date, external_link, link_region_note, category, scope, upcoming, source_note, created_at, updated_at) VALUES
('dh-radiostar', '라디오스타', '電台明星', 'broadcast', 'MBC', 2011, NULL, NULL, 'kr_only', '토크쇼', 'solo', 0, 'namuwiki-fact-check', 1785581652857, 1785581652857),
('dh-knowingbros', '아는 형님', '認識的哥哥', 'broadcast', 'JTBC', 2015, NULL, NULL, 'kr_only', '예능', 'group', 0, 'namuwiki-fact-check', 1785581652857, 1785581652857),
('dh-runningman', '런닝맨', '奔跑吧兄弟(韓版)', 'broadcast', 'SBS', 2010, NULL, NULL, 'kr_only', '예능', 'group', 0, 'namuwiki-fact-check', 1785581652857, 1785581652857),
('dh-weeklyidol', '주간 아이돌', '週刊偶像', 'youtube', 'MBC 에브리원/YouTube', 2011, NULL, NULL, NULL, '예능', 'group', 0, 'namuwiki-fact-check', 1785581652857, 1785581652857),
('dh-wgm3', '우리 결혼했어요 시즌3', '我們結婚了 第3季', 'broadcast', 'MBC', 2012, NULL, NULL, 'kr_only', '리얼리티', 'solo', 0, 'namuwiki-fact-check', 1785581652857, 1785581652857),
('dh-kpopstar', 'K팝 스타', 'K-pop明星', 'broadcast', 'SBS', 2012, NULL, NULL, 'kr_only', '오디션', 'solo', 0, 'namuwiki-fact-check', 1785581652857, 1785581652857),
('dh-livemenshousework', '살림하는 남자들', '做家事的男人們', 'broadcast', 'KBS 2TV', 2021, NULL, NULL, 'kr_only', '리얼리티', 'solo', 0, 'namuwiki-fact-check', 1785581652857, 1785581652857),
('dh-danyshow', '댸니쇼', '댸니秀', 'youtube', 'NAVER NOW.', 2021, NULL, NULL, NULL, '토크', 'solo', 0, 'namuwiki-fact-check', 1785581652857, 1785581652857),
('dh-powerfm2025', '김영철의 파워FM', '金永哲Power FM', 'radio', 'SBS 파워FM', 2025, NULL, NULL, 'kr_only', '라디오', 'solo', 0, 'namuwiki-fact-check', 1785581652857, 1785581652857),
('dh-gayogwangjang', '이은지의 가요광장', '李恩地歌謠廣場', 'radio', 'KBS CoolFM', 2026, NULL, NULL, 'kr_only', '라디오', 'solo', 0, 'namuwiki-fact-check', 1785581652857, 1785581652857),
('dh-supertv', '슈퍼TV', '슈퍼TV', 'youtube', 'YouTube', 2020, NULL, 'https://www.youtube.com/@SUPERTV07', NULL, '자체채널', 'group', 0, 'namuwiki-fact-check', 1785581652857, 1785581652857),
('dh-ss6', 'SUPER SHOW 6', 'SUPER SHOW 6', 'concert', '콘서트', 2015, NULL, NULL, NULL, '콘서트', 'group', 0, 'namuwiki-fact-check', 1785581652857, 1785581652857),
('dh-donghaesolo2026', '2026 DONGHAE 1ST SOLO CONCERT TOUR', '2026 東海 首次個人演唱會巡演', 'concert', '콘서트', 2026, NULL, NULL, NULL, '콘서트', 'solo', 1, 'namuwiki-fact-check', 1785581652857, 1785581652857),
('dh-de-boutyou', "D&E 'Bout You", "D&E 'Bout You", 'album', 'SUPER JUNIOR-D&E', 2015, NULL, NULL, NULL, '음반', 'group', 0, 'namuwiki-fact-check', 1785581652857, 1785581652857),
('dh-de-style', "D&E STYLE", "D&E STYLE", 'album', 'SUPER JUNIOR-D&E', 2017, NULL, NULL, NULL, '음반', 'group', 0, 'namuwiki-fact-check', 1785581652857, 1785581652857),
('dh-de-danger', "D&E DANGER", "D&E DANGER", 'album', 'SUPER JUNIOR-D&E', 2018, NULL, NULL, NULL, '음반', 'group', 0, 'namuwiki-fact-check', 1785581652857, 1785581652857),
('dh-de-timeless', "D&E TIMELESS", "D&E TIMELESS", 'album', 'SUPER JUNIOR-D&E', 2020, NULL, NULL, NULL, '음반', 'group', 0, 'namuwiki-fact-check', 1785581652857, 1785581652857),
('dh-sj-super25', 'Super Junior25', 'Super Junior25', 'album', 'SUPER JUNIOR', 2025, NULL, NULL, NULL, '음반', 'group', 0, 'namuwiki-fact-check', 1785581652857, 1785581652857);

-- content_celebrity: 전부 동해 태깅 (파일럿은 1인, 그룹 멤버 추가 시 동일 content_id에 멤버 row만 더 추가하면 됨)
INSERT OR REPLACE INTO content_celebrity (content_id, celebrity_id, role) VALUES
('dh-radiostar','donghae',NULL),
('dh-knowingbros','donghae',NULL),
('dh-runningman','donghae',NULL),
('dh-weeklyidol','donghae',NULL),
('dh-wgm3','donghae',NULL),
('dh-kpopstar','donghae',NULL),
('dh-livemenshousework','donghae',NULL),
('dh-danyshow','donghae',NULL),
('dh-powerfm2025','donghae',NULL),
('dh-gayogwangjang','donghae',NULL),
('dh-supertv','donghae',NULL),
('dh-ss6','donghae',NULL),
('dh-donghaesolo2026','donghae',NULL),
('dh-de-boutyou','donghae',NULL),
('dh-de-style','donghae',NULL),
('dh-de-danger','donghae',NULL),
('dh-de-timeless','donghae',NULL),
('dh-sj-super25','donghae',NULL);
