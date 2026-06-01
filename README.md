# page.cocy.io

설문으로 "느낌"을 받아 **LLM이 매번 완전히 다른 bespoke 원페이지를 생성**하고,
`page.cocy.io/{slug}` 로 발행하며, cocy 계정으로 로그인한 소유자가 **채팅으로 수정**할 수 있는 서비스.
모토: **나만의 특별한 페이지** — 비주얼 코드 템플릿 없음.

## 스택
- **CF Pages + Functions** (TypeScript, 직접 `wrangler pages deploy`)
- **D1** `page-db` — 사이트/유저/버전 메타 (source of truth)
- **KV** `page-cache` — 발행 HTML 핫캐시 (서빙 store)
- **R2** `page-assets` — 사용자 업로드/생성 이미지
- **llm.cocy.io** — 생성·수정 LLM 게이트
- **인증**: `relay.cocy.io/api/auth` (cocy 통합계정, JWT `sub`) + `cocy.io/auth-bridge.html` SSO 재사용. 소유자 = JWT `sub`.

## 라우팅
| 경로 | 용도 | 인증 |
|---|---|---|
| `/` | 포털(쇼케이스) | - |
| `/{slug}` | 발행된 페이지 서빙 (KV→D1) | - |
| `/new` | 설문·생성 플로우 | 로그인 |
| `/edit/{slug}` | 편집(소유자만) | 로그인+소유 |
| `/api/*` | 내부 API | 세션 |

예약 슬러그: `new edit api auth portal assets static` 등 (functions/[[path]].ts `RESERVED`).

## 핵심 철학 — "템플릿"의 위치
비주얼(HTML/CSS)은 100% bespoke. 재사용/강제하는 건:
1. **생성 하네스** (시스템 프롬프트 + 디자인 DNA) — 바닥 퀄 보장
2. **구조 규약** — 외형 아닌 뼈대만 강제 → LLM 수정이 안 깨지게:
   - 테마 = `:root` CSS 변수 (`--bg --ink --accent --font-display …`)
   - 섹션 = `<section data-block="hero|about|gallery|...">`
3. 단일 자기완결 HTML, 이미지는 R2 URL, SEO/OG 채움, 모바일 우선.

품질 북극성 = `github.com/zuhthebeg/portfolio` 의 `chef/yang` (생성 few-shot 레퍼런스, 베끼지 않고 바닥선 상속).

## 개발/배포
```bash
# 스키마 적용 (최초 1회)
wrangler d1 execute page-db --remote --file=schema.sql

# 로컬
npx wrangler pages dev public

# 배포 (직접 업로드 — admin/relay와 동일 방식)
npx wrangler pages deploy public --project-name=page-cocy
```

설계 전문: `docs/plans/2026-06-01-page-cocy-design.md` (workspace).

## 로드맵
- [x] Phase 0 — 골격: repo + CF Pages + D1/KV/R2 + 슬러그 서빙 + 포털 셸
- [ ] Phase 1 — 생성: 설문 UI + 생성 하네스 + 린트 + 발행
- [ ] Phase 2 — 편집: /edit + 의도분류 + 패치 + 버전/롤백
- [ ] Phase 3 — 포털 필터 + 프라이버시 디폴트(청첩장 unlisted)
- [ ] Phase 4 — 과금: 쿼터 게이트 + 커스텀도메인 + 분석
