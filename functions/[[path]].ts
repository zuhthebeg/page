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

  // 0) 만료 체크 — KV exp:{slug} = 만료 epoch(ms). 키 없으면 영구(신규 발행은 +90일 기본).
  // 만료돼도 삭제/차단하지 않고 광고 배너를 달아 계속 서빙한다(무료 유지 조건).
  const expRaw = await ctx.env.page_cache.get(`exp:${slug}`);
  const expired = !!expRaw && Number(expRaw) > 0 && Number(expRaw) < Date.now();

  // 1) KV 핫캐시 (발행 HTML의 서빙 store)
  const cached = await ctx.env.page_cache.get(`html:${slug}`);
  if (cached) {
    ctx.waitUntil(bumpView(ctx.env, slug));
    return html(expired ? injectAd(cached) : cached);
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
  return html(expired ? injectAd(row.html) : row.html);
};

// 만료된 페이지에 다는 광고 블록: 애드센스(콘솔에서 page.cocy.io 승인 후 표시) + 서비스 홍보 바(닫기 가능)
function injectAd(body: string): string {
  const ad = `
<!-- free-tier ad: 유지기간 만료 후 무료 유지 조건 -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6634731722045607" crossorigin="anonymous"></script>
<div id="pgad" style="position:fixed;left:0;right:0;bottom:0;z-index:2147483000;background:rgba(14,16,20,.94);color:#e7e9ee;font-family:system-ui,-apple-system,'Noto Sans KR',sans-serif;font-size:13px;line-height:1.45;display:flex;align-items:center;gap:10px;padding:10px 14px;backdrop-filter:blur(6px)">
<span style="flex:1;min-width:0">이 페이지는 <a href="https://page.cocy.io" style="color:#ffb648;text-decoration:none;font-weight:600">page.cocy.io</a>에서 만들어졌어요 — 나만의 페이지도 무료로</span>
<a href="https://page.cocy.io/new" style="color:#0e1014;background:#ffb648;border-radius:20px;padding:6px 13px;text-decoration:none;font-weight:700;white-space:nowrap">만들기</a>
<button onclick="document.getElementById('pgad').remove()" aria-label="닫기" style="background:none;border:0;color:#9aa0ab;font-size:17px;cursor:pointer;padding:0 2px">×</button>
</div>`;
  return body.includes("</body>") ? body.replace("</body>", ad + "\n</body>") : body + ad;
}

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
