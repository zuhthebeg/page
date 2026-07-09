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
        LIMIT 60`
    )
    .all();

  return Response.json(
    { sites: results ?? [] },
    {
      headers: {
        "cache-control": "public, max-age=60",
        "access-control-allow-origin": "*",
      },
    }
  );
};
