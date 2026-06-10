/// <reference types="@cloudflare/workers-types" />
// POST /api/preorder — 유료 출시 사전등록(수요 측정 전용, 결제 없음)
// body: { vertical: "wedding"|"menu"|..., email?: string }

interface Env {
  page_db: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  let body: Record<string, unknown> = {};
  try {
    body = await ctx.request.json();
  } catch {
    /* ignore */
  }
  const vertical = typeof body.vertical === "string" ? body.vertical : "";
  if (!/^[a-z]{2,24}$/.test(vertical)) {
    return Response.json({ error: "bad vertical" }, { status: 400 });
  }
  const email =
    typeof body.email === "string" && /.+@.+\..+/.test(body.email)
      ? body.email.slice(0, 120)
      : null;

  // 로그인 토큰이 있으면 sub만 기록(수요 측정 용도라 서명검증 생략 — 권한 부여 없음)
  let userId: string | null = null;
  const auth = ctx.request.headers.get("authorization") || "";
  if (auth.startsWith("Bearer ")) {
    try {
      const p = JSON.parse(
        atob(auth.slice(7).split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
      );
      userId = typeof p.sub === "string" ? p.sub : null;
    } catch {
      /* ignore */
    }
  }

  await ctx.env.page_db
    .prepare(
      "INSERT INTO preorders (id, user_id, vertical, email, created_at) VALUES (?,?,?,?,?)"
    )
    .bind(crypto.randomUUID(), userId, vertical, email, Date.now())
    .run();

  return Response.json({ ok: true });
};
