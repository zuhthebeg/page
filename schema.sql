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
