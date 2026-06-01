/// <reference types="@cloudflare/workers-types" />
// GET /assets/<key> — R2(page-assets)에서 이미지 서빙 (불변 캐시)

interface Env { page_assets: R2Bucket; }

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const parts = ctx.params.key;
  const key = Array.isArray(parts) ? parts.join("/") : String(parts || "");
  if (!key) return new Response("not found", { status: 404 });
  const obj = await ctx.env.page_assets.get(key);
  if (!obj) return new Response("not found", { status: 404 });
  const h = new Headers();
  obj.writeHttpMetadata(h);
  h.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(obj.body, { headers: h });
};
