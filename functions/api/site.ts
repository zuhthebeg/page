/// <reference types="@cloudflare/workers-types" />
// GET /api/site?slug=<slug> — 편집 화면 소유권 확인용 메타

interface Env { page_db: D1Database; }

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const slug = new URL(ctx.request.url).searchParams.get("slug");
  if (!slug) return Response.json({ error: "slug required" }, { status: 400 });
  const row = await ctx.env.page_db
    .prepare("SELECT slug, owner_id, title, vertical, status, updated_at FROM sites WHERE slug=?1")
    .bind(slug).first();
  if (!row) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json(row, { headers: { "cache-control": "no-store" } });
};
