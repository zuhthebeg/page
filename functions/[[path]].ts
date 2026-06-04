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
  "", "new", "edit", "admin", "api", "auth", "portal", "assets", "static",
  "favicon.ico", "robots.txt", "sitemap.xml", "index.html", "404.html",
]);

export const onRequest: PagesFunction<Env> = async (ctx) => {
  const url = new URL(ctx.request.url);
  const segs = url.pathname.split("/").filter(Boolean);
  const first = (segs[0] ?? "").toLowerCase();

  // 예약어 / 정적 파일(점 포함) → 정적 셸로 패스스루
  if (RESERVED.has(first) || first.includes(".")) return ctx.next();

  const slug = first;

  // 0) 만료 체크 — KV exp:{slug} = 만료 epoch(ms). 키 없으면 영구(기본).
  const expRaw = await ctx.env.page_cache.get(`exp:${slug}`);
  if (expRaw && Number(expRaw) > 0 && Number(expRaw) < Date.now()) return expiredHtml();

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

function expiredHtml(): Response {
  const body = `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>만료된 페이지</title>
<style>body{margin:0;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:#0e1014;color:#e7e9ee;font-family:system-ui,-apple-system,"Noto Sans KR",sans-serif;text-align:center;padding:24px}
h1{font-size:1.4rem;margin:0}p{color:#9aa0ab;margin:0;line-height:1.6;font-size:.95rem}a{margin-top:8px;color:#ffb648;text-decoration:none;font-weight:600}</style></head>
<body><div style="font-size:2.4rem">⌛</div><h1>유지 기간이 지난 페이지예요</h1>
<p>이 페이지는 설정된 유지 기간이 만료되었습니다.<br>다시 발행하려면 새로 만들어 주세요.</p>
<a href="https://page.cocy.io/new">page.cocy.io에서 새로 만들기 →</a></body></html>`;
  return new Response(body, { status: 410, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}

function bumpView(env: Env, slug: string): Promise<unknown> {
  return env.page_db
    .prepare("UPDATE sites SET view_count = view_count + 1 WHERE slug = ?1")
    .bind(slug)
    .run()
    .catch(() => undefined);
}
