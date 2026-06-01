/// <reference types="@cloudflare/workers-types" />
// POST /api/admin/approve {id, action:'approve'|'reject'} — 관리자(cocy)만.
// approve → status='approved' (= 에이전트 실행 트리거). reject → 'rejected'.

interface Env { page_db: D1Database; }

const GOOGLE_CLIENT = "315180918727-3d9rfmpa36r365qna9smdsvrod441jhd.apps.googleusercontent.com";
const ADMIN_SUB = "111993084009681810615";

async function isAdmin(req: Request): Promise<boolean> {
  const a = req.headers.get("Authorization");
  if (!a?.startsWith("Bearer ")) return false;
  try {
    const r = await fetch("https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(a.slice(7)));
    if (!r.ok) return false;
    const i: any = await r.json();
    return i.aud === GOOGLE_CLIENT && i.sub === ADMIN_SUB;
  } catch { return false; }
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  if (!(await isAdmin(ctx.request))) return Response.json({ error: "forbidden" }, { status: 403 });
  let body: any; try { body = await ctx.request.json(); } catch { return Response.json({ error: "bad json" }, { status: 400 }); }
  const id = String(body.id || "");
  if (!id) return Response.json({ error: "id required" }, { status: 400 });
  const status = body.action === "reject" ? "rejected" : "approved";
  const now = Date.now();
  await ctx.env.page_db
    .prepare("UPDATE jobs SET status=?1, updated_at=?2 WHERE id=?3 AND status IN ('pending','approved','rejected')")
    .bind(status, now, id).run();
  return Response.json({ ok: true, status });
};
