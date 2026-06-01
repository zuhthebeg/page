/// <reference types="@cloudflare/workers-types" />
// POST /api/upload — 클라에서 압축한 이미지를 R2(page-assets)에 저장하고 공개 URL 반환.
// body: 이미지 바이너리 (Content-Type: image/jpeg|png). Bearer 구글 토큰 필요.

interface Env {
  page_assets: R2Bucket;
}

const GOOGLE_CLIENT = "315180918727-3d9rfmpa36r365qna9smdsvrod441jhd.apps.googleusercontent.com";

async function getUser(req: Request): Promise<{ id: string } | null> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    const r = await fetch("https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(auth.slice(7)));
    if (!r.ok) return null;
    const info: any = await r.json();
    if (info.aud !== GOOGLE_CLIENT) return null;
    return info.sub ? { id: info.sub } : null;
  } catch { return null; }
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const user = await getUser(ctx.request);
  if (!user) return json({ error: "login required" }, 401);

  const ct = ctx.request.headers.get("content-type") || "image/jpeg";
  if (!ct.startsWith("image/")) return json({ error: "image only" }, 415);

  const buf = await ctx.request.arrayBuffer();
  if (buf.byteLength === 0) return json({ error: "empty" }, 400);
  if (buf.byteLength > 4_000_000) return json({ error: "too large (압축 후 업로드)" }, 413);

  const ext = ct.includes("png") ? "png" : ct.includes("webp") ? "webp" : "jpg";
  const key = `img/${user.id}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  await ctx.env.page_assets.put(key, buf, { httpMetadata: { contentType: ct } });

  return json({ url: `https://page.cocy.io/assets/${key}`, key });
};

function json(o: unknown, status = 200): Response {
  return Response.json(o, { status, headers: { "cache-control": "no-store" } });
}
