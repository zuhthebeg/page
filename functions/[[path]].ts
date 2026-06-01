/// <reference types="@cloudflare/workers-types" />
// 발행된 페이지 서빙: page.cocy.io/{slug}
// KV(html:{slug}) 핫캐시 우선 → 미스 시 D1 current version → KV 재굽기.
// 예약 슬러그/정적자산은 next()로 흘려보냄(포털·/new·/edit 등 정적 셸).

interface Env {
  page_db: D1Database;
  page_cache: KVNamespace;
  page_assets: R2Bucket;
}

// 사용자가 점유할 수 없는 슬러그
const RESERVED = new Set([
  "", "new", "edit", "api", "auth", "portal", "assets", "static",
  "favicon.ico", "robots.txt", "sitemap.xml", "index.html", "404.html",
]);

export const onRequest: PagesFunction<Env> = async (ctx) => {
  const url = new URL(ctx.request.url);
  const segs = url.pathname.split("/").filter(Boolean);
  const first = (segs[0] ?? "").toLowerCase();

  // 예약어 / 정적 파일(점 포함) → 정적 셸로 패스스루
  if (RESERVED.has(first) || first.includes(".")) return ctx.next();

  const slug = first;

  // 1) KV 핫캐시 (발행 HTML의 서빙 store)
  const cached = await ctx.env.page_cache.get(`html:${slug}`);
  if (cached) {
    ctx.waitUntil(bumpView(ctx.env, slug));
    return html(cached);
  }

  // 2) D1 fallback — 라이브 버전 HTML 조회 후 KV 재굽기
  const row = await ctx.env.page_db
    .prepare(
      `SELECT v.html AS html
         FROM sites s JOIN versions v ON v.id = s.current_version_id
        WHERE s.slug = ?1 AND s.status = 'published'`
    )
    .bind(slug)
    .first<{ html: string }>();

  if (!row?.html) return ctx.next(); // 미발행 → 정적 404

  await ctx.env.page_cache.put(`html:${slug}`, row.html); // 영구(발행 시 갱신)
  ctx.waitUntil(bumpView(ctx.env, slug));
  return html(row.html);
};

function html(body: string): Response {
  return new Response(body, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}

function bumpView(env: Env, slug: string): Promise<unknown> {
  return env.page_db
    .prepare("UPDATE sites SET view_count = view_count + 1 WHERE slug = ?1")
    .bind(slug)
    .run()
    .catch(() => undefined);
}
