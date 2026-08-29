# page.cocy.io 가격·운영 정책 (2026-08-29 확정)

## 상품 구조
- **무료**: 페이지 만들기 + 호스팅. 결제 없음. 무료 페이지에는 운영을 위해 광고가 표시된다.
- **플러스**: 월 990원 / 연 9,900원 — **광고 제거 + 완성 후 수정 자유**. 단일 상품, 다른 플랜 없음.
- 결제: 당분간 계좌입금 수동 확인 → D1 `sites.ad_free=1` 플래그. 자동결제는 수요 확인 후.

## 카피 규칙
- "만들기 무료"는 어디서든 OK. "전부 무료"는 금지 (수정이 유료라 과대주장).
- 광고는 AdSense 자동광고 — **위치·개수를 약속하는 카피 금지** ("하단에 작은 광고 하나" ❌ → "광고가 표시돼요" ⭕).
- 후불/입금/3일 체험/₩4,990 등 구 모델 문구 발견 시 즉시 제거 (2026-08-29 index/new/guide 정리 완료).

## 쇼케이스 운영
- 메인은 결과물 중심: 마퀴 스트립 + 썸네일 그리드.
- 히트작 우선 노출: `public/index.html`의 `FEATURED` 배열 (현재: footprints, marvel, doldol, sunja-hwangap, cafe-onwol, tzuyang-tokyo, diary, juno-dev). 새 히트작 나오면 여기 추가.
- 썸네일 갱신: `node scripts/gen-thumbs.cjs [slug ...]` → `public/shots/<slug>.webp`. 신규 페이지 발행 시 함께 실행.
- ⚠️ 정적 자산은 `/assets/` 금지 (functions/assets/[[key]].ts R2 서빙이 가로챔) — `/shots/` 등 다른 경로 사용.

## 남용 가드 (TODO — 공개 self-serve 전 필수)
- 계정당 페이지 수 제한 (안: 3개)
- 일일 신규 생성 쿼터
- 현재는 승인 큐(수동)라 자연 방어 중

## 광고 주입 현황
- 현재: 만료 페이지에만 배너 주입 (functions/[[path]].ts injectAd)
- TODO: 무료 페이지 전체에 광고 적용 (ad_free=0 → 주입), 플러스는 ad_free=1로 제외
