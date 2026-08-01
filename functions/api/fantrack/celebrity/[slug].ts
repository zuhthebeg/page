/// <reference types="@cloudflare/workers-types" />
// GET /api/fantrack/celebrity/:slug — 프로필 + 출연정보 목록 (흥미도순/연도순 둘 다 계산해서 반환)

interface Env {
  page_db: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const slug = ctx.params.slug as string;
  const db = ctx.env.page_db;

  const celeb = await db
    .prepare(
      `SELECT id, name_ko, name_en, name_tw, group_name, agency, agency_en, agency_tw, birthdate, mbti,
              blood_type, sns, youtube_channel_id, official_sns_url, debut_date, fandom
         FROM celebrities WHERE id = ?`
    )
    .bind(slug)
    .first();

  if (!celeb) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  const { results: content } = await db
    .prepare(
      `SELECT c.id, c.title, c.title_localized_tw, c.title_localized_en, c.type, c.platform, c.platform_en, c.platform_tw, c.year, c.air_date, c.city, c.country, c.country_code, c.venue,
              c.external_link, c.link_region_note, c.category, c.scope, c.upcoming, c.note_public, c.note_public_en, c.note_public_tw,
              COALESCE(v.cnt, 0) AS votes
         FROM content_units c
         JOIN content_celebrity cc ON cc.content_id = c.id
         LEFT JOIN (
           SELECT content_id, COUNT(*) AS cnt FROM content_votes GROUP BY content_id
         ) v ON v.content_id = c.id
        WHERE cc.celebrity_id = ?
        ORDER BY c.year DESC`
    )
    .bind(slug)
    .all();

  const sns = celeb.sns ? JSON.parse(celeb.sns as string) : {};

  return Response.json(
    {
      celebrity: { ...celeb, sns },
      content: content ?? [],
    },
    {
      headers: {
        "cache-control": "public, max-age=60",
        "access-control-allow-origin": "*",
      },
    }
  );
};
