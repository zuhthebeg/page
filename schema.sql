-- page.cocy.io D1 schema
-- 적용: wrangler d1 execute page-db --remote --file=schema.sql

CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,            -- cocy 통합계정 sub (relay.cocy.io JWT sub)
  email       TEXT,
  name        TEXT,
  picture     TEXT,
  plan        TEXT NOT NULL DEFAULT 'free',   -- free|pro
  gen_count   INTEGER NOT NULL DEFAULT 0,     -- 생성 횟수(무료 쿼터)
  created_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sites (
  id                  TEXT PRIMARY KEY,
  slug                TEXT UNIQUE NOT NULL,
  owner_id            TEXT NOT NULL,          -- FK users.id (= JWT sub)
  vertical            TEXT,                   -- portfolio|wedding|menu|...
  title               TEXT,
  description         TEXT,
  cover_image         TEXT,
  spec_json           TEXT,                   -- 설문답+콘텐츠+테마 의도 (생성/재생성 source of truth)
  theme_json          TEXT,                   -- CSS 변수 현재값 (안전 편집용)
  current_version_id  TEXT,                   -- 라이브 버전
  status              TEXT NOT NULL DEFAULT 'draft',  -- draft|published|unlisted
  listed              INTEGER NOT NULL DEFAULT 0,     -- 포털 노출
  view_count          INTEGER NOT NULL DEFAULT 0,
  expires_at          INTEGER,                -- 월단위 만료(과금)
  created_at          INTEGER NOT NULL,
  updated_at          INTEGER NOT NULL,
  published_at        INTEGER
);
CREATE INDEX IF NOT EXISTS idx_sites_owner  ON sites(owner_id);
CREATE INDEX IF NOT EXISTS idx_sites_listed ON sites(listed, status);

CREATE TABLE IF NOT EXISTS versions (
  id          TEXT PRIMARY KEY,
  site_id     TEXT NOT NULL,
  html        TEXT NOT NULL,
  spec_json   TEXT,
  theme_json  TEXT,
  label       TEXT,                           -- "색감 따뜻하게" 등 편집 요약
  created_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_versions_site ON versions(site_id);

CREATE TABLE IF NOT EXISTS edits_log (
  id          TEXT PRIMARY KEY,
  site_id     TEXT NOT NULL,
  prompt      TEXT,
  ops         TEXT,
  tokens      INTEGER,
  created_at  INTEGER NOT NULL
);

-- 사전등록(수요 측정): 유료 출시 전 가격 노출 → 등록 의사 수집 (결제 없음)
CREATE TABLE IF NOT EXISTS preorders (
  id          TEXT PRIMARY KEY,
  user_id     TEXT,              -- 로그인 시 JWT sub (선택)
  vertical    TEXT NOT NULL,     -- wedding|menu|...
  email       TEXT,
  created_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_preorders_vertical ON preorders(vertical, created_at);

-- FanTrack (2026-08-01, 파일럿): K-pop 셀럽 출연정보 포털. 설계: docs/plans/2026-08-01-fantrack-design.md
CREATE TABLE IF NOT EXISTS celebrities (
  id                TEXT PRIMARY KEY,     -- slug
  name_ko           TEXT NOT NULL,
  name_en           TEXT,
  name_tw           TEXT,                 -- 대만 정체, 수동 검증
  group_name        TEXT,                 -- 소속 그룹명(표시용, 없으면 NULL)
  agency            TEXT,
  agency_en         TEXT,
  agency_tw         TEXT,
  birthdate         TEXT,
  mbti              TEXT,
  blood_type        TEXT,
  sns               TEXT,                 -- JSON {platform: url}
  youtube_channel_id TEXT,                -- 공식 유튜브 채널ID (프로필 이미지 oEmbed용, 8장)
  official_sns_url  TEXT,                 -- 링크아웃용 대표 공식 SNS (8장 2순위)
  created_at        INTEGER NOT NULL,
  updated_at        INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS content_units (
  id                 TEXT PRIMARY KEY,
  title              TEXT NOT NULL,        -- 원제
  title_localized_tw TEXT,                 -- 대만 통용 번체 제목 (검색/SEO용)
  title_localized_en TEXT,                 -- 영문 공식 제목 (없으면 로마자)
  platform_en        TEXT,                 -- 플랫폼 영문 표기
  platform_tw        TEXT,                 -- 플랫폼 번체 표기
  type               TEXT NOT NULL,        -- broadcast|radio|youtube|ott|film|cf|album|concert
  platform           TEXT,                 -- SBS, YouTube, Disney+ 등
  year               INTEGER,
  air_date           TEXT,
  city               TEXT,                 -- 콘서트 등 장소 정보(있을 때만)
  country            TEXT,
  country_code       TEXT,                 -- ISO-3166 alpha-2
  venue              TEXT,
  external_link      TEXT,
  link_region_note   TEXT,                 -- 예: 'kr_only'
  category           TEXT,
  note_public        TEXT,                 -- 대외 노출용 비고 (예: 공동출연자, 회차수) — 사실관계만, 서술문 금지
  note_public_en     TEXT,                 -- 비고 영문
  note_public_tw     TEXT,                 -- 비고 번체
  scope              TEXT NOT NULL DEFAULT 'solo',  -- group|solo
  upcoming           INTEGER NOT NULL DEFAULT 0,
  source_note        TEXT,                 -- 내부 관리용, 대외 미노출
  created_at         INTEGER NOT NULL,
  updated_at         INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_content_units_year ON content_units(year);

CREATE TABLE IF NOT EXISTS content_celebrity (
  content_id   TEXT NOT NULL,
  celebrity_id TEXT NOT NULL,
  role         TEXT,                       -- cast|guest|DJ 등, nullable
  PRIMARY KEY (content_id, celebrity_id)
);
CREATE INDEX IF NOT EXISTS idx_content_celebrity_celeb ON content_celebrity(celebrity_id);

CREATE TABLE IF NOT EXISTS content_votes (
  content_id  TEXT NOT NULL,
  user_id     TEXT NOT NULL,               -- relay.cocy.io JWT sub (users.id)
  created_at  INTEGER NOT NULL,
  PRIMARY KEY (content_id, user_id)
);

CREATE TABLE IF NOT EXISTS fantrack_edit_permissions (
  user_id     TEXT PRIMARY KEY,
  role        TEXT NOT NULL,               -- editor|admin
  granted_at  INTEGER NOT NULL,
  granted_by  TEXT
);
