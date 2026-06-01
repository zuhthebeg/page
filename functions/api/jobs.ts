/// <reference types="@cloudflare/workers-types" />
// 잡 큐 — 생성/수정 요청을 받아 pending 으로 적재(에이전트가 드레인).
// POST  {type:'create'|'edit', ...}  (Bearer cocy 토큰 필요)
// GET   ?id=<jobId>  → 상태/결과 (클라 폴링)

interface Env {
  page_db: D1Database;
}

// page 자체 인증: Google ID 토큰(GSI credential)을 구글 tokeninfo 로 직접 검증.
// relay 비의존. 소유자 식별 = 구글 sub.
const GOOGLE_CLIENT = "315180918727-3d9rfmpa36r365qna9smdsvrod441jhd.apps.googleusercontent.com";

async function getUser(req: Request): Promise<{ id: string; email?: string } | null> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const idToken = auth.slice(7);
  try {
    const r = await fetch("https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(idToken));
    if (!r.ok) return null;
    const info: any = await r.json();
    if (info.aud !== GOOGLE_CLIENT) return null;   // 클라 불일치 거부
    return info.sub ? { id: info.sub, email: info.email } : null;
  } catch { return null; }
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const user = await getUser(ctx.request);
  if (!user) return json({ error: "login required" }, 401);

  let body: any;
  try { body = await ctx.request.json(); } catch { return json({ error: "bad json" }, 400); }

  const now = Date.now();
  const id = `job-${now.toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  if (body.type === "edit") {
    const slug = String(body.slug || "");
    const request = String(body.request || "").trim();
    if (!slug || !request) return json({ error: "slug+request required" }, 400);
    const site = await ctx.env.page_db.prepare("SELECT owner_id FROM sites WHERE slug=?1").bind(slug).first<{ owner_id: string }>();
    if (!site) return json({ error: "site not found" }, 404);
    if (site.owner_id !== user.id) return json({ error: "not owner" }, 403);
    await ctx.env.page_db.prepare(
      "INSERT INTO jobs (id,type,status,owner_id,slug,payload_json,created_at,updated_at) VALUES (?1,'edit','pending',?2,?3,?4,?5,?5)"
    ).bind(id, user.id, slug, JSON.stringify({ request }), now).run();
    return json({ jobId: id, status: "pending" });
  }

  if (body.type === "create") {
    const spec = body.spec || body;
    await ctx.env.page_db.prepare(
      "INSERT INTO jobs (id,type,status,owner_id,payload_json,created_at,updated_at) VALUES (?1,'create','pending',?2,?3,?4,?4)"
    ).bind(id, user.id, JSON.stringify(spec), now).run();
    return json({ jobId: id, status: "pending" });
  }

  return json({ error: "unknown type" }, 400);
};

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const id = new URL(ctx.request.url).searchParams.get("id");
  if (!id) return json({ error: "id required" }, 400);
  const j = await ctx.env.page_db.prepare(
    "SELECT id,type,status,slug,result_json,updated_at FROM jobs WHERE id=?1"
  ).bind(id).first();
  if (!j) return json({ error: "not found" }, 404);
  return json(j);
};

function json(o: unknown, status = 200): Response {
  return Response.json(o, { status, headers: { "cache-control": "no-store" } });
}
