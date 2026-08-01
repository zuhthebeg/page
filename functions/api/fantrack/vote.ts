/// <reference types="@cloudflare/workers-types" />
// POST /api/fantrack/vote — 콘텐츠 좋아요(관심있음) 단일 액션, 로그인 필요
// body: { content_id: string }
// 인증: page.cocy.io preorder.ts와 동일 패턴(Bearer JWT의 sub만 추출, 서명검증은 relay 발급 신뢰)

interface Env {
  page_db: D1Database;
}

function getSub(req: Request): string | null {
  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) return null;
  try {
    const p = JSON.parse(
      atob(auth.slice(7).split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return typeof p.sub === "string" ? p.sub : null;
  } catch {
    return null;
  }
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const userId = getSub(ctx.request);
  if (!userId) {
    return Response.json({ error: "login_required" }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await ctx.request.json();
  } catch {
    /* ignore */
  }
  const contentId = typeof body.content_id === "string" ? body.content_id : "";
  if (!contentId) {
    return Response.json({ error: "bad_content_id" }, { status: 400 });
  }

  const db = ctx.env.page_db;
  const exists = await db
    .prepare("SELECT 1 FROM content_votes WHERE content_id = ? AND user_id = ?")
    .bind(contentId, userId)
    .first();

  let voted: boolean;
  if (exists) {
    await db
      .prepare("DELETE FROM content_votes WHERE content_id = ? AND user_id = ?")
      .bind(contentId, userId)
      .run();
    voted = false;
  } else {
    await db
      .prepare(
        "INSERT INTO content_votes (content_id, user_id, created_at) VALUES (?,?,?)"
      )
      .bind(contentId, userId, Date.now())
      .run();
    voted = true;
  }

  const row = await db
    .prepare("SELECT COUNT(*) AS cnt FROM content_votes WHERE content_id = ?")
    .bind(contentId)
    .first<{ cnt: number }>();

  return Response.json(
    { voted, votes: row?.cnt ?? 0 },
    { headers: { "access-control-allow-origin": "*" } }
  );
};
