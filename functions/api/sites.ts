/// <reference types="@cloudflare/workers-types" />
// GET /api/sites — 포털 쇼케이스용: 발행 + listed 사이트 목록

interface Env {
  page_db: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const { results } = await ctx.env.page_db
    .prepare(
      `SELECT slug, vertical, title, description, cover_image, owner_id, view_count, published_at
         FROM sites
        WHERE status = 'published' AND listed = 1
        ORDER BY published_at DESC
        LIMIT 300`
    )
    .all();

  return Response.json(
    { sites: [
      { slug: "opengcua-computer-use", vertical: "report", title: "OpenGCUA · 코드 기반 컴퓨터 사용 검증",
        description: "공개 연구 프리뷰. partial score +19.6점·단계 −53%는 저자 보고이며 새 모델 가중치 공개는 아직 계획이다.",
        cover_image: "/opengcua-computer-use/icon.svg", owner_id: null, view_count: 0, published_at: "2026-10-20T14:05:06.067932+00:00" },
      { slug: "harness2-agent-research", vertical: "report", title: "Harness² · 가중치 고정 자기개선 검증",
        description: "Google 공개 연구는 확인. 전문 업무 수치는 저자 보고이며 JEV 1.14 비전 성능과 분리한다.",
        cover_image: "/harness2-agent-research/icon.svg", owner_id: null, view_count: 0, published_at: "2026-10-20T14:00:00Z" },
      { slug: 'polyhaven-free-assets-api', vertical: 'report', title: 'Poly Haven 무료 에셋 · CC0와 ARPG 활용 검증',
        description: '실제 2,387개. CC0와 무료 API 조건을 구분하고 배경·소품·HDRI 후보 5개를 평가했다. 게임 적용·임포트 실측 없음.',
        cover_image: '/polyhaven-free-assets-api/icon.svg', owner_id: null, view_count: 0, published_at: '2026-10-15T11:22:24Z' },
      { slug: 'hyperqwen-4090', vertical: 'report', title: 'HyperQwen · RTX 4090 검증',
        description: '381 tok/s는 문서 재현 수치. 자체 GPU 실측 없이 출처를 검증했다. 24GB 격리 파일럿 조건부 GO, 상시 운영 NO.',
        cover_image: '/hyperqwen-4090/icon.svg', owner_id: null, view_count: 0, published_at: '2026-10-14T00:00:00Z' },
      ...(results ?? []).filter((site: { slug: string }) => !['hyperqwen-4090', 'polyhaven-free-assets-api', 'harness2-agent-research', 'opengcua-computer-use'].includes(site.slug)),
    ] },
    {
      headers: {
        "cache-control": "public, max-age=60",
        "access-control-allow-origin": "*",
      },
    }
  );
};
