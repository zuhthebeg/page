/// <reference types="@cloudflare/workers-types" />
// GET /api/private-feed — 메인(/) 목록의 비공개 항목. Bearer Google ID 토큰 필요.
//  - 로그인 사용자: 본인 소유 D1 사이트 중 listed=0
//  - 관리자(cocy): + 정적 비공개 페이지(noindex·unlisted) — scripts/gen-feed.cjs 가 생성한 _private-feed.json

import STATIC_PRIVATE from "./_private-feed.json";

interface Env {
  page_db: D1Database;
}

const GOOGLE_CLIENT = "315180918727-3d9rfmpa36r365qna9smdsvrod441jhd.apps.googleusercontent.com";
const ADMIN_SUB = "111993084009681810615";

async function getSub(req: Request): Promise<string | null> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    const r = await fetch("https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(auth.slice(7)));
    if (!r.ok) return null;
    const info: any = await r.json();
    return info.aud === GOOGLE_CLIENT && info.sub ? info.sub : null;
  } catch { return null; }
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const sub = await getSub(ctx.request);
  if (!sub) return Response.json({ error: "login required" }, { status: 401 });

  const { results } = await ctx.env.page_db
    .prepare(
      `SELECT slug, title, description, published_at, updated_at
         FROM sites
        WHERE owner_id = ?1 AND listed = 0 AND status = 'published'
        LIMIT 300`
    )
    .bind(sub)
    .all();

  const items: { slug: string; title: string; desc: string; date: string | number | null }[] =
    (results ?? []).map((s: any) => ({ slug: s.slug, title: s.title || s.slug, desc: s.description || "", date: s.published_at ?? s.updated_at ?? null }));

  if (sub === ADMIN_SUB) {
    const seen = new Set(items.map((x) => x.slug));
    for (const x of STATIC_PRIVATE as any[]) {
      if (seen.has(x.slug)) { const i = items.find((y) => y.slug === x.slug)!; i.date = x.date || i.date; i.desc ||= x.desc; continue; }
      items.push({ slug: x.slug, title: x.title, desc: x.desc, date: x.date });
    }
  }

  return Response.json({ items }, { headers: { "cache-control": "no-store" } });
};
