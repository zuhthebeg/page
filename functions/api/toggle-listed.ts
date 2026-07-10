/// <reference types="@cloudflare/workers-types" />
// POST /api/toggle-listed — 본인 소유 사이트의 공개(listed) 여부 토글. Bearer Google ID 토큰 필요.
// body: { slug: string, listed: 0 | 1 }

interface Env {
  page_db: D1Database;
}

const GOOGLE_CLIENT = "315180918727-3d9rfmpa36r365qna9smdsvrod441jhd.apps.googleusercontent.com";

async function getUser(req: Request): Promise<{ id: string } | null> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const idToken = auth.slice(7);
  try {
    const r = await fetch("https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(idToken));
    if (!r.ok) return null;
    const info: any = await r.json();
    if (info.aud !== GOOGLE_CLIENT) return null;
    return info.sub ? { id: info.sub } : null;
  } catch { return null; }
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const user = await getUser(ctx.request);
  if (!user) return Response.json({ error: "login required" }, { status: 401 });

  let body: { slug?: string; listed?: number };
  try { body = await ctx.request.json(); } catch { return Response.json({ error: "bad json" }, { status: 400 }); }
  const slug = (body.slug || "").trim();
  const listed = body.listed === 1 ? 1 : 0;
  if (!slug) return Response.json({ error: "slug required" }, { status: 400 });

  const r = await ctx.env.page_db
    .prepare(`UPDATE sites SET listed = ?1, updated_at = ?2 WHERE slug = ?3 AND owner_id = ?4`)
    .bind(listed, Date.now(), slug, user.id)
    .run();

  if (!r.meta.changes) return Response.json({ error: "not found or not yours" }, { status: 404 });
  return Response.json({ ok: true, slug, listed }, { headers: { "cache-control": "no-store" } });
};
