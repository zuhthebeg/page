/// <reference types="@cloudflare/workers-types" />
// GET /api/admin/jobs — 관리자(cocy)만. 잡 큐 전체 조회.

interface Env { page_db: D1Database; }

const GOOGLE_CLIENT = "315180918727-3d9rfmpa36r365qna9smdsvrod441jhd.apps.googleusercontent.com";
const ADMIN_SUB = "111993084009681810615";

export async function isAdmin(req: Request): Promise<boolean> {
  const a = req.headers.get("Authorization");
  if (!a?.startsWith("Bearer ")) return false;
  try {
    const r = await fetch("https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(a.slice(7)));
    if (!r.ok) return false;
    const i: any = await r.json();
    return i.aud === GOOGLE_CLIENT && i.sub === ADMIN_SUB;
  } catch { return false; }
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  if (!(await isAdmin(ctx.request))) return Response.json({ error: "forbidden" }, { status: 403 });
  const { results } = await ctx.env.page_db
    .prepare("SELECT id,type,status,slug,owner_id,payload_json,result_json,created_at,updated_at FROM jobs ORDER BY created_at DESC LIMIT 100")
    .all();
  return Response.json({ jobs: results || [] }, { headers: { "cache-control": "no-store" } });
};
