/// <reference types="@cloudflare/workers-types" />
// POST /api/admin/update {id, patch} — 관리자(cocy)만. 승인 전 잡 요청내용 마사지.
// patch 허용 키: request(edit), content/title/vertical/mood/palette(create). pending/rejected 만 편집.

interface Env { page_db: D1Database; }

const GOOGLE_CLIENT = "315180918727-3d9rfmpa36r365qna9smdsvrod441jhd.apps.googleusercontent.com";
const ADMIN_SUB = "111993084009681810615";
const ALLOWED = new Set(["request", "content", "title", "vertical", "palette", "mood"]);

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
  const patch = body.patch || {};
  if (!id) return Response.json({ error: "id required" }, { status: 400 });

  const job = await ctx.env.page_db.prepare("SELECT payload_json,status FROM jobs WHERE id=?1").bind(id).first<{ payload_json: string; status: string }>();
  if (!job) return Response.json({ error: "not found" }, { status: 404 });
  if (job.status !== "pending" && job.status !== "rejected") return Response.json({ error: "이미 처리된 요청은 편집 불가" }, { status: 409 });

  let payload: any = {};
  try { payload = JSON.parse(job.payload_json || "{}"); } catch {}
  for (const k of Object.keys(patch)) {
    if (ALLOWED.has(k)) payload[k] = patch[k];
  }
  const now = Date.now();
  await ctx.env.page_db.prepare("UPDATE jobs SET payload_json=?1, updated_at=?2 WHERE id=?3").bind(JSON.stringify(payload), now, id).run();
  return Response.json({ ok: true, payload });
};
