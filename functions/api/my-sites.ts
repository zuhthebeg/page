/// <reference types="@cloudflare/workers-types" />
// GET /api/my-sites — 로그인 사용자 본인 소유 사이트 전체(비공개 포함). Bearer Google ID 토큰 필요.

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

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const user = await getUser(ctx.request);
  if (!user) return Response.json({ error: "login required" }, { status: 401 });

  const { results } = await ctx.env.page_db
    .prepare(
      `SELECT slug, vertical, title, description, cover_image, listed, status, expires_at, updated_at
         FROM sites
        WHERE owner_id = ?1
        ORDER BY updated_at DESC
        LIMIT 200`
    )
    .bind(user.id)
    .all();

  return Response.json(
    { sites: results ?? [] },
    { headers: { "cache-control": "no-store" } }
  );
};
