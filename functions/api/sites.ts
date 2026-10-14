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
      { slug: 'hyperqwen-4090', vertical: 'report', title: 'HyperQwen · RTX 4090 검증',
        description: '381 tok/s는 문서 재현 수치. 자체 GPU 실측 없이 출처를 검증했다. 24GB 격리 파일럿 조건부 GO, 상시 운영 NO.',
        cover_image: '/hyperqwen-4090/icon.svg', owner_id: null, view_count: 0, published_at: '2026-10-14T00:00:00Z' },
      ...(results ?? []).filter((site: { slug: string }) => site.slug !== 'hyperqwen-4090'),
    ] },
    {
      headers: {
        "cache-control": "public, max-age=60",
        "access-control-allow-origin": "*",
      },
    }
  );
};
