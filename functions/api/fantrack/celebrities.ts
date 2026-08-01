/// <reference types="@cloudflare/workers-types" />
// GET /api/fantrack/celebrities — FanTrack 메인용 프로필 목록 (+ 출연정보 건수)

interface Env {
  page_db: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const { results } = await ctx.env.page_db
    .prepare(
      `SELECT c.id, c.name_ko, c.name_en, c.name_tw, c.group_name, c.kind, c.sort_order,
              COALESCE(n.cnt, 0) AS content_count
         FROM celebrities c
         LEFT JOIN (
           SELECT celebrity_id, COUNT(*) AS cnt FROM content_celebrity GROUP BY celebrity_id
         ) n ON n.celebrity_id = c.id
        ORDER BY COALESCE(c.sort_order, 999), c.name_ko`
    )
    .all();

  return Response.json(
    { celebrities: results ?? [] },
    {
      headers: {
        "cache-control": "public, max-age=60",
        "access-control-allow-origin": "*",
      },
    }
  );
};
